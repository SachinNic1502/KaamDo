import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, Job } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";
import { objectIdSchema } from "@/lib/security-schemas";
import { paginationSchema } from "@/lib/validations";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id: rawId } = await context.params;
    const workerId = objectIdSchema.parse(rawId);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit } = paginationSchema.parse(query);

    // Resolve worker user id
    const profile = await WorkerProfile.findOne({
      $or: [{ _id: workerId }, { userId: workerId }],
    }).select("userId rating").lean();

    if (!profile) {
      return errorResponse("Worker profile not found", 404);
    }

    const targetUserId = (profile.userId as any)?._id || profile.userId;

    const filter = {
      workerId: targetUserId,
      rating: { $gt: 0 },
    };

    const [allRatings, paginatedJobs, totalCount] = await Promise.all([
      Job.find(filter).select("rating review").lean(),
      Job.find(filter)
        .select("jobNumber rating review createdAt")
        .populate("customerId", "name avatar")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Job.countDocuments(filter),
    ]);

    const breakdown: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let ratingSum = 0;

    for (const r of allRatings) {
      const score = Math.min(5, Math.max(1, Math.round(r.rating || 0)));
      breakdown[score] = (breakdown[score] || 0) + 1;
      ratingSum += Number(r.rating || 0);
    }

    const averageRating =
      allRatings.length > 0
        ? Math.round((ratingSum / allRatings.length) * 10) / 10
        : profile.rating || 5.0;

    return successResponse({
      averageRating,
      totalReviews: totalCount,
      ratingBreakdown: breakdown,
      reviews: paginatedJobs.map((j: any) => ({
        id: j._id.toString(),
        jobNumber: j.jobNumber,
        rating: j.rating,
        review: j.review || "Great service!",
        customerName: j.customerId?.name || "Verified Customer",
        customerAvatar: j.customerId?.avatar,
        createdAt: j.createdAt,
      })),
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit) || 1,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
