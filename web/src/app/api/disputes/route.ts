import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Dispute, Job, User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createDisputeSchema, paginationSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";
import { resourceScope } from "@/lib/resource-policy";
import { objectIdSchema } from "@/lib/security-schemas";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = resourceScope(authUser, "disputes");

    if (search) {
      filter.$or = [
        { reason: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const total = await Dispute.countDocuments(filter);
    const disputes = await Dispute.find(filter)
      .populate("jobId", "jobNumber")
      .populate("raisedBy", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(disputes, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const validated = createDisputeSchema.parse(body);

    const user = await User.findOne({ phone: authUser.phone });
    if (!user) return errorResponse("User not found", 404);

    objectIdSchema.parse(validated.jobId);
    const job = await Job.findOne({ _id: validated.jobId, ...resourceScope(authUser, "jobs") });
    if (!job) return errorResponse("Job not found", 404);

    const dispute = await Dispute.create({
      jobId: validated.jobId,
      raisedBy: user._id,
      reason: validated.reason,
      description: validated.description,
      images: validated.images || [],
      status: "raised",
    });

    job.status = "disputed";
    await job.save();

    return successResponse(dispute, "Dispute raised", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { disputeId, status, resolution } = body;

    if (!disputeId) return errorResponse("disputeId is required");

    const dispute = await Dispute.findById(disputeId);
    if (!dispute) return errorResponse("Dispute not found", 404);

    if (status) dispute.status = status;
    if (resolution) {
      dispute.resolution = resolution;
      const admin = await User.findOne({ phone: authUser.phone });
      if (admin) dispute.resolvedBy = admin._id;
      dispute.resolvedAt = new Date();
    }

    await dispute.save();

    return successResponse(dispute, "Dispute updated");
  } catch (error) {
    return handleApiError(error);
  }
}
