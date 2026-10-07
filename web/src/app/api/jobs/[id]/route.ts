import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";

import { WorkerMatchingService } from "@/lib/services/worker-matching";

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
    const isAssignedWorker = authUser.role === "worker" && String(job.workerId?._id || job.workerId) === authUser.userId;
    const isAdmin = authUser.role === "admin";

    let isEligibleWorkerLead = false;
    if (authUser.role === "worker" && !isAssignedWorker && (job.status === "searching" || job.status === "worker_assigned")) {
      const eligibility = await WorkerMatchingService.isWorkerEligibleForJob(authUser.userId, job);
      isEligibleWorkerLead = eligibility.eligible;
    }

    if (!isCustomer && !isAssignedWorker && !isEligibleWorkerLead && !isAdmin) {
      return errorResponse("Forbidden: You are not authorized or eligible for this job", 403, "FORBIDDEN");
    }

    // Only customer and admin can view verification OTPs in plain text
    const result: any = { ...job };
    if (!isCustomer && !isAdmin) {
      delete result.startOtp;
      delete result.completionOtp;
    }

    // Attach latest live worker GPS coordinates for real-time tracking
    if (job.workerId) {
      const workerProfile = await WorkerProfile.findOne({
        userId: (job.workerId as any)?._id || job.workerId,
      })
        .select("location")
        .lean();

      if (workerProfile?.location?.coordinates && workerProfile.location.coordinates.length >= 2) {
        result.workerLocation = {
          latitude: workerProfile.location.coordinates[1],
          longitude: workerProfile.location.coordinates[0],
          address: workerProfile.location.address || "",
          lastUpdated: workerProfile.location.lastUpdated || (workerProfile as any).updatedAt,
        };
      }
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
