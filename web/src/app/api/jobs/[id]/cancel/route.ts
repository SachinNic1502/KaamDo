import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { id: jobId } = await params;

    const body = await request.json().catch(() => ({}));
    const reason = body.reason || "Cancelled by user";

    const job = await Job.findById(jobId);
    if (!job) return errorResponse("Job not found", 404, "NOT_FOUND");

    const isCustomer = job.customerId.toString() === authUser.userId;
    const isWorker = job.workerId?.toString() === authUser.userId;
    const isAdmin = authUser.role === "admin";

    if (!isCustomer && !isWorker && !isAdmin) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (["work_started", "in_progress", "completed", "paid"].includes(job.status)) {
      return errorResponse(
        "Job cannot be cancelled once work has begun. Please file a dispute through customer support.",
        400,
        "CANCELLATION_NOT_PERMITTED"
      );
    }

    if (job.status === "cancelled") {
      return errorResponse("Job is already cancelled", 400);
    }

    // Policy-based fee computation
    let cancellationFee = 0;
    let feeDescription = "Free cancellation before worker dispatch";

    if (["worker_assigned", "worker_accepted"].includes(job.status)) {
      cancellationFee = 50;
      feeDescription = "Dispatch reservation fee";
    } else if (["on_the_way", "arrived"].includes(job.status)) {
      cancellationFee = Math.max(149, Math.round((job.estimatedPrice || 299) * 0.5));
      feeDescription = "Worker transit visit charge";
    }

    const previousStatus = job.status;
    job.status = "cancelled";
    job.cancelledBy = authUser.userId as any;
    job.cancellationReason = reason;
    await job.save();

    // Broadcast cancellation update
    await RealtimeService.broadcastJobUpdate({
      jobId: job._id.toString(),
      status: "cancelled",
      customerId: job.customerId.toString(),
      workerId: job.workerId?.toString(),
      updateData: {
        reason,
        cancellationFee,
        feeDescription,
        cancelledBy: authUser.userId,
      },
    });

    // Send push notification to the other party
    const targetUserId = isCustomer ? job.workerId?.toString() : job.customerId.toString();
    if (targetUserId) {
      await RealtimeService.sendUserNotification({
        userId: targetUserId,
        type: "job_cancelled",
        title: "Job Cancelled",
        message: `Job #${job.jobNumber} was cancelled. Reason: ${reason}`,
        data: { jobId: job._id.toString(), reason, cancellationFee },
      });
    }

    return successResponse(
      {
        jobId: job._id,
        status: "cancelled",
        cancellationFee,
        feeDescription,
        reason,
      },
      "Job cancelled successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
