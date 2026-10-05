import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { connectDB } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { Job, WorkerProfile, Payout } from "@/lib/models";
import PayoutObligation from "@/lib/models/payout-obligation.model";

export async function GET(request: NextRequest) {
  try {
    const actor = await requireAuth(request);
    await connectDB();

    if (actor.role !== "worker" && actor.role !== "admin") {
      throw new ApiError(403, "Access forbidden", "FORBIDDEN");
    }

    const workerProfile = await WorkerProfile.findOne({ userId: actor.userId }).lean();

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Fetch all completed/settled jobs for this worker
    const completedJobs = await Job.find({
      workerId: actor.userId,
      status: { $in: ["completed", "paid", "closed"] },
    }).lean();

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let totalEarnings = 0;

    for (const job of completedJobs) {
      const price = Number(job.finalPrice || job.estimatedPrice || 0);
      const jobDate = new Date(job.endTime || job.updatedAt || job.createdAt);

      totalEarnings += price;
      if (jobDate >= startOfToday) today += price;
      if (jobDate >= startOfWeek) thisWeek += price;
      if (jobDate >= startOfMonth) thisMonth += price;
    }

    // Calculate pending payout from obligations or completed jobs minus withdrawn payouts
    const settledPayouts = await Payout.find({
      workerId: actor.userId,
      status: { $in: ["completed", "settled", "processing", "submitted"] },
    }).lean();

    const totalWithdrawn = settledPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingPayout = Math.max(0, totalEarnings - totalWithdrawn);

    return successResponse({
      today,
      thisWeek,
      thisMonth,
      totalEarnings,
      pendingPayout,
      completedJobsCount: completedJobs.length,
      rating: workerProfile?.rating || 5.0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
