import { NextRequest } from "next/server";
import { ApiError, handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { validSignature } from "@/lib/services/payment-providers";
import { reconcileCheckout } from "@/lib/services/checkout";
import { connectDB } from "@/lib/db";
import PaymentOrder from "@/lib/models/payment-order.model";
export async function POST(request: NextRequest) {
  try {
    const raw = await request.text();
    if (raw.length > 100000) throw new ApiError(413, "Payload too large", "INVALID_REQUEST");
    const gateway = new URL(request.url).searchParams.get("provider");
    let valid = false;
    if (gateway === "razorpay" && process.env.RAZORPAY_WEBHOOK_SECRET) {
      valid = validSignature(raw, request.headers.get("x-razorpay-signature") || "", process.env.RAZORPAY_WEBHOOK_SECRET);
    } else if (gateway === "cashfree" && process.env.CASHFREE_CLIENT_SECRET) {
      const timestamp = request.headers.get("x-webhook-timestamp") || "";
      valid = /^\d+$/.test(timestamp) && validSignature(timestamp + raw, request.headers.get("x-webhook-signature") || "", process.env.CASHFREE_CLIENT_SECRET, "base64");
    }
    if (!valid) throw new ApiError(401, "Invalid webhook signature", "UNAUTHORIZED");
    const event = JSON.parse(raw);
    const relevant = gateway === "razorpay" ? ["payment.captured", "order.paid"].includes(event.event) : event.type === "PAYMENT_SUCCESS_WEBHOOK";
    if (!relevant) return successResponse({ ignored: true });
    const orderId = gateway === "razorpay" ? event.payload?.payment?.entity?.order_id ?? event.payload?.order?.entity?.id : event.data?.order?.order_id;
    if (typeof orderId !== "string") throw new ApiError(400, "Missing order", "INVALID_REQUEST");
    await connectDB();
    const order = await PaymentOrder.findOne({ gateway, orderId });
    if (!order) throw new ApiError(409, "Order requires reconciliation", "ORDER_RECOVERY_REQUIRED");
    return successResponse(await reconcileCheckout(String(order.jobId)));
  } catch (error) { return handleApiError(error); }
}
