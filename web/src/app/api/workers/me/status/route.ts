import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { WorkerProfile, User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { RealtimeService } from "@/lib/services/realtime";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    let profile = await WorkerProfile.findOne({ userId: authUser.userId }).lean();
    if (!profile) {
      return successResponse({ isOnline: false, status: "offline" });
    }

    return successResponse({
      isOnline: profile.isOnline ?? false,
      status: profile.status || (profile.isOnline ? "available" : "offline"),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker" && authUser.role !== "admin") {
      return errorResponse("Only workers can update online dispatch status", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const isOnline = Boolean(body.isOnline);

    let profile = await WorkerProfile.findOne({ userId: authUser.userId });

    if (!profile) {
      // Auto-initialize profile if it does not exist yet
      const user = await User.findById(authUser.userId);
      profile = await WorkerProfile.create({
        userId: authUser.userId,
        skills: ["General Services"],
        serviceAreas: ["Local"],
        status: isOnline ? "available" : "offline",
        isOnline,
      });
    } else {
      profile.isOnline = isOnline;
      if (profile.status === "available" || profile.status === "offline") {
        profile.status = isOnline ? "available" : "offline";
      }
      await profile.save();
    }

    // Broadcast status change via RealtimeService
    try {
      await RealtimeService.sendRoleNotification({
        role: "admin",
        type: "worker_status_update",
        title: "Worker Status Changed",
        message: `Worker ${authUser.userId} is now ${isOnline ? "ONLINE" : "OFFLINE"}`,
        data: {
          workerId: authUser.userId,
          isOnline,
        },
      });
    } catch {
      // Non-blocking notification
    }

    return successResponse(
      {
        isOnline: profile.isOnline,
        status: profile.status,
      },
      `Worker is now ${isOnline ? "online" : "offline"}`
    );
  } catch (error) {
    return handleApiError(error);
  }
}
