import mongoose from "mongoose";
import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth-middleware";
import { connectDB } from "@/lib/db";
import { ApiError, handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import PayoutObligation from "@/lib/models/payout-obligation.model";
import Payment from "@/lib/models/payment.model";
import { reconcileProviderPayment } from "@/lib/services/payment-providers";
import PaymentOrder from "@/lib/models/payment-order.model";
import { Payout, WorkerProfile } from "@/lib/models";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireRole(request, ["admin", "worker"]);
    await connectDB();
    const rows = await PayoutObligation.find(actor.role === "admin" ? {} : { workerId: actor.userId })
      .select(actor.role === "worker" ? "-statementReference -reconciledBy" : "")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const payoutRequests = await Payout.find(actor.role === "admin" ? {} : { workerId: actor.userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const formattedRows = [
      ...payoutRequests.map((p: any) => ({
        _id: String(p._id),
        workerId: String(p.workerId),
        amount: p.amount,
        amountMinor: Math.round(p.amount * 100),
        status: p.status,
        createdAt: p.createdAt,
        type: "withdrawal_request",
      })),
      ...rows.map((r: any) => ({
        ...r,
        _id: String(r._id),
        workerId: String(r.workerId),
        amount: r.amountMinor ? r.amountMinor / 100 : 0,
        amountMinor: r.amountMinor,
        status: r.status,
        createdAt: r.createdAt,
        type: "earning_obligation",
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return successResponse(formattedRows);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole(request, ["admin", "worker"]);
    await connectDB();

    if (actor.role === "worker") {
      const workerBody = z.object({
        amount: z.number().positive(),
        currency: z.string().optional().default("INR"),
        beneficiaryName: z.string().optional(),
        paymentMethod: z.enum(["upi", "bank"]).optional().default("upi"),
        upiId: z.string().optional(),
        accountNumber: z.string().optional(),
        ifsc: z.string().optional(),
        accountHolderName: z.string().optional(),
      }).parse(await request.json());

      const workerProfile = await WorkerProfile.findOne({ userId: actor.userId });

      const resolvedAccountNumber =
        workerBody.accountNumber?.trim() || workerProfile?.bankDetails?.accountNumber || "PENDING";
      const resolvedIfsc =
        workerBody.ifsc?.trim() || workerProfile?.bankDetails?.ifsc || "PENDING";
      const resolvedUpi =
        workerBody.upiId?.trim() || workerBody.beneficiaryName?.trim() || workerProfile?.bankDetails?.upi;

      // Persist provided bank/UPI details to worker profile for future withdrawals
      if (workerProfile && (workerBody.accountNumber || workerBody.ifsc || workerBody.upiId)) {
        await WorkerProfile.updateOne(
          { userId: actor.userId },
          {
            $set: {
              "bankDetails.accountNumber": resolvedAccountNumber !== "PENDING" ? resolvedAccountNumber : workerProfile.bankDetails?.accountNumber,
              "bankDetails.ifsc": resolvedIfsc !== "PENDING" ? resolvedIfsc : workerProfile.bankDetails?.ifsc,
              "bankDetails.upi": resolvedUpi || workerProfile.bankDetails?.upi,
              "bankDetails.accountHolderName": workerBody.accountHolderName || workerProfile.bankDetails?.accountHolderName,
            },
          }
        );
      }

      const eligibleObligations = await PayoutObligation.find({
        workerId: actor.userId,
        status: { $in: ["awaiting_settlement", "eligible"] },
      });

      const totalEligibleMinor = eligibleObligations.reduce((sum: number, o: any) => sum + (o.amountMinor || 0), 0);
      const requestedMinor = Math.round(workerBody.amount * 100);

      if (totalEligibleMinor <= 0 || requestedMinor > totalEligibleMinor) {
        throw new ApiError(400, "Withdrawal amount exceeds available balance", "INSUFFICIENT_FUNDS");
      }

      const payout = await Payout.create({
        workerId: actor.userId,
        amount: workerBody.amount,
        status: "submitted",
        bankDetails: {
          accountNumber: resolvedAccountNumber,
          ifsc: resolvedIfsc,
          upi: resolvedUpi,
        },
      });

      let remainingToMark = requestedMinor;
      for (const ob of eligibleObligations) {
        if (remainingToMark <= 0) break;
        await PayoutObligation.findByIdAndUpdate(ob._id, { $set: { status: "submitted" } });
        remainingToMark -= ob.amountMinor;
      }

      return successResponse(
        {
          ...payout.toObject(),
          amount: payout.amount,
          amountMinor: Math.round(payout.amount * 100),
        },
        "Payout withdrawal request submitted successfully",
        201
      );
    }

    const body = z.object({
      obligationId: z.string().regex(/^[a-f\d]{24}$/i),
      amountMinor: z.number().int().positive(),
      bankReference: z.string().trim().min(6).max(100).regex(/^[A-Za-z0-9\-/_]+$/),
      transferredAt: z.string().datetime(),
      statementReference: z.string().trim().min(6).max(300),
      transferVerified: z.literal(true),
    }).strict().parse(await request.json());

    if (new Date(body.transferredAt).getTime() > Date.now()) {
      throw new ApiError(400, "Transfer date cannot be in the future", "INVALID_REQUEST");
    }

    await PayoutObligation.createIndexes();
    const obligation = await PayoutObligation.findById(body.obligationId);
    if (!obligation || obligation.status === "paid") {
      throw new ApiError(409, "Payout is missing or already reconciled", "CONFLICT");
    }
    if (obligation.amountMinor !== body.amountMinor) {
      throw new ApiError(400, "Transferred amount does not match the obligation", "AMOUNT_MISMATCH");
    }

    const payment = await Payment.findOne({ _id: obligation.paymentId, status: "completed" });
    if (!payment) throw new ApiError(409, "Confirmed payment not found", "PAYMENT_PENDING");

    // For online gateways (razorpay, cashfree), verify provider gateway record
    if (payment.paymentMethod !== "cash" && payment.paymentMethod !== "cod") {
      const order = await PaymentOrder.findOne({ jobId: payment.jobId, status: "completed" });
      if (!order) throw new ApiError(409, "Confirmed payment gateway order not found", "PAYMENT_PENDING");

      const providerId = await reconcileProviderPayment(order.gateway, order.orderId, order.amountMinor);
      if (providerId !== obligation.providerPaymentId) {
        throw new ApiError(409, "Provider payment mismatch", "INVALID_PAYMENT_PROOF");
      }
    }

    const result = await mongoose.connection.transaction(async session => {
      const currentPayment = await Payment.findOneAndUpdate(
        { _id: payment._id, status: "completed" },
        { $set: { updatedAt: new Date() } },
        { session, new: true }
      );
      if (!currentPayment) throw new ApiError(409, "Payment changed", "CONFLICT");

      const updated = await PayoutObligation.findOneAndUpdate(
        { _id: obligation._id, status: { $ne: "paid" }, amountMinor: body.amountMinor },
        {
          $set: {
            status: "paid",
            bankReference: body.bankReference.toUpperCase(),
            transferredAt: new Date(body.transferredAt),
            statementReference: body.statementReference,
            reconciledBy: actor.userId,
            reconciledAt: new Date(),
            reconciliationMethod: "manual_bank_statement",
          },
        },
        { session, new: true, runValidators: true }
      );
      if (!updated) throw new ApiError(409, "Payout already reconciled", "CONFLICT");
      return updated;
    });

    return successResponse(result, "Manual bank transfer reconciled");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) {
      return handleApiError(new ApiError(409, "Bank reference already recorded", "DUPLICATE_TRANSFER"));
    }
    return handleApiError(error);
  }
}
