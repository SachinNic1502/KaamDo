import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { paginationSchema, workerProfileSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status, skill } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};
    if (search) {
      const userIds = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { phone: { $regex: search, $options: "i" } },
        ],
      }).distinct("_id");
      filter.userId = { $in: userIds };
    }
    if (status) filter.status = status;
    if (skill) filter.skills = { $in: [skill] };

    const total = await WorkerProfile.countDocuments(filter);
    const workers = await WorkerProfile.find(filter)
      .populate("userId", "name phone email avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(workers, total, page, limit);
  } catch (error) {
    console.error("Get workers error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker") {
      return errorResponse("Only workers can create profiles", 403);
    }

    const body = await request.json();
    const validated = workerProfileSchema.parse(body);

    const existing = await WorkerProfile.findOne({ userId: authUser.userId });
    if (existing) {
      return errorResponse("Profile already exists", 409);
    }

    const profile = await WorkerProfile.create({
      userId: authUser.userId,
      ...validated,
      status: "draft",
    });

    return successResponse(profile, "Worker profile created");
  } catch (error) {
    console.error("Create worker profile error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { workerId, ...updates } = body;

    const targetId = authUser.role === "admin" ? workerId : authUser.userId;
    if (!targetId) return errorResponse("workerId is required for admin");

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: targetId },
      updates,
      { new: true }
    ).populate("userId", "name phone email avatar");

    if (!profile) return errorResponse("Worker profile not found", 404);

    return successResponse(profile, "Worker profile updated");
  } catch (error) {
    console.error("Update worker profile error:", error);
    return errorResponse("Internal server error", 500);
  }
}
