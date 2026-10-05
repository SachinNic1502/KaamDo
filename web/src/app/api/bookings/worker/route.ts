import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const rawStatus = (searchParams.get("status") || "").toLowerCase();

    const filter: Record<string, unknown> = {};

    if (rawStatus === "pending") {
      filter.status = "searching";
    } else if (rawStatus === "in_progress") {
      filter.workerId = authUser.userId;
      filter.status = { $in: ["worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"] };
    } else {
      filter.workerId = authUser.userId;
      if (rawStatus) filter.status = rawStatus;
    }

    const jobs = await Job.find(filter)
      .populate("customerId", "name phone avatar")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    return successResponse({ bookings: jobs, jobs }, "Worker bookings retrieved");
  } catch (error) {
    return handleApiError(error);
  }
}
