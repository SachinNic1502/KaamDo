import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models";
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

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Only service partners can decline jobs", 403, "FORBIDDEN");
    }

    const body = await request.json().catch(() => ({}));
    const reason = body?.reason || "Declined by worker";

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Only allow declining if currently assigned or accepted
    if (job.workerId && job.workerId.toString() !== authUser.userId && authUser.role !== "admin") {
      return errorResponse("You are not assigned to this job", 403, "FORBIDDEN");
    }

    // Unassign worker and put job back into searching pool
    job.workerId = undefined;
    job.status = "searching";
    await job.save();

    try {
      await RealtimeService.sendRoleNotification({
        role: "worker",
        type: "lead_reopened",
        title: "Service Lead Available",
        message: `Job #${job.jobNumber} has been reopened to the provider pool.`,
        data: {
          jobId: job._id.toString(),
          jobNumber: job.jobNumber,
          reason,
        },
      });
    } catch {
      // Non-blocking notification
    }

    return successResponse(job, "Job declined and returned to dispatch pool");
  } catch (error) {
    return handleApiError(error);
  }
}
