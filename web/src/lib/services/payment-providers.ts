import { createHmac, timingSafeEqual } from "node:crypto";
import { ApiError } from "../api-error";
export type Gateway = "razorpay" | "cashfree";
function required(name: string) {
  const value = process.env[name];
  if (!value) throw new ApiError(503, "Payment provider is not configured", "PAYMENT_VERIFICATION_UNAVAILABLE");
  return value;
}
function config(gateway: Gateway) {
  if (gateway === "razorpay") return {
    base: "https://api.razorpay.com/v1", headers: { Authorization: "Basic " + Buffer.from(required("RAZORPAY_KEY_ID") + ":" + required("RAZORPAY_KEY_SECRET")).toString("base64") } as Record<string, string>,
  };
  return {
    base: process.env.CASHFREE_ENV === "production" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg",
    headers: { "x-client-id": required("CASHFREE_CLIENT_ID"), "x-client-secret": required("CASHFREE_CLIENT_SECRET"), "x-api-version": "2026-01-01" },
  };
}
async function request(gateway: Gateway, path: string, body?: unknown) {
  const { base, headers } = config(gateway);
  const response = await fetch(base + path, { method: body ? "POST" : "GET", headers: { ...headers, "Content-Type": "application/json" }, ...(body ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(15000), redirect: "error" });
  if (!response.ok) throw new ApiError(502, "Payment provider could not confirm this request", "PROVIDER_UNAVAILABLE");
  return response.json();
}
export function assertGatewayConfigured(gateway: Gateway) { config(gateway); }
export async function createProviderOrder(gateway: Gateway, input: { reference: string; amountMinor: number; customerId: string; phone: string }) {
  if (gateway === "razorpay") {
    const order = await request(gateway, "/orders", { amount: input.amountMinor, currency: "INR", receipt: input.reference });
    if (typeof order.id !== "string" || order.amount !== input.amountMinor || order.currency !== "INR") throw new Error("Invalid provider order");
    return { orderId: order.id, sessionId: "", keyId: required("RAZORPAY_KEY_ID") };
  }
  const order = await request(gateway, "/orders", { order_id: input.reference, order_amount: input.amountMinor / 100, order_currency: "INR", customer_details: { customer_id: input.customerId, customer_phone: input.phone } });
  if (order.order_id !== input.reference || Math.round(order.order_amount * 100) !== input.amountMinor || typeof order.payment_session_id !== "string") throw new Error("Invalid provider order");
  return { orderId: order.order_id, sessionId: order.payment_session_id, keyId: "" };
}
export function validSignature(value: string, signature: string, secret: string, encoding: "hex" | "base64" = "hex") {
  const expected = createHmac("sha256", secret).update(value).digest();
  const actual = Buffer.from(signature, encoding);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
export async function verifyProviderPayment(gateway: Gateway, orderId: string, amountMinor: number, paymentId?: string, signature?: string) {
  if (gateway === "razorpay") {
    if (!paymentId || !signature || !validSignature(orderId + "|" + paymentId, signature, required("RAZORPAY_KEY_SECRET"))) throw new ApiError(400, "Invalid payment signature", "INVALID_PAYMENT_PROOF");
    const payment = await request(gateway, "/payments/" + encodeURIComponent(paymentId));
    if (payment.order_id !== orderId || payment.status !== "captured" || payment.amount !== amountMinor || payment.currency !== "INR" || payment.amount_refunded > 0) throw new ApiError(409, "Payment is not confirmed", "PAYMENT_PENDING");
    return String(payment.id);
  }
  const payments = await request(gateway, "/orders/" + encodeURIComponent(orderId) + "/payments");
  if (!Array.isArray(payments)) throw new Error("Invalid provider response");
  const payment = payments.find(p => p.order_id === orderId && p.payment_status === "SUCCESS" && Math.round(p.payment_amount * 100) === amountMinor && p.payment_currency === "INR");
  if (!payment) throw new ApiError(409, "Payment is not confirmed", "PAYMENT_PENDING");
  const refunds = await request(gateway, "/orders/" + encodeURIComponent(orderId) + "/refunds");
  if (!Array.isArray(refunds) || refunds.some(r => String(r.cf_payment_id) === String(payment.cf_payment_id) && r.refund_status !== "CANCELLED" && r.refund_status !== "FAILED")) throw new ApiError(409, "Refund requires reconciliation", "PAYMENT_REFUNDED");
  return String(payment.cf_payment_id);
}
// Used only by authenticated reconciliation or a verified webhook. Never trust callback status.
export async function reconcileProviderPayment(gateway: Gateway, orderId: string, amountMinor: number) {
  if (gateway === "cashfree") return verifyProviderPayment(gateway, orderId, amountMinor);
  const response = await request(gateway, "/orders/" + encodeURIComponent(orderId) + "/payments");
  if (!Array.isArray(response.items)) throw new Error("Invalid provider response");
  const payment = response.items.find((p: { id: string; order_id: string; status: string; amount: number; currency: string; amount_refunded: number }) => p.order_id === orderId && p.status === "captured" && p.amount === amountMinor && p.currency === "INR" && !p.amount_refunded);
  if (!payment) throw new ApiError(409, "Payment is not confirmed", "PAYMENT_PENDING");
  return String(payment.id);
}
export async function recoverProviderOrder(gateway: Gateway, orderId: string, reference: string, amountMinor: number) {
  const order = await request(gateway, "/orders/" + encodeURIComponent(orderId));
  if (gateway === "razorpay") {
    if (order.receipt !== reference || order.amount !== amountMinor || order.currency !== "INR") throw new ApiError(400, "Order does not match", "INVALID_PAYMENT_PROOF");
    return { orderId: order.id, keyId: required("RAZORPAY_KEY_ID"), sessionId: "" };
  }
  if (order.order_id !== reference || Math.round(order.order_amount * 100) !== amountMinor || order.order_currency !== "INR") throw new ApiError(400, "Order does not match", "INVALID_PAYMENT_PROOF");
  return { orderId: order.order_id, keyId: "", sessionId: order.payment_session_id };
}
