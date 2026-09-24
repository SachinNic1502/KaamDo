import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PaymentMethod } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { objectIdSchema } from "@/lib/security-schemas";
import { z } from "zod";

const createMethodSchema = z.object({
  type: z.enum(["card", "bank", "upi"]),
  last4: z.string().regex(/^\d{4}$/).optional(),
  brand: z.string().max(30).optional(),
  isDefault: z.boolean().optional(),
  bankDetails: z.object({
    ifsc: z.string().max(20).optional(),
    accountNumber: z.string().max(34).optional(),
    upiId: z.string().max(100).optional(),
  }).strict().optional(),
  cardDetails: z.object({
    expMonth: z.number().int().min(1).max(12).optional(),
    expYear: z.number().int().min(2020).max(2100).optional(),
    holderName: z.string().max(100).optional(),
  }).strict().optional(),
}).strict().superRefine((v, ctx) => {
  if (v.type === "card" && (!v.last4 || !v.brand)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "last4 and brand are required for card" });
  }
  if (v.type === "bank" && (!v.bankDetails?.ifsc || !v.bankDetails?.accountNumber) && !v.bankDetails?.upiId) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: "IFSC and account number (or UPI id) are required for bank" });
  }
});

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const methods = await PaymentMethod.find({ userId: authUser.userId })
      .sort({ isDefault: -1, createdAt: -1 })
      .lean();

    return successResponse(methods);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const validated = createMethodSchema.parse(await request.json());

    // Only display metadata is stored — never full PAN/CVV.
    // Unset any existing default first so concurrent creates converge on one default.
    if (validated.isDefault) {
      await PaymentMethod.updateMany(
        { userId: authUser.userId, isDefault: true },
        { $set: { isDefault: false } }
      );
    }

    const paymentMethod = await PaymentMethod.create({
      userId: authUser.userId,
      type: validated.type,
      last4: validated.last4,
      brand: validated.brand,
      isDefault: validated.isDefault ?? false,
      bankDetails: validated.bankDetails,
      cardDetails: validated.cardDetails,
    });

    return successResponse(paymentMethod, "Payment method saved", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const rawId = searchParams.get("methodId");
    const body = await request.json().catch(() => ({}));
    const methodId = objectIdSchema.parse(rawId ?? (body as { methodId?: unknown }).methodId);

    const method = await PaymentMethod.findOne({ _id: methodId, userId: authUser.userId });
    if (!method) return errorResponse("Payment method not found", 404);

    // Only supported PATCH operation: set default. Reject anything else.
    if ((body as { isDefault?: unknown }).isDefault !== true) {
      return errorResponse("Only setting a default payment method is supported", 400, "INVALID_REQUEST");
    }

    await PaymentMethod.updateMany(
      { userId: authUser.userId, isDefault: true },
      { $set: { isDefault: false } }
    );
    const updated = await PaymentMethod.findOneAndUpdate(
      { _id: methodId, userId: authUser.userId },
      { $set: { isDefault: true } },
      { new: true, runValidators: true }
    ).lean();

    return successResponse(updated, "Default payment method updated");
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const methodId = objectIdSchema.parse(searchParams.get("methodId"));
    const ownerFilter = { _id: methodId, userId: authUser.userId };

    // Prevent removing the last default payment method
    const method = await PaymentMethod.findOne(ownerFilter);
    if (!method) return errorResponse("Payment method not found", 404);

    if (method.isDefault) {
      const count = await PaymentMethod.countDocuments({
        userId: authUser.userId,
        isDefault: true,
      });
      if (count === 1) {
        return errorResponse("Cannot remove the only default payment method", 400);
      }
    }

    await PaymentMethod.findOneAndDelete(ownerFilter);
    return successResponse(null, "Payment method removed");
  } catch (error) {
    return handleApiError(error);
  }
}
