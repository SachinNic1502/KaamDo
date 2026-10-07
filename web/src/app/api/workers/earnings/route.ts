import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth-middleware";
import { connectDB } from "@/lib/db";
import { handleApiError, ApiError } from "@/lib/api-error";
import { successResponse } from "@/lib/api-response";
import { Job, WorkerProfile, Payout, Payment } from "@/lib/models";
import { resolvePlatformFee } from "@/lib/services/commission";

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

    // Fetch all completed, paid, closed, or payment_pending jobs for this worker
    const completedJobs = await Job.find({
      workerId: actor.userId,
      status: { $in: ["completed", "payment_pending", "paid", "closed"] },
    }).lean();

    // Fetch payments for these jobs to get actual recorded worker earnings
    const jobIds = completedJobs.map((j) => j._id);
    const payments = await Payment.find({
      jobId: { $in: jobIds },
      status: "completed",
    }).lean();

    const paymentMap = new Map();
    for (const p of payments) {
      paymentMap.set(String(p.jobId), p);
    }

    let today = 0;
    let thisWeek = 0;
    let thisMonth = 0;
    let totalEarnings = 0;
    let totalGross = 0;
    let totalPlatformFee = 0;

    for (const job of completedJobs) {
      const grossPrice = Number(job.finalPrice || job.estimatedPrice || 0);
      const jobDate = new Date(job.endTime || job.updatedAt || job.createdAt);

      let netWorkerEarning = 0;
      let fee = 0;

      const payment = paymentMap.get(String(job._id));
      if (payment && typeof payment.workerEarning === "number") {
        netWorkerEarning = payment.workerEarning;
        fee = payment.platformFee || Math.max(0, grossPrice - netWorkerEarning);
      } else {
        const feeRes = await resolvePlatformFee(job.categoryId, grossPrice);
        netWorkerEarning = feeRes.workerEarning;
        fee = feeRes.platformFee;
      }

      totalGross += grossPrice;
      totalPlatformFee += fee;
      totalEarnings += netWorkerEarning;

      if (jobDate >= startOfToday) today += netWorkerEarning;
      if (jobDate >= startOfWeek) thisWeek += netWorkerEarning;
      if (jobDate >= startOfMonth) thisMonth += netWorkerEarning;
    }

    // Calculate pending payout from net earnings minus all settled / submitted payouts
    const settledPayouts = await Payout.find({
      workerId: actor.userId,
      status: { $in: ["completed", "settled", "processing", "submitted", "paid"] },
    }).lean();

    const totalWithdrawn = settledPayouts.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingPayout = Math.max(0, Math.round(totalEarnings - totalWithdrawn));

    return successResponse({
      today: Math.round(today),
      thisWeek: Math.round(thisWeek),
      thisMonth: Math.round(thisMonth),
      totalEarnings: Math.round(totalEarnings),
      grossEarnings: Math.round(totalGross),
      platformFeeDeducted: Math.round(totalPlatformFee),
      pendingPayout,
      completedJobsCount: completedJobs.length,
      rating: workerProfile?.rating || 5.0,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
