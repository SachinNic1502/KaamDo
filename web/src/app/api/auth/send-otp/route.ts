import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { generateOTP } from "@/lib/auth";
import { deliverOtp } from "@/lib/services/otp-delivery";
import { OtpStorage } from "@/lib/services/redis-client";
import { successResponse, errorResponse } from "@/lib/api-response";
import { phoneSchema } from "@/lib/validations";
import { authRateLimit } from "@/lib/middleware/rate-limit";

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitResult = await authRateLimit(request);
    if (rateLimitResult) return rateLimitResult;

    await connectDB();
    const body = await request.json();
    const validated = phoneSchema.parse(body);

    await OtpStorage.reserveSend(validated.phone);
    const otp = generateOTP();
    await OtpStorage.storeOtp(validated.phone, otp);

    try {
      await deliverOtp(validated.phone, otp);
    } catch (error) {
      await OtpStorage.deleteOtp(validated.phone);
      throw error;
    }

    return successResponse(
      {
        phone: validated.phone,
        otpExpiresIn: 300,
        demoOtp: otp,
        otp,
      },
      "OTP sent successfully"
    );
  } catch (error: any) {
    return errorResponse(error.message || "Failed to send OTP", 400);
  }
}
