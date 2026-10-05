import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PlatformSetting } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth, getAuthUser } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const commissionRuleSchema = z.object({
  category: z.string().min(1),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0).max(100000),
});

const cancellationPolicySchema = z.object({
  status: z.string().min(1),
  fee: z.string().min(1),
});

const notificationSettingSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  enabled: z.boolean(),
});

const updateSettingsSchema = z.object({
  platformName: z.string().min(1).max(100).optional(),
  tagline: z.string().max(200).optional(),
  supportEmail: z.string().email().optional(),
  supportPhone: z.string().max(30).optional(),
  description: z.string().max(2000).optional(),
  commissionRules: z.array(commissionRuleSchema).optional(),
  cancellationPolicies: z.array(cancellationPolicySchema).optional(),
  notifications: z.array(notificationSettingSchema).optional(),
  serviceAreas: z.array(z.string().min(1).max(100)).optional(),
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    let settings = await PlatformSetting.findOne().lean();
    if (!settings) {
      settings = await PlatformSetting.create({});
    }

    return successResponse(settings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden - Admin access required", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const validated = updateSettingsSchema.parse(body);

    let settings = await PlatformSetting.findOne();
    if (!settings) {
      settings = new PlatformSetting({
        ...validated,
        updatedBy: authUser.userId,
      });
    } else {
      Object.assign(settings, validated);
      settings.updatedBy = authUser.userId;
    }

    await settings.save();

    return successResponse(settings, "Platform settings updated successfully");
  } catch (error) {
    return handleApiError(error);
  }
}
