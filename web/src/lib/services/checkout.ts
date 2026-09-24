import mongoose from "mongoose";
import PaymentOrder from "../models/payment-order.model";
import PayoutObligation from "../models/payout-obligation.model";
import { Job, Payment, User } from "../models";
import { ApiError } from "../api-error";
import { connectDB } from "../db";
import { assertGatewayConfigured, createProviderOrder, verifyProviderPayment, reconcileProviderPayment, recoverProviderOrder, Gateway } from "./payment-providers";

export async function createCheckout(userId: string, jobId: string, gateway: Gateway) {
  assertGatewayConfigured(gateway);
  await connectDB();
  // Index creation must succeed before accepting money; never drop existing indexes.
  await assertPaymentStorage();
  const job = await Job.findOne({ _id: jobId, customerId: userId, status: "completed" });
  if (!job?.workerId || !Number.isFinite(job.finalPrice) || job.finalPrice <= 0 || job.materials.length || job.additionalCharges.length) throw new ApiError(409, "A completed job with a confirmed final price is required", "PRICE_NOT_CONFIRMED");
  const amountMinor = Math.round(job.finalPrice * 100);
  if (!Number.isSafeInteger(amountMinor) || job.finalPrice !== amountMinor / 100) throw new ApiError(400, "Invalid amount", "INVALID_AMOUNT");
  const basisPoints = Number(process.env.PLATFORM_FEE_BPS);
  if (!process.env.PLATFORM_FEE_BPS || !Number.isInteger(basisPoints) || basisPoints < 0 || basisPoints > 10000) throw new ApiError(503, "Platform fee is not configured", "PAYMENT_VERIFICATION_UNAVAILABLE");
  let order = await PaymentOrder.findOne({ jobId });
  if (!order) {
    try {
      order = await PaymentOrder.create({ jobId, customerId: userId, workerId: job.workerId, gateway, amountMinor, feeMinor: Math.round(amountMinor * basisPoints / 10000) });
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === 11000)) throw error;
      order = await PaymentOrder.findOne({ jobId });
      if (!order) throw error;
      return checkoutResponse(order, gateway);
    }
    const customer = await User.findById(userId).select("phone").lean();
    // Ambiguous provider failures leave 'creating' in place for reconciliation, never issue a second charge order.
    const created = await createProviderOrder(gateway, { reference: "kd_" + order._id, amountMinor, customerId: userId, phone: customer.phone });
    order.orderId = created.orderId; order.sessionId = created.sessionId; order.keyId = created.keyId; order.status = "pending";
    await order.save();
  }
  return checkoutResponse(order, gateway);
}
function checkoutResponse(order: { gateway: string; status: string; orderId: string; amountMinor: number; sessionId: string; keyId: string }, gateway: Gateway) {
  if (order.gateway !== gateway) throw new ApiError(409, "Continue with the gateway selected for this job", "GATEWAY_LOCKED");
  if (order.status !== "pending") throw new ApiError(409, "Payment is complete or requires reconciliation", "PAYMENT_RECONCILIATION_REQUIRED");
  return { provider: gateway, orderId: order.orderId, amount: order.amountMinor, currency: "INR", sessionId: order.sessionId, keyId: order.keyId, environment: process.env.CASHFREE_ENV === "production" ? "production" : "sandbox" };
}
export async function confirmCheckout(userId: string, jobId: string, paymentId?: string, signature?: string) {
  await connectDB();
  const order = await PaymentOrder.findOne({ jobId, customerId: userId });
  if (!order?.orderId) throw new ApiError(404, "Payment order not found", "NOT_FOUND");
  if (order.status === "completed") return { status: "completed" };
  const confirmedId = await verifyProviderPayment(order.gateway, order.orderId, order.amountMinor, paymentId, signature);
  return finalizeCheckout(order, confirmedId);
}
async function finalizeCheckout(order: { _id: mongoose.Types.ObjectId; jobId: mongoose.Types.ObjectId; customerId: mongoose.Types.ObjectId; workerId: mongoose.Types.ObjectId; amountMinor: number; feeMinor: number; gateway: string }, confirmedId: string) {
  const jobId = String(order.jobId), userId = String(order.customerId);
  await mongoose.connection.transaction(async session => {
    const locked = await PaymentOrder.findOneAndUpdate({ _id: order._id, status: "pending" }, { $set: { status: "completed", paymentId: confirmedId } }, { session, new: true });
    if (!locked) {
      const existing = await PaymentOrder.findById(order._id).session(session);
      if (existing?.status === "completed") return;
      throw new ApiError(409, "Payment needs reconciliation", "PAYMENT_RECONCILIATION_REQUIRED");
    }
    const job = await Job.findOneAndUpdate({ _id: jobId, customerId: userId, workerId: order.workerId, status: "completed", finalPrice: order.amountMinor / 100 }, { $set: { status: "paid" }, $inc: { __v: 1 } }, { session, new: true });
    if (!job) throw new ApiError(409, "Job changed; payment needs reconciliation", "PAYMENT_RECONCILIATION_REQUIRED");
    const [payment] = await Payment.create([{ jobId, customerId: userId, workerId: order.workerId, amount: order.amountMinor / 100, platformFee: order.feeMinor / 100, workerEarning: (order.amountMinor - order.feeMinor) / 100, status: "completed", paymentMethod: order.gateway, transactionId: order.gateway + ":" + confirmedId }], { session });
    await PayoutObligation.create([{ paymentId: payment._id, workerId: order.workerId, amountMinor: order.amountMinor - order.feeMinor, gateway: order.gateway, providerPaymentId: confirmedId, status: "awaiting_settlement" }], { session });
  });
  return { status: "completed" };
}

export async function reconcileCheckout(jobId: string, recoveryOrderId?: string) {
  await connectDB();
  const order = await PaymentOrder.findOne({ jobId });
  if (!order) throw new ApiError(404, "Payment order not found", "NOT_FOUND");
  if (order.status === "completed") return { status: "completed" };
  if (order.status === "creating") {
    const id = order.gateway === "cashfree" ? "kd_" + order._id : recoveryOrderId;
    if (!id) throw new ApiError(409, "Find the existing order in the provider dashboard using its receipt reference", "ORDER_RECOVERY_REQUIRED");
    const recovered = await recoverProviderOrder(order.gateway, id, "kd_" + order._id, order.amountMinor);
    const updated = await PaymentOrder.findOneAndUpdate({ _id: order._id, status: "creating" }, { $set: { ...recovered, status: "pending" } }, { new: true });
    if (!updated) throw new ApiError(409, "Order changed; retry reconciliation", "CONFLICT");
    Object.assign(order, recovered);
  }
  const paymentId = await reconcileProviderPayment(order.gateway, order.orderId, order.amountMinor);
  return finalizeCheckout(order, paymentId);
}

export async function assertPaymentStorage() {
  if (!mongoose.connection.db) throw new ApiError(503, "Payment storage unavailable", "PAYMENT_STORAGE_UNAVAILABLE");
  const hello = await mongoose.connection.db.admin().command({ hello: 1 });
  if ((!hello.setName && hello.msg !== "isdbgrid") || hello.logicalSessionTimeoutMinutes == null) throw new ApiError(503, "Payments require transactional database storage", "PAYMENT_STORAGE_UNAVAILABLE");
  // createIndexes never drops indexes. Duplicate legacy data fails closed for manual repair.
  await Promise.all([PaymentOrder.createIndexes(), Payment.createIndexes(), PayoutObligation.createIndexes()]);
}
