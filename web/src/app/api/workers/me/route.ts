import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Only workers can access worker profile", 403, "FORBIDDEN");
    }

    let profile = await WorkerProfile.findOne({ userId: authUser.userId })
      .populate("userId", "name phone email avatar role")
      .lean();

    if (!profile) {
      const user = await User.findById(authUser.userId).select("name phone email avatar role").lean();
      return successResponse({
        userId: user,
        skills: [],
        serviceAreas: [],
        experience: 0,
        hourlyRate: 0,
        dailyRate: 0,
        status: "draft",
        isOnline: false,
      });
    }

    return successResponse(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const updates = await request.json();

    let profile = await WorkerProfile.findOne({ userId: authUser.userId });

    if (!profile) {
      profile = await WorkerProfile.create({
        userId: authUser.userId,
        skills: updates.skills || ["General Services"],
        serviceAreas: updates.serviceAreas || ["Local"],
        status: updates.status || "draft",
        ...updates,
      });
    } else {
      const allowedFields = [
        "skills",
        "experience",
        "serviceAreas",
        "hourlyRate",
        "dailyRate",
        "availability",
        "bankDetails",
        "bio",
        "isOnline",
      ];

      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          (profile as any)[key] = updates[key];
        }
      }

      await profile.save();
    }

    const populated = await WorkerProfile.findById(profile._id)
      .populate("userId", "name phone email avatar")
      .lean();

    return successResponse(populated, "Worker profile updated");
  } catch (error) {
    return handleApiError(error);
  }
}
