import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, WorkerProfile, Job, Payment, Payout, Dispute } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const [
      totalUsers,
      totalWorkers,
      verifiedWorkers,
      activeWorkers,
      totalCustomers,
      totalContractors,
      totalJobs,
      activeJobs,
      completedJobs,
      cancelledJobs,
      disputedJobs,
      totalRevenue,
      totalCommission,
      pendingPayouts,
      completedPayouts,
      totalDisputes,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),
      WorkerProfile.countDocuments(),
      WorkerProfile.countDocuments({ status: "verified" }),
      WorkerProfile.countDocuments({ isOnline: true }),
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "contractor" }),
      Job.countDocuments(),
      Job.countDocuments({ status: { $in: ["searching", "worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"] } }),
      Job.countDocuments({ status: "completed" }),
      Job.countDocuments({ status: "cancelled" }),
      Job.countDocuments({ status: "disputed" }),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]).then((r) => r[0]?.total || 0),
      Payment.aggregate([
        { $match: { status: "completed" } },
        { $group: { _id: null, total: { $sum: "$platformFee" } } },
      ]).then((r) => r[0]?.total || 0),
      Payout.countDocuments({ status: { $in: ["eligible", "processing", "submitted"] } }),
      Payout.countDocuments({ status: "paid" }),
      Dispute.countDocuments(),
    ]);

    const stats = {
      totalUsers,
      totalWorkers,
      verifiedWorkers,
      activeWorkers,
      totalCustomers,
      totalContractors,
      totalJobs,
      activeJobs,
      completedJobs,
      cancelledJobs,
      disputedJobs,
      revenue: totalRevenue,
      commission: totalCommission,
      pendingPayouts,
      completedPayouts,
      disputes: totalDisputes,
    };

    return successResponse(stats);
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return errorResponse("Internal server error", 500);
  }
}
