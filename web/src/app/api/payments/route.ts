import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, Payment } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-middleware";
import { paginationSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (query.asCustomer === "true" || authUser.role === "customer") {
      filter.customerId = authUser.userId;
    } else if (authUser.role === "worker") {
      filter.$or = [
        { workerId: authUser.userId },
        { customerId: authUser.userId },
      ];
    } else if (authUser.role === "admin") {
      // Admin can see all or filter by customer/worker if passed
    } else {
      filter.customerId = authUser.userId;
    }

    if (search) {
      filter.$or = [
        { transactionId: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const total = await Payment.countDocuments(filter);
    const payments = await Payment.find(filter)
      .populate("jobId", "jobNumber")
      .populate("customerId", "name phone")
      .populate("workerId", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(payments, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    if (process.env.PAYMENTS_ENABLED !== "true") {
      return errorResponse(
        "Payments are temporarily unavailable. Please try again later.",
        503,
        "PAYMENTS_DISABLED"
      );
    }
    const { z } = await import("zod");
    const body = z.object({
      action: z.enum(["create-order", "verify"]),
      jobId: z.string().regex(/^[a-f\d]{24}$/i),
      provider: z.enum(["razorpay", "cashfree"]).default("razorpay"),
      razorpay_payment_id: z.string().max(100).optional(),
      razorpay_signature: z.string().optional()
    }).parse(await request.json());
    const { createCheckout, confirmCheckout } = await import("@/lib/services/checkout");
    
    // Verify job ownership before proceeding to checkout
    await connectDB();
    const job = await Job.findById(body.jobId).select("customerId pricingModel").lean();
    if (!job) return errorResponse("Job not found", 404);
    if (job.customerId.toString() !== user.userId && user.role !== "admin") {
      return errorResponse("Forbidden: Not your job", 403, "FORBIDDEN");
    }
    if (job.pricingModel !== "fixed" && job.pricingModel !== "visit") {
      return errorResponse("Payment not required for this job type", 400);
    }
    
    const customerId = user.role === "admin" ? job.customerId.toString() : user.userId;
    const result = body.action === "create-order"
      ? await createCheckout(customerId, body.jobId, body.provider)
      : await confirmCheckout(customerId, body.jobId, body.razorpay_payment_id, body.razorpay_signature);
    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
