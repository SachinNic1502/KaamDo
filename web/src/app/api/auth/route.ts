import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { signJWT, generateOTP } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { phoneSchema, otpSchema } from "@/lib/validations";

const otpStore = new Map<string, { otp: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();

    const action = body.action || "send-otp";

    if (action === "send-otp") {
      const validated = phoneSchema.parse(body);

      const otp = generateOTP();
      otpStore.set(validated.phone, {
        otp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      });

      console.log(`[DEV] OTP for ${validated.phone}: ${otp}`);

      return successResponse({ phone: validated.phone }, "OTP sent successfully");
    }

    if (action === "verify-otp") {
      const validated = otpSchema.parse(body);

      const stored = otpStore.get(validated.phone);
      if (!stored) {
        return errorResponse("OTP not found. Please request a new one.", 404);
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(validated.phone);
        return errorResponse("OTP expired. Please request a new one.", 410);
      }

      if (stored.otp !== validated.otp) {
        return errorResponse("Invalid OTP", 400);
      }

      otpStore.delete(validated.phone);

      let user = await User.findOne({ phone: validated.phone });

      if (!user) {
        user = await User.create({
          name: `User ${validated.phone.slice(-4)}`,
          phone: validated.phone,
          role: "customer",
          isActive: true,
        });
      }

      const token = await signJWT({
        userId: user._id.toString(),
        role: user.role,
        phone: user.phone,
      });

      return successResponse({
        user: {
          id: user._id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      }, "Login successful");
    }

    return errorResponse("Invalid action", 400);
  } catch (error) {
    console.error("Auth error:", error);
    if (error instanceof Error && error.message.includes("validation")) {
      return errorResponse(error.message, 400);
    }
    return errorResponse("Internal server error", 500);
  }
}
