import { NextRequest } from "next/server";
import { z } from "zod";
import { requireRole } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { reconcileCheckout } from "@/lib/services/checkout";
export async function POST(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const body = z.object({ jobId: z.string().regex(/^[a-f\d]{24}$/i), recoveryOrderId: z.string().max(100).optional() }).strict().parse(await request.json());
    return successResponse(await reconcileCheckout(body.jobId, body.recoveryOrderId));
  } catch (error) { return handleApiError(error); }
}
export async function GET(request: NextRequest) {
  try {
    await requireRole(request, ["admin"]);
    const { connectDB } = await import("@/lib/db");
    const { default: PaymentOrder } = await import("@/lib/models/payment-order.model");
    await connectDB();
    return successResponse(await PaymentOrder.find({ status: { $ne: "completed" } }).select("_id jobId gateway orderId amountMinor status createdAt").sort({ createdAt: 1 }).limit(100).lean());
  } catch (error) { return handleApiError(error); }
}
