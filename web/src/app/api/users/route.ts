import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-middleware";
import { paginationSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/api-error";
import { escapeSearch, userSelfUpdateSchema, userAdminUpdateSchema } from "@/lib/security-schemas";

const userFields = "_id name phone email role avatar isActive isEmailVerified isPhoneVerified notificationSettings createdAt updatedAt";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    await requireRole(request, ["admin"]);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, role } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: escapeSearch(search), $options: "i" } },
        { email: { $regex: escapeSearch(search), $options: "i" } },
        { phone: { $regex: escapeSearch(search), $options: "i" } },
      ];
    }
    if (role) filter.role = role;

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select(userFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(users, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { userId, ...updates } = (authUser.role === "admin"
      ? userAdminUpdateSchema
      : userSelfUpdateSchema).parse(body);
    if (authUser.role !== "admin" && userId !== authUser.userId) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }
    if (Object.keys(updates).length === 0) return errorResponse("No updates provided", 400);

    const user = await User.findByIdAndUpdate(userId, { $set: updates }, {
      new: true, runValidators: true,
    }).select(userFields);
    if (!user) return errorResponse("User not found", 404);

    return successResponse(user, "User updated");
  } catch (error) {
    return handleApiError(error);
  }
}
