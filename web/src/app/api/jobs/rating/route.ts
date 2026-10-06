import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const ratingSchema = z.object({
  jobId: z.string().min(1),
  rating: z.number().min(1).max(5),
  review: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { jobId, rating, review } = ratingSchema.parse(body);

    const job = await Job.findById(jobId);
    if (!job) {
      return errorResponse("Job not found", 404);
    }

    // Only customer of the job or admin can rate
    if (job.customerId.toString() !== authUser.userId && authUser.role !== "admin") {
      return errorResponse("Only the customer can rate this service", 403, "FORBIDDEN");
    }

    job.rating = rating;
    if (review) job.review = review.trim();
    await job.save();

    // Recalculate worker's aggregate rating
    if (job.workerId) {
      const ratedJobs = await Job.find({
        workerId: job.workerId,
        rating: { $exists: true, $ne: null },
      }).select("rating").lean();

      if (ratedJobs.length > 0) {
        const avgRating =
          ratedJobs.reduce((acc, curr) => acc + (curr.rating || 0), 0) / ratedJobs.length;
        const rounded = Math.round(avgRating * 10) / 10;

        await WorkerProfile.findOneAndUpdate(
          { userId: job.workerId },
          { rating: rounded }
        );
      }
    }

    return successResponse({ job, rating, review }, "Rating submitted successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
