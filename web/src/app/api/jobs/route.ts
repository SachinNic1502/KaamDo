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

    if (query.jobId) {
      const jobId = objectIdSchema.parse(query.jobId);
      const job = await Job.findById(jobId)
        .populate("customerId", "name phone avatar")
        .populate("workerId", "name phone avatar")
        .populate("categoryId", "name slug")
        .lean();
      if (!job) return errorResponse("Job not found", 404);

      const isCustomer = String(job.customerId?._id || job.customerId) === authUser.userId;
      const isWorker = authUser.role === "worker" && (String(job.workerId?._id || job.workerId) === authUser.userId || job.status === "searching");
      const isAdmin = authUser.role === "admin";
      if (!isCustomer && !isWorker && !isAdmin) return errorResponse("Forbidden", 403, "FORBIDDEN");

      const result: any = { ...job };
      if (!isCustomer && !isAdmin) {
        delete result.startOtp;
        delete result.completionOtp;
      }
      return successResponse(result);
    }

    let filter: Record<string, unknown> = {};
    if (query.customerId) {
      filter = { customerId: query.customerId };
    } else if (authUser.role === "admin") {
      filter = {};
    } else if (authUser.role === "customer" || query.asCustomer === "true") {
      filter = { customerId: authUser.userId };
    } else if (authUser.role === "worker") {
      if (status === "searching" || query.available === "true") {
        filter = { status: "searching" };
      } else {
        filter = { workerId: authUser.userId };
      }
    } else if (authUser.role === "contractor") {
      filter = { contractorId: authUser.userId };
    }

    if (search) {
      filter.$or = [
        { jobNumber: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status && filter.status !== "searching") filter.status = status;

    const total = await Job.countDocuments(filter);
    const jobs = await Job.find(filter)
      .select("-startOtp -completionOtp")
      .populate("customerId", "name phone avatar")
      .populate("workerId", "name phone avatar")
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

    const body = await request.json();
    const validated = createJobSchema.parse(body);

    const targetCustomerId = (authUser.role === "admin" && body.customerId) ? body.customerId : authUser.userId;
    const user = await User.findById(targetCustomerId);
    if (!user) return errorResponse("User not found", 404);

    const category = await ServiceCategory.findById(validated.categoryId);
    if (!category || !category.isActive) return errorResponse("Category not found", 404);

    const subcategory = category.subcategories.find(
      (item: { _id?: unknown; slug?: string }) =>
        String(item._id) === validated.subcategoryId || item.slug === validated.subcategoryId
    );
    if (!subcategory || !subcategory.isActive) return errorResponse("Subcategory not found", 400);

    const scheduledTimestamp = new Date(validated.scheduledDate).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (scheduledTimestamp < fiveMinutesAgo) return errorResponse("Choose a future or current date", 400);
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

    if (match) {
      await RealtimeService.notifyWorkerAssigned({
        jobId: job._id.toString(),
        workerId: match.userId._id.toString(),
        customerId: user._id.toString(),
        jobDetails: {
          jobNumber: job.jobNumber,
          description: job.description,
          category: category.name,
          address: validated.address,
        },
      });
    } else {
      await RealtimeService.sendRoleNotification({
        role: "worker",
        type: "new_lead_available",
        title: "New Job Lead Available",
        message: `New ${category.name} request in ${validated.address.city}`,
        data: {
          jobId: job._id.toString(),
          jobNumber: job.jobNumber,
          category: category.name,
          city: validated.address.city,
        },
      });
    }

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
    const job = await Job.findById(jobId);
    if (!job) return errorResponse("Job not found", 404);

    const isCustomer = authUser.role === "customer" && String(job.customerId) === authUser.userId;
    const isAssignedWorker = authUser.role === "worker" && String(job.workerId) === authUser.userId;
    const isClaimingWorker =
      authUser.role === "worker" &&
      updates.status === "worker_accepted" &&
      (job.status === "searching" || job.status === "worker_assigned");
    const isAdmin = authUser.role === "admin";

    if (!isCustomer && !isAssignedWorker && !isClaimingWorker && !isAdmin) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const allowedFields = authUser.role === "admin"
      ? ["status", "workerId", "startOtp", "completionOtp", "additionalCharge", "chargeDecision", "materials", "material", "rating", "review"]
      : authUser.role === "worker"
        ? ["status", "startOtp", "completionOtp", "additionalCharge", "materials", "material"]
        : ["status", "completionOtp", "chargeDecision", "rating", "review"];
    if (Object.keys(updates).some((key) => !allowedFields.includes(key))) {
      return errorResponse("Forbidden update fields", 403, "FORBIDDEN");
    }
    if (authUser.role === "customer" && updates.status && !["cancelled", "completed", "rework_requested", "paid"].includes(updates.status)) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    if (updates.status) {
      const validated = updateJobStatusSchema.parse({ status: updates.status });
      assertJobTransition(job.status, validated.status, authUser.role);

      if (validated.status === "worker_accepted") {
        if (!job.workerId || job.status === "searching") {
          job.workerId = authUser.userId as any;
        }
        if (!job.startOtp) {
          job.startOtp = generateOTP();
        }
        await RealtimeService.notifyWorkerAccepted({
          jobId: job._id.toString(),
          workerId: authUser.userId,
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "on_the_way") {
        await RealtimeService.notifyWorkerOnTheWay({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "arrived") {
        await RealtimeService.notifyWorkerArrived({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "work_started") {
        if ((job.startOtpFailures ?? 0) >= 5) return errorResponse("Start code locked. Contact support.", 429, "OTP_RATE_LIMITED");
        if (!job.startOtp || !updates.startOtp || updates.startOtp !== job.startOtp) {
          if (updates.startOtp) await Job.updateOne({ _id: job._id, status: "arrived" }, { $inc: { startOtpFailures: 1, __v: 1 } });
          return errorResponse("Invalid OTP", 400);
        }
        job.startTime = new Date();
        job.startOtp = undefined;
        if (!job.completionOtp) job.completionOtp = generateOTP();
        await RealtimeService.notifyWorkStarted({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "completion_requested") {
        if (!job.completionOtp) job.completionOtp = generateOTP();
        await RealtimeService.notifyWorkCompleted({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "completed") {
        if (!job.completionOtp || !updates.completionOtp || updates.completionOtp !== job.completionOtp) {
          return errorResponse("Invalid OTP", 400);
        }
        job.endTime = new Date();
        job.completionOtp = undefined;
        if (job.pricingModel === "fixed" || job.pricingModel === "visit") job.finalPrice = job.estimatedPrice;
        await RealtimeService.broadcastJobUpdate({
          jobId: job._id.toString(),
          status: "completed",
          customerId: job.customerId.toString(),
          workerId: job.workerId?.toString(),
        });
      }

      if (validated.status === "cancelled") {
        job.cancelledBy = authUser.userId as any;
        await RealtimeService.broadcastJobUpdate({
          jobId: job._id.toString(),
          status: "cancelled",
          customerId: job.customerId.toString(),
          workerId: job.workerId?.toString(),
        });
      }

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

    if ((updates.additionalCharge || updates.materials || updates.material) && !["work_started", "in_progress"].includes(job.status)) return errorResponse("Job costs are locked", 409);
    if (updates.additionalCharge) {
      const chargeDesc = updates.additionalCharge.description || updates.additionalCharge.reason || "Additional Charge";
      job.additionalCharges.push({
        description: chargeDesc,
        reason: chargeDesc,
        amount: updates.additionalCharge.amount,
        status: "pending",
      });
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

    if (updates.material) {
      job.materials.push({
        ...updates.material,
        totalPrice: updates.material.quantity * updates.material.unitPrice,
      });
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

      if (job.workerId) {
        const ratedJobs = await Job.find({ workerId: job.workerId, _id: { $ne: job._id }, rating: { $gt: 0 } }).select("rating").lean();
        const totalRatings = ratedJobs.length + 1;
        const sumRatings = ratedJobs.reduce((sum: number, j: any) => sum + (j.rating || 0), 0) + updates.rating;
        const avgRating = Math.round((sumRatings / totalRatings) * 10) / 10;
        await WorkerProfile.updateOne({ userId: job.workerId }, { $set: { rating: avgRating } });
      }
    }

    await job.save();

    const result = job.toObject();
    if (authUser.role !== "customer" && authUser.role !== "admin") {
      delete result.startOtp;
      delete result.completionOtp;
    }
    return successResponse(result, "Job updated");
  } catch (error) {
    return handleApiError(error);
  }
}
