import { assertJobTransition } from "@/lib/job-lifecycle";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Job, User, WorkerProfile, ServiceCategory } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createJobSchema, updateJobStatusSchema, paginationSchema } from "@/lib/validations";
import { generateJobNumber, generateOTP } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { resourceScope } from "@/lib/resource-policy";
import { objectIdSchema, jobUpdateSchema } from "@/lib/security-schemas";
import { RealtimeService } from "@/lib/services/realtime";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = resourceScope(authUser, "jobs");

    if (query.jobId) {
      const jobId = objectIdSchema.parse(query.jobId);
      const job = await Job.findOne({ _id: jobId, ...filter })
        .select(authUser.role === "customer" ? "-__v" : "-startOtp -completionOtp -__v")
        .populate("customerId", "name phone").populate("workerId", "name phone")
        .populate("categoryId", "name slug").lean();
      if (!job) return errorResponse("Job not found", 404);
      return successResponse(job);
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
      .select("-startOtp -completionOtp")
      .populate("customerId", "name phone")
      .populate("workerId", "name phone")
      .populate("categoryId", "name slug")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(jobs, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "customer") return errorResponse("Forbidden", 403, "FORBIDDEN");
    const body = await request.json();
    const validated = createJobSchema.parse(body);

    const user = await User.findById(authUser.userId);
    if (!user) return errorResponse("User not found", 404);

    const category = await ServiceCategory.findById(validated.categoryId);
    if (!category || !category.isActive) return errorResponse("Category not found", 404);

    const subcategory = category.subcategories.find((item: { _id: unknown }) => String(item._id) === validated.subcategoryId);
    if (!subcategory || !subcategory.isActive) return errorResponse("Subcategory not found", 400);
    if (new Date(validated.scheduledDate).getTime() < Date.now()) return errorResponse("Choose a future date", 400);
    const jobNumber = generateJobNumber();
    const startOtp = generateOTP();

    const suitableWorkers = await WorkerProfile.find({
      status: "verified",
      isOnline: true,
      serviceAreas: validated.address.city,
      skills: { $in: [category.name] },
    })
      .populate({ path: "userId", select: "_id", match: { isActive: true, role: "worker" } })
      .limit(10)
      .lean();

    const match = suitableWorkers.find((worker) => worker.userId);
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
      status: match ? "worker_assigned" : "searching",
      workerId: match?.userId._id,
      pricingModel: subcategory.pricingModel,
      estimatedPrice: subcategory.basePrice,
      startOtp,
    });

    return successResponse(
      {
        job,
        matchedWorkers: suitableWorkers.length,
      },
      "Job created successfully",
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { jobId, ...updates } = jobUpdateSchema.parse(body);

    if (!jobId) return errorResponse("jobId is required");

    objectIdSchema.parse(jobId);
    const job = await Job.findOne({ _id: jobId, ...resourceScope(authUser, "jobs") });
    if (!job) return errorResponse("Job not found", 404);

    const allowedFields = authUser.role === "admin"
      ? ["status", "workerId", "startOtp", "completionOtp", "additionalCharge", "chargeDecision", "materials", "rating", "review"]
      : authUser.role === "worker"
        ? ["status", "startOtp", "completionOtp", "additionalCharge", "materials"]
        : ["status", "completionOtp", "chargeDecision", "rating", "review"];
    if (Object.keys(updates).some((key) => !allowedFields.includes(key))) {
      return errorResponse("Forbidden update fields", 403, "FORBIDDEN");
    }
    if (authUser.role === "customer" && updates.status && !["cancelled", "completed"].includes(updates.status)) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (updates.status) {
      const validated = updateJobStatusSchema.parse({ status: updates.status });
      assertJobTransition(job.status, validated.status, authUser.role);

      if (validated.status === "work_started") {
        if ((job.startOtpFailures ?? 0) >= 5) return errorResponse("Start code locked. Contact support.", 429, "OTP_RATE_LIMITED");
        if (!job.startOtp || !updates.startOtp || updates.startOtp !== job.startOtp) {
          if (updates.startOtp) await Job.updateOne({ _id: job._id, status: "arrived" }, { $inc: { startOtpFailures: 1, __v: 1 } });
          return errorResponse("Invalid OTP", 400);
        }
        job.startTime = new Date();
        job.startOtp = undefined;
      }

      if (validated.status === "completed") {
        if (!job.completionOtp || !updates.completionOtp || updates.completionOtp !== job.completionOtp) {
          return errorResponse("Invalid OTP", 400);
        }
        job.endTime = new Date();
        job.completionOtp = undefined;
        if (job.pricingModel === "fixed" || job.pricingModel === "visit") job.finalPrice = job.estimatedPrice;
      }

      if (validated.status === "completion_requested") job.completionOtp = generateOTP();
      job.status = validated.status;
    }

    if (updates.workerId) {
      if (!["searching", "worker_assigned", "rejected"].includes(job.status)) return errorResponse("Job cannot be reassigned", 409);
      const worker = await WorkerProfile.findOne({ userId: updates.workerId, status: "verified" });
      const account = await User.findOne({ _id: updates.workerId, role: "worker", isActive: true });
      if (!worker || !account) return errorResponse("Worker unavailable", 400);
      job.workerId = updates.workerId;
      job.startOtp = generateOTP();
      job.startOtpFailures = 0;
      job.status = "worker_assigned";
      
      // Send real-time notification
      await RealtimeService.notifyWorkerAssigned({
        jobId: job._id.toString(),
        workerId: updates.workerId.toString(),
        customerId: job.customerId.toString(),
        jobDetails: {
          jobNumber: job.jobNumber,
          description: job.description,
          scheduledDate: job.scheduledDate,
          address: job.address,
        },
      });
    }

    if ((updates.additionalCharge || updates.materials) && !["work_started", "in_progress"].includes(job.status)) return errorResponse("Job costs are locked", 409);
    if (updates.additionalCharge) {
      job.additionalCharges.push({ ...updates.additionalCharge, status: "pending" });
    }

    if (updates.chargeDecision) {
      if (!["work_started", "in_progress", "completion_requested"].includes(job.status)) {
        return errorResponse("Job costs are locked", 409);
      }
      const decision = updates.chargeDecision;
      const charge = job.additionalCharges.find(
        (c: { _id?: unknown }) => String(c._id) === decision.chargeId
      );
      if (!charge) return errorResponse("Charge not found", 404);
      if (charge.status !== "pending") {
        return errorResponse("Charge has already been decided", 409, "INVALID_JOB_STATE");
      }
      charge.status = decision.decision;
    }

    if (updates.materials) {
      job.materials = updates.materials.map((material) => ({
        ...material, totalPrice: material.quantity * material.unitPrice,
      }));
    }

    if (updates.rating !== undefined) {
      if (!["completed", "paid", "closed"].includes(job.status)) {
        return errorResponse("Only completed jobs can be rated", 409, "INVALID_JOB_STATE");
      }
      job.rating = updates.rating;
      job.review = updates.review;
    }

    await job.save();

    const result = job.toObject();
    delete result.startOtp;
    delete result.completionOtp;
    return successResponse(result, "Job updated");
  } catch (error) {
    return handleApiError(error);
  }
}
