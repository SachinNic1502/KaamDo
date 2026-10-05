import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, Job } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { objectIdSchema } from "@/lib/security-schemas";

const publicFields = "_id userId skills experience serviceAreas hourlyRate dailyRate status isOnline rating totalJobs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: rawId } = await context.params;
    const workerId = objectIdSchema.parse(rawId);

    // Look up either by WorkerProfile._id or by userId
    let profile = await WorkerProfile.findOne({
      $or: [{ _id: workerId }, { userId: workerId }],
      status: "verified",
    })
      .select(publicFields)
      .populate("userId", "name avatar")
      .lean();

    if (!profile) {
      return errorResponse("Worker profile not found or not active", 404);
    }

    // Fetch recent public reviews for this worker
    const recentReviews = await Job.find({
      workerId: (profile.userId as any)?._id || profile.userId,
      rating: { $gt: 0 },
      review: { $exists: true, $ne: "" },
    })
      .select("rating review createdAt")
      .populate("customerId", "name")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return successResponse({
      ...profile,
      recentReviews,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
