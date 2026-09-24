import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { getAuthUser, requireAuth } from "@/lib/auth-middleware";
import { workerProfileSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";
import { escapeSearch, workerSearchSchema, workerSelfUpdateSchema, workerAdminUpdateSchema } from "@/lib/security-schemas";

const publicFields = "_id userId skills experience serviceAreas hourlyRate dailyRate status isOnline rating totalJobs";
const privateFields = "bankDetails documents";

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser && (request.headers.has("authorization") || request.cookies.get("token"))) {
      return errorResponse("Unauthorized", 401, "UNAUTHORIZED");
    }
    const isAdmin = authUser?.role === "admin";
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status, skill, minPrice, maxPrice, minRating } =
      workerSearchSchema.parse(query);

    const filter: Record<string, unknown> = {};
    const userFilter: Record<string, unknown> = { role: "worker" };
    if (!isAdmin) userFilter.isActive = true;
    if (search) {
      const literalSearch = escapeSearch(search);
      userFilter.$or = [
        { name: { $regex: literalSearch, $options: "i" } },
        ...(isAdmin ? [{ phone: { $regex: literalSearch, $options: "i" } }] : []),
      ];
    }
    const userIds = await User.find(userFilter).distinct("_id");
    filter.userId = { $in: userIds };
    if (!isAdmin && status && status !== "verified") {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }
    if (!isAdmin) filter.status = "verified";
    else if (status) filter.status = status;
    if (skill) filter.skills = { $in: [skill] };

    // NEW: Price filtering (hourlyRate from worker profile)
    if (minPrice !== undefined || maxPrice !== undefined) {
      const rateFilter: Record<string, number> = {};
      if (minPrice !== undefined) rateFilter.$gte = minPrice;
      if (maxPrice !== undefined) rateFilter.$lte = maxPrice;
      filter.hourlyRate = rateFilter;
    }

    // NEW: Rating filtering
    if (minRating !== undefined) {
      filter.rating = { $gte: minRating };
    }

    const total = await WorkerProfile.countDocuments(filter);
    const workers = await WorkerProfile.find(filter)
      .select(isAdmin ? `${publicFields} ${privateFields} createdAt updatedAt` : publicFields)
      .populate("userId", isAdmin ? "name phone email avatar" : "name avatar")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(workers, total, page, limit);
  } catch (error) {
    return handleApiError(error);
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
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (!["worker", "admin"].includes(authUser.role)) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }
    const body = await request.json();
    const { workerId, ...updates } = (authUser.role === "admin"
      ? workerAdminUpdateSchema
      : workerSelfUpdateSchema).parse(body);
    if (authUser.role !== "admin" && workerId && workerId !== authUser.userId) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }
    if (Object.keys(updates).length === 0) return errorResponse("No updates provided", 400);

    const targetId = authUser.role === "admin" ? workerId : authUser.userId;
    if (!targetId) return errorResponse("workerId is required for admin");

    const profile = await WorkerProfile.findOneAndUpdate(
      { userId: targetId },
      { $set: updates },
      { new: true, runValidators: true }
    ).select(publicFields).populate("userId", "name avatar");

    if (!profile) return errorResponse("Worker profile not found", 404);

    return successResponse(profile, "Worker profile updated");
  } catch (error) {
    return handleApiError(error);
  }
}