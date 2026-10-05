import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { id: jobId } = await params;

    const job = await Job.findById(jobId)
      .populate("customerId", "name phone avatar")
      .populate("workerId", "name phone avatar")
      .populate("categoryId", "name slug icon")
      .lean();

    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Role-based authorization check
    const isCustomer = authUser.role === "customer" && String(job.customerId?._id || job.customerId) === authUser.userId;
    const isWorker = authUser.role === "worker" && String(job.workerId?._id || job.workerId) === authUser.userId;
    const isBroadcastLead = authUser.role === "worker" && (job.status === "searching" || job.status === "worker_assigned");
    const isAdmin = authUser.role === "admin";

    if (!isCustomer && !isWorker && !isBroadcastLead && !isAdmin) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    // Only customer and admin can view verification OTPs in plain text
    const result: any = { ...job };
    if (!isCustomer && !isAdmin) {
      delete result.startOtp;
      delete result.completionOtp;
    }

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { id: jobId } = await params;

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Only customer or admin can cancel
    const isCustomer = authUser.role === "customer" && String(job.customerId) === authUser.userId;
    const isAdmin = authUser.role === "admin";

    if (!isCustomer && !isAdmin) {
      return errorResponse("Only the customer or administrator can cancel this booking", 403, "FORBIDDEN");
    }

    if (!["searching", "worker_assigned", "worker_accepted", "on_the_way", "arrived"].includes(job.status)) {
      return errorResponse(`Cannot cancel job in '${job.status}' status`, 409, "INVALID_JOB_STATE");
    }

    job.status = "cancelled";
    job.cancelledBy = authUser.userId as any;
    await job.save();

    // Broadcast cancellation
    await RealtimeService.broadcastJobUpdate({
      jobId: job._id.toString(),
      status: "cancelled",
      customerId: job.customerId.toString(),
      workerId: job.workerId?.toString(),
      updateData: { cancelledBy: authUser.role },
    });

    return successResponse({ jobId: job._id, status: "cancelled" }, "Job cancelled successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
