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
export async function GET(request: NextRequest) {
  try {
    const actor = await requireRole(request, ["admin", "worker"]);
    await connectDB();
    const rows = await PayoutObligation.find(actor.role === "admin" ? {} : { workerId: actor.userId }).select(actor.role === "worker" ? "-statementReference -reconciledBy" : "").sort({ createdAt: -1 }).limit(100).lean();
    return successResponse(rows);
  } catch (error) { return handleApiError(error); }
}
export async function POST(request: NextRequest) {
  try {
    const actor = await requireRole(request, ["admin"]);
    const body = z.object({
      obligationId: z.string().regex(/^[a-f\d]{24}$/i), amountMinor: z.number().int().positive(),
      bankReference: z.string().trim().min(6).max(100).regex(/^[A-Za-z0-9\-/_]+$/),
      transferredAt: z.string().datetime(), statementReference: z.string().trim().min(6).max(300),
      transferVerified: z.literal(true),
    }).strict().parse(await request.json());
    if (new Date(body.transferredAt).getTime() > Date.now()) throw new ApiError(400, "Transfer date cannot be in the future", "INVALID_REQUEST");
    await connectDB();
    await PayoutObligation.createIndexes();
    const obligation = await PayoutObligation.findById(body.obligationId);
    if (!obligation || obligation.status === "paid") throw new ApiError(409, "Payout is missing or already reconciled", "CONFLICT");
    if (obligation.amountMinor !== body.amountMinor) throw new ApiError(400, "Transferred amount does not match the obligation", "AMOUNT_MISMATCH");
    const payment = await Payment.findOne({ _id: obligation.paymentId, status: "completed" });
    const order = payment && await PaymentOrder.findOne({ jobId: payment.jobId, status: "completed" });
    if (!order) throw new ApiError(409, "Confirmed payment not found", "PAYMENT_PENDING");
    const providerId = await reconcileProviderPayment(order.gateway, order.orderId, order.amountMinor);
    if (providerId !== obligation.providerPaymentId) throw new ApiError(409, "Provider payment mismatch", "INVALID_PAYMENT_PROOF");
    const result = await mongoose.connection.transaction(async session => {
      const currentPayment = await Payment.findOneAndUpdate({ _id: payment._id, status: "completed" }, { $set: { updatedAt: new Date() } }, { session, new: true });
      if (!currentPayment) throw new ApiError(409, "Payment changed", "CONFLICT");
      const updated = await PayoutObligation.findOneAndUpdate({ _id: obligation._id, status: { $ne: "paid" }, amountMinor: body.amountMinor }, { $set: { status: "paid", bankReference: body.bankReference.toUpperCase(), transferredAt: new Date(body.transferredAt), statementReference: body.statementReference, reconciledBy: actor.userId, reconciledAt: new Date(), reconciliationMethod: "manual_bank_statement" } }, { session, new: true, runValidators: true });
      if (!updated) throw new ApiError(409, "Payout already reconciled", "CONFLICT");
      return updated;
    });
    return successResponse(result, "Manual bank transfer reconciled");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === 11000) return handleApiError(new ApiError(409, "Bank reference already recorded", "DUPLICATE_TRANSFER"));
    return handleApiError(error);
  }
}
