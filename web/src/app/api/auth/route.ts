import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { deliverOtp } from "@/lib/services/otp-delivery";
import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { signJWT, generateOTP, hashPassword, verifyPassword } from "@/lib/auth";
import { successResponse, errorResponse } from "@/lib/api-response";
import { phoneSchema, otpSchema, loginSchema, passwordChangeSchema } from "@/lib/validations";
import { authRateLimit } from "@/lib/middleware/rate-limit";
import { OtpStorage } from "@/lib/services/redis-client";

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await authRateLimit(request);
    if (rateLimitResult) {
      return rateLimitResult;
    }

    await connectDB();
    const body = await request.json();

    const action = body.action || "send-otp";

    if (action === "send-otp") {
      const validated = phoneSchema.parse(body);

      await OtpStorage.reserveSend(validated.phone);
      const otp = generateOTP();
      await OtpStorage.storeOtp(validated.phone, otp);
      try { await deliverOtp(validated.phone, otp); }
      catch (error) { await OtpStorage.deleteOtp(validated.phone); throw error; }
      return successResponse({
        phone: validated.phone,
        otpExpiresIn: 300
      }, "OTP sent successfully");
    }

    if (action === "resend-otp") {
      const validated = phoneSchema.parse(body);

      await OtpStorage.reserveSend(validated.phone);
      const otp = generateOTP();
      await OtpStorage.storeOtp(validated.phone, otp);
      try { await deliverOtp(validated.phone, otp); }
      catch (error) { await OtpStorage.deleteOtp(validated.phone); throw error; }
      return successResponse({
        phone: validated.phone,
        otpExpiresIn: 300
      }, "OTP resent successfully");
    }

    if (action === "verify-otp") {
      const validated = otpSchema.parse(body);

      // Consume the challenge atomically; never bypass failed OTP storage.
      let isValid = false;
      try {
        isValid = await OtpStorage.verifyOtp(validated.phone, validated.otp);
      } catch {
        return errorResponse("OTP verification service unavailable. Please try again.", 503);
      }

      if (!isValid) {
        return errorResponse("Invalid OTP or expired. Please request a new one.", 400);
      }

      let user = await User.findOne({ phone: validated.phone });

      if (!user) {
        user = await User.findOneAndUpdate({ phone: validated.phone }, { $setOnInsert: {
          name: `User ${validated.phone.slice(-4)}`,
          phone: validated.phone,
          role: "customer",
          isActive: true,
          isPhoneVerified: true,
          passwordChangedAt: new Date(),
        } }, { upsert: true, new: true, runValidators: true });
      }
      if (user.isActive && !user.isPhoneVerified) { user.isPhoneVerified = true; await user.save(); }

      if (!user.isActive) return errorResponse("Account unavailable", 403);
      const token = await signJWT({
        userId: user._id.toString(),
        sessionVersion: user.sessionVersion ?? 0,
        role: user.role,
        phone: user.phone,
      });

      return successResponse({
        user: {
          id: user._id,
          _id: user._id,
          isActive: user.isActive,
          notificationSettings: user.notificationSettings,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      }, "Login successful");
    }

    if (action === "login") {
      const validated = loginSchema.parse(body);
      await OtpStorage.reservePasswordAttempt(validated.phone);

      const user = await User.findOne({ phone: validated.phone });
      if (!user || !user.isActive || !user.password) {
        return errorResponse("Invalid credentials", 401);
      }

      // Check if account is locked
      if (user.lockUntil && user.lockUntil > new Date()) {
        return errorResponse("Account is temporarily locked. Please try again later.", 423);
      }

      // Verify password
      const isPasswordValid = await verifyPassword(validated.password, user.password);
      if (!isPasswordValid) {
        // Increment failed login attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

        // Lock account after 5 failed attempts
        if (user.failedLoginAttempts >= 5) {
          user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
        }

        await user.save();
        return errorResponse("Invalid credentials", 401);
      }

      // Reset failed login attempts on successful login
      user.failedLoginAttempts = 0;
      user.lockUntil = undefined;
      await user.save();

      const token = await signJWT({
        userId: user._id.toString(),
        sessionVersion: user.sessionVersion ?? 0,
        role: user.role,
        phone: user.phone,
      });

      return successResponse({
        user: {
          id: user._id,
          _id: user._id,
          isActive: user.isActive,
          notificationSettings: user.notificationSettings,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      }, "Login successful");
    }

    if (action === "change-password") {
      const validated = passwordChangeSchema.parse(body);

      const principal = await requireAuth(request);
      const user = await User.findById(principal.userId);
      if (!user?.password) return errorResponse("Password login is not set up", 400);
      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(validated.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return errorResponse("Current password is incorrect", 400);
      }

      // Hash and update new password
      user.password = await hashPassword(validated.newPassword);
      user.passwordChangedAt = new Date();
      await user.save();

      return successResponse(null, "Password changed successfully");
    }

    if (action === "logout") {
      const principal = await requireAuth(request);
      await User.updateOne({ _id: principal.userId }, { $inc: { sessionVersion: 1 } });
      const response = successResponse(null, "Signed out on all devices");
      response.cookies.delete("token");
      return response;
    }
    return errorResponse("Invalid action", 400);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const principal = await requireAuth(request);
    const user = await User.findById(principal.userId).select("_id name phone email role avatar isActive notificationSettings").lean();
    return successResponse(user);
  } catch (error) { return handleApiError(error); }
}
