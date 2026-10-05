import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, WorkerProfile, User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";
import { generateOTP } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { id: jobId } = await params;

    if (authUser.role !== "worker") {
      return errorResponse("Only verified service partners can accept job requests", 403, "FORBIDDEN");
    }

    // Verify worker profile status
    const workerProfile = await WorkerProfile.findOne({ userId: authUser.userId });
    if (!workerProfile) {
      return errorResponse("Worker profile not found. Please complete profile setup.", 404);
    }

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Check if another worker already accepted
    if (job.status === "worker_accepted" && job.workerId?.toString() !== authUser.userId) {
      return errorResponse("This job has already been claimed by another service partner", 409, "JOB_ALREADY_CLAIMED");
    }

    if (!["searching", "worker_assigned"].includes(job.status)) {
      return errorResponse(`Cannot claim lead in '${job.status}' status`, 409, "INVALID_JOB_STATE");
    }

    // If job was pre-assigned to another worker
    if (job.status === "worker_assigned" && job.workerId && job.workerId.toString() !== authUser.userId) {
      return errorResponse("This job was assigned to another trade professional", 403, "FORBIDDEN");
    }

    // Assign worker and transition status
    job.workerId = authUser.userId as any;
    job.status = "worker_accepted";
    if (!job.startOtp) {
      job.startOtp = generateOTP();
    }
    await job.save();

    // Notify customer & worker in real-time
    await RealtimeService.notifyWorkerAccepted({
      jobId: job._id.toString(),
      workerId: authUser.userId,
      customerId: job.customerId.toString(),
    });

    const populated = await Job.findById(jobId)
      .select("-startOtp -completionOtp")
      .populate("customerId", "name phone avatar")
      .populate("workerId", "name phone avatar")
      .populate("categoryId", "name slug")
      .lean();

    return successResponse(populated, "Lead accepted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
