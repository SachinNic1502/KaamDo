import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, User, WorkerProfile, ServiceCategory, Payment } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createJobSchema, updateJobStatusSchema, paginationSchema } from "@/lib/validations";
import { generateJobNumber, generateOTP } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (authUser.role === "customer") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.customerId = user._id;
    } else if (authUser.role === "worker") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.workerId = user._id;
    }

    if (search) {
      filter.$or = [
        { jobNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .populate("customerId", "name phone")
      .populate("workerId", "name phone")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(jobs, total, page, limit);
  } catch (error) {
    console.error("Get jobs error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const validated = createJobSchema.parse(body);

    const user = await User.findOne({ phone: authUser.phone });
    if (!user) return errorResponse("User not found", 404);

    const category = await ServiceCategory.findById(validated.categoryId);
    if (!category) return errorResponse("Category not found", 404);

    const jobNumber = generateJobNumber();
    const startOtp = generateOTP();

    const job = await Job.create({
      jobNumber,
      customerId: user._id,
      categoryId: validated.categoryId,
      subcategoryId: validated.subcategoryId,
      description: validated.description,
      images: validated.images || [],
      address: validated.address,
      scheduledDate: new Date(validated.scheduledDate),
      scheduledTime: validated.scheduledTime,
      status: "searching",
      pricingModel: validated.pricingModel,
      estimatedPrice: validated.estimatedPrice,
      startOtp,
    });

    const suitableWorkers = await WorkerProfile.find({
      status: "verified",
      isOnline: true,
      skills: { $in: [category.name] },
    })
      .populate("userId", "name phone")
      .limit(10)
      .lean();

    return successResponse(
      {
        job,
        matchedWorkers: suitableWorkers.length,
      },
      "Job created successfully",
      201
    );
  } catch (error) {
    console.error("Create job error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { jobId, ...updates } = body;

    if (!jobId) return errorResponse("jobId is required");

    const job = await Job.findById(jobId);
    if (!job) return errorResponse("Job not found", 404);

    if (updates.status) {
      const validated = updateJobStatusSchema.parse({ status: updates.status });

      if (validated.status === "work_started") {
        if (updates.startOtp !== job.startOtp) {
          return errorResponse("Invalid OTP", 400);
        }
        job.startTime = new Date();
      }

      if (validated.status === "completed") {
        if (updates.completionOtp !== job.completionOtp) {
          return errorResponse("Invalid OTP", 400);
        }
        job.endTime = new Date();
      }

      job.status = validated.status;
    }

    if (updates.workerId) {
      job.workerId = updates.workerId;
      job.status = "worker_assigned";
    }

    if (updates.additionalCharge) {
      job.additionalCharges.push(updates.additionalCharge);
    }

    if (updates.materials) {
      job.materials = updates.materials;
    }

    if (updates.rating !== undefined) {
      job.rating = updates.rating;
      job.review = updates.review;
    }

    await job.save();

    return successResponse(job, "Job updated");
  } catch (error) {
    console.error("Update job error:", error);
    return errorResponse("Internal server error", 500);
  }
}
