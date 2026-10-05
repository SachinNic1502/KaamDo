import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const pushToken = body.token || body.pushToken;
    const platform = body.platform || "expo";

    if (!pushToken || typeof pushToken !== "string") {
      return errorResponse("Push token is required", 400);
    }

    await User.findByIdAndUpdate(authUser.userId, {
      $set: {
        pushToken,
        pushTokenPlatform: platform,
        pushTokenUpdatedAt: new Date(),
      },
    });

    return successResponse(
      { registered: true, platform, token: pushToken },
      "Push token registered successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
