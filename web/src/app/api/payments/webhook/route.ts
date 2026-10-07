import { NextRequest } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/db";
import { Job, Payment } from "@/lib/models";
import PaymentOrder from "@/lib/models/payment-order.model";
import PayoutObligation from "@/lib/models/payout-obligation.model";
import { successResponse, errorResponse } from "@/lib/api-response";
import { RealtimeService } from "@/lib/services/realtime";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const rawBody = await request.text();
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return errorResponse("Invalid JSON payload", 400);
    }

    // 1. Razorpay Webhook
    if (payload.event && payload.payload?.payment?.entity) {
      const razorpaySignature = request.headers.get("x-razorpay-signature");
      const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

      if (secret && razorpaySignature) {
        const expectedSignature = crypto
          .createHmac("sha256", secret)
          .update(rawBody)
          .digest("hex");
        if (expectedSignature !== razorpaySignature) {
          return errorResponse("Invalid webhook signature", 401);
        }
      }

      const entity = payload.payload.payment.entity;
      const orderId = entity.order_id;
      const paymentId = entity.id;

      if (payload.event === "payment.captured") {
        const order = await PaymentOrder.findOne({ orderId });
        if (!order) {
          return successResponse({ received: true }, "Order not found in system, acknowledged");
        }

        if (order.status === "completed") {
          return successResponse({ received: true }, "Order already completed");
        }

        order.status = "completed";
        order.paymentId = paymentId;
        await order.save();

        const jobId = String(order.jobId);
        const userId = String(order.customerId);

        const job = await Job.findById(jobId);
        if (job) {
          job.status = "paid";
          await job.save();
        }

        const payment = await Payment.findOneAndUpdate(
          { jobId: order.jobId },
          {
            $set: {
              customerId: order.customerId,
              workerId: order.workerId,
              amount: order.amountMinor / 100,
              platformFee: order.feeMinor / 100,
              workerEarning: (order.amountMinor - order.feeMinor) / 100,
              status: "completed",
              paymentMethod: "razorpay",
              transactionId: `razorpay:${paymentId}`,
            },
          },
          { upsert: true, new: true }
        );

        await PayoutObligation.findOneAndUpdate(
          { paymentId: payment._id },
          {
            $set: {
              workerId: order.workerId,
              amountMinor: order.amountMinor - order.feeMinor,
              gateway: "razorpay",
              providerPaymentId: paymentId,
              status: "awaiting_settlement",
            },
          },
          { upsert: true, new: true }
        );

        await RealtimeService.broadcastJobUpdate({
          jobId,
          status: "paid",
          customerId: userId,
          workerId: order.workerId.toString(),
          updateData: { status: "paid", paymentMethod: "razorpay" },
        });

        return successResponse({ received: true }, "Razorpay payment webhook processed");
      }
    }

    // 2. Cashfree Webhook
    if (payload.data?.order?.order_id || payload.orderId) {
      const orderId = payload.data?.order?.order_id || payload.orderId;
      const paymentId = payload.data?.payment?.cf_payment_id || payload.referenceId || `cf_${Date.now()}`;
      const status = payload.data?.payment?.payment_status || payload.txStatus;

      if (status === "SUCCESS" || status === "PAID") {
        const order = await PaymentOrder.findOne({ orderId });
        if (order && order.status !== "completed") {
          order.status = "completed";
          order.paymentId = String(paymentId);
          await order.save();

          const jobId = String(order.jobId);
          await Job.findByIdAndUpdate(jobId, { $set: { status: "paid" } });

          const payment = await Payment.findOneAndUpdate(
            { jobId: order.jobId },
            {
              $set: {
                customerId: order.customerId,
                workerId: order.workerId,
                amount: order.amountMinor / 100,
                platformFee: order.feeMinor / 100,
                workerEarning: (order.amountMinor - order.feeMinor) / 100,
                status: "completed",
                paymentMethod: "cashfree",
                transactionId: `cashfree:${paymentId}`,
              },
            },
            { upsert: true, new: true }
          );

          await PayoutObligation.findOneAndUpdate(
            { paymentId: payment._id },
            {
              $set: {
                workerId: order.workerId,
                amountMinor: order.amountMinor - order.feeMinor,
                gateway: "cashfree",
                providerPaymentId: String(paymentId),
                status: "awaiting_settlement",
              },
            },
            { upsert: true, new: true }
          );

          await RealtimeService.broadcastJobUpdate({
            jobId,
            status: "paid",
            customerId: String(order.customerId),
            workerId: String(order.workerId),
            updateData: { status: "paid", paymentMethod: "cashfree" },
          });
        }
        return successResponse({ received: true }, "Cashfree payment webhook processed");
      }
    }

    return successResponse({ received: true }, "Webhook received and logged");
  } catch (error: any) {
    console.error("Payment webhook error:", error);
    return errorResponse(error.message || "Webhook processing error", 500);
  }
}
