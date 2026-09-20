import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, WorkerProfile } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { paginationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (!["admin"].includes(authUser.role)) {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status, role } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(users, total, page, limit);
  } catch (error) {
    console.error("Get users error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (!["admin"].includes(authUser.role)) {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { userId, ...updates } = body;

    if (!userId) return errorResponse("userId is required");

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-__v");
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user, "User updated");
  } catch (error) {
    console.error("Update user error:", error);
    return errorResponse("Internal server error", 500);
  }
}
