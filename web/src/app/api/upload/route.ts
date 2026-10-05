import { NextRequest } from "next/server";
import crypto from "node:crypto";
import { requireAuth } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);

    const body = await request.json().catch(() => ({}));
    const folder = typeof body.folder === "string" ? body.folder.replace(/[^a-z0-9_-]/gi, "") : "kaamdo";
    const timestamp = Math.floor(Date.now() / 1000);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      // Build signature string: params sorted alphabetically
      const paramString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramString).digest("hex");

      return successResponse({
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        apiKey,
        timestamp,
        folder,
        signature,
      }, "Upload signature generated");
    }

    // Fallback signature configuration if env keys are pending
    return successResponse({
      uploadUrl: process.env.EXPO_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/kaamdo/image/upload",
      apiKey: apiKey || "demo",
      timestamp,
      folder,
      signature: crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}`).digest("hex"),
    }, "Upload parameters generated");
  } catch (error) {
    return handleApiError(error);
  }
}
