import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs/promises";
import { requireAuth } from "@/lib/auth-middleware";
import { successResponse, errorResponse } from "@/lib/api-response";
import { handleApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const authUser = await requireAuth(request);
    const contentType = request.headers.get("content-type") || "";

    // 1. Direct Multipart Form-Data File Upload
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      const folderParam = formData.get("folder") as string | null;
      const folder = (folderParam || "general").replace(/[^a-z0-9_-]/gi, "");

      if (!file) {
        return errorResponse("No file provided", 400);
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Sanitize extension and generate unique name
      const originalName = file.name || "upload.jpg";
      const ext = path.extname(originalName) || ".jpg";
      const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;

      const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
      await fs.mkdir(uploadDir, { recursive: true });

      const filePath = path.join(uploadDir, uniqueName);
      await fs.writeFile(filePath, buffer);

      const publicUrl = `/uploads/${folder}/${uniqueName}`;
      return NextResponse.json({
        success: true,
        data: {
          url: publicUrl,
          filename: uniqueName,
          size: buffer.length,
          mimetype: file.type,
        },
        url: publicUrl, // Direct top-level access for mobile compatibility
        message: "File uploaded successfully",
      });
    }

    // 2. JSON Request for Cloudinary Signature / Upload Parameters
    const body = await request.json().catch(() => ({}));
    const folder = typeof body.folder === "string" ? body.folder.replace(/[^a-z0-9_-]/gi, "") : "kaamdo";
    const timestamp = Math.floor(Date.now() / 1000);

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (cloudName && apiKey && apiSecret) {
      const paramString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
      const signature = crypto.createHash("sha1").update(paramString).digest("hex");

      return successResponse(
        {
          uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          apiKey,
          timestamp,
          folder,
          signature,
        },
        "Upload signature generated"
      );
    }

    return successResponse(
      {
        uploadUrl: process.env.EXPO_PUBLIC_CLOUDINARY_URL || "https://api.cloudinary.com/v1_1/kaamdo/image/upload",
        apiKey: apiKey || "demo",
        timestamp,
        folder,
        signature: crypto.createHash("sha1").update(`folder=${folder}&timestamp=${timestamp}`).digest("hex"),
      },
      "Upload parameters generated"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
