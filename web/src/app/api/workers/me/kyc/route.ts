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

    if (authUser.role !== "worker") {
      return errorResponse("Only workers can access their KYC profile", 403, "FORBIDDEN");
    }

    const profile = await WorkerProfile.findOne({ userId: authUser.userId })
      .select("kyc bankDetails status documents")
      .lean();

    if (!profile) {
      return errorResponse("Worker profile not found", 404, "NOT_FOUND");
    }

    return successResponse(
      {
        kyc: profile.kyc || { status: "not_submitted" },
        bankDetails: profile.bankDetails || {},
        overallStatus: profile.status,
      },
      "KYC status retrieved"
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "worker") {
      return errorResponse("Only workers can submit KYC", 403, "FORBIDDEN");
    }

    const body = await request.json();
    const { kyc, bankDetails } = body;

    const updateFields: Record<string, unknown> = {};

    if (kyc) {
      if (kyc.aadhaarNumber) updateFields["kyc.aadhaarNumber"] = kyc.aadhaarNumber.trim();
      if (kyc.panNumber) updateFields["kyc.panNumber"] = kyc.panNumber.trim().toUpperCase();
      if (kyc.aadhaarFrontUrl) updateFields["kyc.aadhaarFrontUrl"] = kyc.aadhaarFrontUrl;
      if (kyc.panCardUrl) updateFields["kyc.panCardUrl"] = kyc.panCardUrl;
      if (kyc.tradeCertificateUrl) updateFields["kyc.tradeCertificateUrl"] = kyc.tradeCertificateUrl;
      updateFields["kyc.status"] = "pending";
      updateFields["kyc.submittedAt"] = new Date();
      updateFields["status"] = "under_review";
    }

    if (bankDetails) {
      if (bankDetails.accountHolderName) updateFields["bankDetails.accountHolderName"] = bankDetails.accountHolderName;
      if (bankDetails.bankName) updateFields["bankDetails.bankName"] = bankDetails.bankName;
      if (bankDetails.accountNumber) updateFields["bankDetails.accountNumber"] = bankDetails.accountNumber;
      if (bankDetails.ifscCode || bankDetails.ifsc) {
        const code = (bankDetails.ifscCode || bankDetails.ifsc).toUpperCase();
        updateFields["bankDetails.ifsc"] = code;
        updateFields["bankDetails.ifscCode"] = code;
      }
      if (bankDetails.upi) updateFields["bankDetails.upi"] = bankDetails.upi;
    }

    const updatedProfile = await WorkerProfile.findOneAndUpdate(
      { userId: authUser.userId },
      { $set: updateFields },
      { new: true, upsert: true }
    );

    // Notify admins via socket
    try {
      await RealtimeService.sendRoleNotification({
        role: "admin",
        title: "New KYC Verification Request",
        message: `Worker has submitted identity & bank verification documents.`,
        data: { workerId: authUser.userId, status: "pending" },
      });
    } catch (e) {
      console.warn("Could not emit admin notification:", e);
    }

    return successResponse(
      {
        kyc: updatedProfile.kyc,
        bankDetails: updatedProfile.bankDetails,
        status: updatedProfile.status,
      },
      "KYC submitted successfully"
    );
  } catch (error) {
    return handleApiError(error);
  }
}
