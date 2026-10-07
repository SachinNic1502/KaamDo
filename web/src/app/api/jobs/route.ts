import mongoose from "mongoose";
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
import { WorkerMatchingService, MAX_CONCURRENT_ACTIVE_JOBS } from "@/lib/services/worker-matching";

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
        // Secure verification & status check: Offline, unverified, or suspended workers see 0 available leads
        const workerProfile = await WorkerProfile.findOne({ userId: authUser.userId }).lean();
        if (!workerProfile || workerProfile.status !== "verified" || !workerProfile.isOnline) {
          return paginatedResponse([], 0, page, limit);
        }

        // Check active job capacity limit: Busy workers at capacity cannot receive new leads
        const activeCount = await Job.countDocuments({
          workerId: authUser.userId,
          status: { $in: ["worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"] },
        });
        if (activeCount >= MAX_CONCURRENT_ACTIVE_JOBS) {
          return paginatedResponse([], 0, page, limit);
        }

        // Find service categories matching worker's skills
        const workerSkills: string[] = workerProfile.skills || [];
        const skillRegexes = workerSkills.map((s) => new RegExp(`^${s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i"));
        const matchingCategories = await ServiceCategory.find({
          $or: [
            { name: { $in: skillRegexes } },
            { slug: { $in: workerSkills.map((s) => s.toLowerCase()) } },
            { "subcategories.name": { $in: skillRegexes } },
            { "subcategories.slug": { $in: workerSkills.map((s) => s.toLowerCase()) } },
          ],
        }).select("_id");

        const categoryIds = matchingCategories.map((c) => c._id);
        const workerCity = workerProfile.location?.city || "Bengaluru";
        const serviceAreaRegexes = [
          new RegExp(`^${workerCity}`, "i"),
          ...(workerProfile.serviceAreas || []).map((a: string) => new RegExp(`^${a.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")}`, "i")),
        ];

        // Only show jobs targeted to this worker or matching their category & service area, and not declined
        filter = {
          status: "searching",
          declinedWorkerIds: { $ne: new mongoose.Types.ObjectId(authUser.userId) },
          $or: [
            { targetWorkerIds: new mongoose.Types.ObjectId(authUser.userId) },
            {
              categoryId: { $in: categoryIds },
              "address.city": { $in: serviceAreaRegexes },
            },
          ],
        };
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

    let category = null;
    if (/^[a-f\d]{24}$/i.test(validated.categoryId)) {
      category = await ServiceCategory.findById(validated.categoryId);
    }
    if (!category) {
      category = await ServiceCategory.findOne({ slug: validated.categoryId });
    }
    if (!category || !category.isActive) return errorResponse("Category not found", 404);

    const subcategory = category.subcategories.find(
      (item: { _id?: unknown; slug?: string; name?: string; isActive?: boolean }) =>
        (item._id && String(item._id) === validated.subcategoryId) ||
        item.slug === validated.subcategoryId ||
        item.name?.toLowerCase() === validated.subcategoryId.toLowerCase()
    );
    if (!subcategory || subcategory.isActive === false) return errorResponse("Subcategory not found", 400);

    const scheduledTimestamp = new Date(validated.scheduledDate).getTime();
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    if (scheduledTimestamp < fiveMinutesAgo) return errorResponse("Choose a future or current date", 400);
    const jobNumber = generateJobNumber();
    const startOtp = generateOTP();

    // Secure Multi-Tier Worker Priority Matching
    // Check Category & Skill -> Check Service Area -> Check Distance -> Check Availability -> Check Active/Verified -> Check Capacity
    const matchResult = await WorkerMatchingService.findEligibleWorkers({
      categoryId: category._id,
      subcategoryId: subcategory._id,
      categoryName: category.name,
      categorySlug: category.slug,
      subcategoryName: subcategory.name,
      subcategorySlug: subcategory.slug,
      address: validated.address,
      scheduledDate: new Date(validated.scheduledDate),
      scheduledTime: validated.scheduledTime,
    });

    const matchedWorkers = matchResult.matchedWorkers;
    const targetWorkerUserIds = matchedWorkers.map((w) => new mongoose.Types.ObjectId(w.userId));

    // Priority matching: Top-matched worker is pre-assigned OR broadcast strictly to matched pool
    const topMatch = matchedWorkers.length > 0 ? matchedWorkers[0] : null;

    const jobSubcategoryId = subcategory._id || new mongoose.Types.ObjectId();
    const job = await Job.create({
      jobNumber,
      customerId: user._id,
      categoryId: category._id,
      subcategoryId: jobSubcategoryId,
      description: validated.description,
      images: validated.images || [],
      address: validated.address,
      scheduledDate: new Date(validated.scheduledDate),
      scheduledTime: validated.scheduledTime,
      status: topMatch ? "worker_assigned" : "searching",
      workerId: topMatch ? new mongoose.Types.ObjectId(topMatch.userId) : undefined,
      targetWorkerIds: targetWorkerUserIds,
      broadcastRadiusKm: matchResult.radiusKmUsed,
      matchingTier: matchResult.tierUsed,
      pricingModel: subcategory.pricingModel,
      estimatedPrice: subcategory.basePrice,
      startOtp,
      startOtpExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    if (topMatch) {
      await RealtimeService.notifyWorkerAssigned({
        jobId: job._id.toString(),
        workerId: topMatch.userId,
        customerId: user._id.toString(),
        jobDetails: {
          jobNumber: job.jobNumber,
          description: job.description,
          category: category.name,
          address: validated.address,
        },
      });
    }

    // Notify ONLY the matched, eligible workers (strictly targeted, no indiscriminate broadcasts)
    if (matchedWorkers.length > 0) {
      await WorkerMatchingService.notifyMatchedWorkers(job, matchedWorkers, category.name);
    }

    return successResponse(
      {
        job,
        matchedWorkers: matchedWorkers.length,
        matchingTier: matchResult.tierUsed,
        searchRadiusKm: matchResult.radiusKmUsed,
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
      ? ["status", "workerId", "startOtp", "completionOtp", "additionalCharge", "chargeDecision", "chargeAction", "chargeId", "materials", "material", "rating", "review"]
      : authUser.role === "worker"
        ? ["status", "startOtp", "completionOtp", "additionalCharge", "materials", "material"]
        : ["status", "completionOtp", "chargeDecision", "chargeAction", "chargeId", "rating", "review"];
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
          job.startOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
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
        if (job.startOtpExpiresAt && new Date() > new Date(job.startOtpExpiresAt)) {
          return errorResponse("Start code has expired. Please request customer to refresh the code.", 400, "OTP_EXPIRED");
        }
        if (!job.startOtp || !updates.startOtp || updates.startOtp !== job.startOtp) {
          if (updates.startOtp) await Job.updateOne({ _id: job._id, status: "arrived" }, { $inc: { startOtpFailures: 1, __v: 1 } });
          return errorResponse("Invalid OTP", 400);
        }
        job.startTime = new Date();
        job.startOtp = undefined;
        job.startOtpExpiresAt = undefined;
        if (!job.completionOtp) {
          job.completionOtp = generateOTP();
          job.completionOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        await RealtimeService.notifyWorkStarted({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "completion_requested") {
        if (!job.completionOtp) {
          job.completionOtp = generateOTP();
          job.completionOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }
        await RealtimeService.notifyWorkCompleted({
          jobId: job._id.toString(),
          workerId: (job.workerId || authUser.userId).toString(),
          customerId: job.customerId.toString(),
        });
      }

      if (validated.status === "completed") {
        if (job.completionOtpExpiresAt && new Date() > new Date(job.completionOtpExpiresAt)) {
          return errorResponse("Completion code has expired. Please request customer to refresh the code.", 400, "OTP_EXPIRED");
        }
        if (!job.completionOtp || !updates.completionOtp || updates.completionOtp !== job.completionOtp) {
          return errorResponse("Invalid OTP", 400);
        }
        job.endTime = new Date();
        job.completionOtp = undefined;
        job.completionOtpExpiresAt = undefined;

        // Synchronize final price before determining next status
        const approvedChargesSum = (job.additionalCharges || [])
          .filter((c: any) => c.status === "approved")
          .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
        const materialsSum = (job.materials || [])
          .reduce((sum: number, m: any) => sum + (m.totalPrice || 0), 0);
        const baseLabor = job.estimatedPrice || 0;
        const totalFinalPrice = Math.round(baseLabor + approvedChargesSum + materialsSum);
        job.finalPrice = totalFinalPrice;

        const nextStatus = totalFinalPrice > 0 ? "payment_pending" : "completed";
        job.status = nextStatus;

        await RealtimeService.broadcastJobUpdate({
          jobId: job._id.toString(),
          status: nextStatus,
          customerId: job.customerId.toString(),
          workerId: job.workerId?.toString(),
          updateData: { status: nextStatus, finalPrice: totalFinalPrice },
        });
      }

      if (validated.status === "cancelled") {
        job.cancelledBy = authUser.userId as any;
        job.status = "cancelled";
        await RealtimeService.broadcastJobUpdate({
          jobId: job._id.toString(),
          status: "cancelled",
          customerId: job.customerId.toString(),
          workerId: job.workerId?.toString(),
        });
      }

      if (validated.status !== "completed" && validated.status !== "cancelled") {
        job.status = validated.status;
      }
    }

    if (updates.workerId) {
      if (!["searching", "worker_assigned", "rejected"].includes(job.status)) return errorResponse("Job cannot be reassigned", 409);
      const worker = await WorkerProfile.findOne({ userId: updates.workerId, status: "verified" });
      const account = await User.findOne({ _id: updates.workerId, role: "worker", isActive: true });
      if (!worker || !account) return errorResponse("Worker unavailable", 400);
      job.workerId = updates.workerId;
      job.startOtp = generateOTP();
      job.startOtpExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
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

    const chargeDecision = updates.chargeDecision || (updates.chargeId && updates.chargeAction ? {
      chargeId: updates.chargeId,
      decision: (updates.chargeAction === "approve" || updates.chargeAction === "approved") ? ("approved" as const) : ("rejected" as const),
    } : null);

    if (chargeDecision) {
      if (!["work_started", "in_progress", "completion_requested"].includes(job.status)) {
        return errorResponse("Job costs are locked", 409);
      }
      const charge = job.additionalCharges.find(
        (c: { _id?: unknown }) => String(c._id) === chargeDecision.chargeId
      );
      if (!charge) return errorResponse("Charge not found", 404);
      if (charge.status !== "pending") {
        return errorResponse("Charge has already been decided", 409, "INVALID_JOB_STATE");
      }
      charge.status = chargeDecision.decision;
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

    // Always keep job.finalPrice synchronized with base labor + approved extra labor + materials
    const approvedChargesSum = (job.additionalCharges || [])
      .filter((c: any) => c.status === "approved")
      .reduce((sum: number, c: any) => sum + (c.amount || 0), 0);
    const materialsSum = (job.materials || [])
      .reduce((sum: number, m: any) => sum + (m.totalPrice || 0), 0);
    const baseLabor = job.estimatedPrice || 0;
    job.finalPrice = Math.round(baseLabor + approvedChargesSum + materialsSum);

    if (chargeDecision || updates.material || updates.materials || updates.additionalCharge) {
      await RealtimeService.broadcastJobUpdate({
        jobId: job._id.toString(),
        status: job.status,
        customerId: job.customerId.toString(),
        workerId: job.workerId?.toString(),
        updateData: {
          additionalCharges: job.additionalCharges,
          materials: job.materials,
          finalPrice: job.finalPrice,
        },
      });
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
