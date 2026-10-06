import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { generateOTP } from "@/lib/auth";
import { deliverOtp } from "@/lib/services/otp-delivery";
import { OtpStorage } from "@/lib/services/redis-client";
import { successResponse, errorResponse } from "@/lib/api-response";
import { phoneSchema } from "@/lib/validations";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With, X-Environment",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const validated = phoneSchema.parse(body);

    const user = await User.findOne({ phone: validated.phone });
    if (!user) {
      return errorResponse("No account found with this phone number", 404);
    }

    const otp = generateOTP();
    await OtpStorage.storeOtp(validated.phone, otp);

    try {
      await deliverOtp(validated.phone, otp);
    } catch {
      // In dev fallback
    }

    return successResponse(
      {
        phone: validated.phone,
        otpExpiresIn: 300,
        demoOtp: otp,
      },
      "Password reset code sent"
    );
  } catch (error: any) {
    return errorResponse(error.message || "Failed to process request", 400);
  }
}
