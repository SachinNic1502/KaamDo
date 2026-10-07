import mongoose from "mongoose";
import PaymentOrder from "../models/payment-order.model";
import PayoutObligation from "../models/payout-obligation.model";
import { Job, Payment, User } from "../models";
import { ApiError } from "../api-error";
import { connectDB } from "../db";
import {
  assertGatewayConfigured,
  createProviderOrder,
  verifyProviderPayment,
  reconcileProviderPayment,
  recoverProviderOrder,
  Gateway,
} from "./payment-providers";
import { RealtimeService } from "./realtime";
import { resolvePlatformFee } from "./commission";

export async function createCheckout(userId: string, jobId: string, gateway: Gateway) {
  assertGatewayConfigured(gateway);
  await connectDB();
  await assertPaymentStorage();

  const job = await Job.findOne({
    _id: jobId,
    customerId: userId,
    status: { $in: ["completed", "payment_pending", "work_started", "in_progress"] },
  });
  if (!job?.workerId) {
    throw new ApiError(404, "A valid job with an assigned worker is required", "JOB_NOT_FOUND");
  }

  // Ensure total payable amount is resolved including approved extra charges & materials
  const basePrice = job.finalPrice || job.estimatedPrice || 299;
  const materialsTotal = (job.materials || []).reduce(
    (sum: number, m: any) => sum + (m.totalPrice || (m.quantity * m.unitPrice) || 0),
    0
  );
  const approvedAdditionalCharges = (job.additionalCharges || []).filter(
    (c: any) => c.status === "approved"
  );
  const additionalChargesTotal = approvedAdditionalCharges.reduce(
    (sum: number, c: any) => sum + (c.amount || 0),
    0
  );
  const finalPrice = Math.round(basePrice + materialsTotal + additionalChargesTotal);

  if (!Number.isFinite(finalPrice) || finalPrice <= 0) {
    throw new ApiError(409, "A valid confirmed price is required", "PRICE_NOT_CONFIRMED");
  }

  const amountMinor = Math.round(finalPrice * 100);
  const { platformFee } = await resolvePlatformFee(job.categoryId, finalPrice);
  const feeMinor = Math.round(platformFee * 100);

  let order = await PaymentOrder.findOne({ jobId });
  if (!order) {
    try {
      order = await PaymentOrder.create({
        jobId,
        customerId: userId,
        workerId: job.workerId,
        gateway,
        amountMinor,
        feeMinor,
      });
    } catch (error: any) {
      if (error && error.code === 11000) {
        order = await PaymentOrder.findOne({ jobId });
        if (!order) throw error;
        return checkoutResponse(order, gateway);
      }
      throw error;
    }

    const customer = await User.findById(userId).select("phone").lean();
    const created = await createProviderOrder(gateway, {
      reference: "kd_" + order._id,
      amountMinor,
      customerId: userId,
      phone: customer?.phone || "9999999999",
    });

    order.orderId = created.orderId;
    order.sessionId = created.sessionId;
    order.keyId = created.keyId;
    order.status = "pending";
    await order.save();
  }

  return checkoutResponse(order, gateway);
}

function checkoutResponse(
  order: { gateway: string; status: string; orderId: string; amountMinor: number; sessionId: string; keyId: string },
  gateway: Gateway
) {
  if (order.gateway !== gateway) {
    throw new ApiError(409, "Continue with the gateway selected for this job", "GATEWAY_LOCKED");
  }
  if (order.status !== "pending") {
    throw new ApiError(409, "Payment is complete or requires reconciliation", "PAYMENT_RECONCILIATION_REQUIRED");
  }
  return {
    provider: gateway,
    orderId: order.orderId,
    amount: order.amountMinor,
    currency: "INR",
    sessionId: order.sessionId,
    keyId: order.keyId,
    environment: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox",
  };
}

export async function confirmCheckout(userId: string, jobId: string, paymentId?: string, signature?: string) {
  await connectDB();
  const order = await PaymentOrder.findOne({ jobId, customerId: userId });
  if (!order?.orderId) throw new ApiError(404, "Payment order not found", "NOT_FOUND");
  if (order.status === "completed") return { status: "completed" };

  const confirmedId = await verifyProviderPayment(order.gateway, order.orderId, order.amountMinor, paymentId, signature);
  return finalizeCheckout(order, confirmedId);
}

async function finalizeCheckout(
  order: {
    _id: mongoose.Types.ObjectId;
    jobId: mongoose.Types.ObjectId;
    customerId: mongoose.Types.ObjectId;
    workerId: mongoose.Types.ObjectId;
    amountMinor: number;
    feeMinor: number;
    gateway: string;
  },
  confirmedId: string
) {
  const jobId = String(order.jobId);
  const userId = String(order.customerId);
  const workerId = String(order.workerId);

  const executeSettlement = async (session?: mongoose.ClientSession) => {
    const opts = session ? { session, new: true } : { new: true };
    const createOpts = session ? { session } : undefined;

    const locked = await PaymentOrder.findOneAndUpdate(
      { _id: order._id, status: "pending" },
      { $set: { status: "completed", paymentId: confirmedId } },
      opts
    );

    if (!locked) {
      const existing = session
        ? await PaymentOrder.findById(order._id).session(session)
        : await PaymentOrder.findById(order._id);
      if (existing?.status === "completed") return;
      throw new ApiError(409, "Payment needs reconciliation", "PAYMENT_RECONCILIATION_REQUIRED");
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, customerId: userId, workerId: order.workerId },
      { $set: { status: "paid" }, $inc: { __v: 1 } },
      opts
    );

    if (!job) throw new ApiError(409, "Job not found for settlement", "PAYMENT_RECONCILIATION_REQUIRED");

    const payment = await Payment.findOneAndUpdate(
      { jobId: new mongoose.Types.ObjectId(jobId) },
      {
        $set: {
          customerId: new mongoose.Types.ObjectId(userId),
          workerId: order.workerId,
          amount: order.amountMinor / 100,
          platformFee: order.feeMinor / 100,
          workerEarning: (order.amountMinor - order.feeMinor) / 100,
          status: "completed",
          paymentMethod: order.gateway,
          transactionId: order.gateway + ":" + confirmedId,
        },
      },
      { upsert: true, ...opts }
    );

    await PayoutObligation.findOneAndUpdate(
      { paymentId: payment._id },
      {
        $set: {
          workerId: order.workerId,
          amountMinor: order.amountMinor - order.feeMinor,
          gateway: order.gateway,
          providerPaymentId: confirmedId,
          status: "awaiting_settlement",
        },
      },
      { upsert: true, ...opts }
    );
  };

  try {
    await mongoose.connection.transaction(executeSettlement);
  } catch (err: any) {
    if (
      err?.message?.includes("Transaction numbers are only allowed on a replica set") ||
      !(mongoose.connection as any).client?.options?.replicaSet
    ) {
      await executeSettlement();
    } else {
      throw err;
    }
  }

  // Real-time notification to worker and customer
  try {
    const earning = ((order.amountMinor - order.feeMinor) / 100).toFixed(2);
    await RealtimeService.sendRoleNotification({
      role: "worker",
      type: "payment_credited",
      title: "Payment Credited! 💰",
      message: `₹${earning} has been credited to your settlement account for job #${jobId.slice(-6)}.`,
      data: { jobId, paymentId: confirmedId },
    });
  } catch (e) {
    console.warn("Could not emit payment notification:", e);
  }

  return { status: "completed" };
}

export async function reconcileCheckout(jobId: string, recoveryOrderId?: string) {
  await connectDB();
  const order = await PaymentOrder.findOne({ jobId });
  if (!order) throw new ApiError(404, "Payment order not found", "NOT_FOUND");
  if (order.status === "completed") return { status: "completed" };

  if (order.status === "creating") {
    const id = order.gateway === "cashfree" ? "kd_" + order._id : recoveryOrderId;
    if (!id) {
      throw new ApiError(409, "Find existing order in dashboard", "ORDER_RECOVERY_REQUIRED");
    }
    const recovered = await recoverProviderOrder(order.gateway, id, "kd_" + order._id, order.amountMinor);
    const updated = await PaymentOrder.findOneAndUpdate(
      { _id: order._id, status: "creating" },
      { $set: { ...recovered, status: "pending" } },
      { new: true }
    );
    if (!updated) throw new ApiError(409, "Order changed; retry reconciliation", "CONFLICT");
    Object.assign(order, recovered);
  }

  const paymentId = await reconcileProviderPayment(order.gateway, order.orderId, order.amountMinor);
  return finalizeCheckout(order, paymentId);
}

export async function assertPaymentStorage() {
  if (!mongoose.connection.db) throw new ApiError(503, "Payment storage unavailable", "PAYMENT_STORAGE_UNAVAILABLE");
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  const isReplica = Boolean(hello.setName || hello.msg === "isdbgrid");
  if (!isReplica && process.env.NODE_ENV === "production") {
    throw new ApiError(503, "Payments require transactional database storage", "PAYMENT_STORAGE_UNAVAILABLE");
  }
  await Promise.all([PaymentOrder.createIndexes(), Payment.createIndexes(), PayoutObligation.createIndexes()]);
}
