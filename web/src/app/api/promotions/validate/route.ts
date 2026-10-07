import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { handleApiError } from "@/lib/api-error";
import { z } from "zod";

const validatePromoSchema = z.object({
  code: z.string().min(1, "Promo code is required"),
  orderAmount: z.number().min(0).default(0),
});

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireAuth(request);

    const body = await request.json();
    const { code: rawCode, orderAmount } = validatePromoSchema.parse(body);
    const code = rawCode.trim().toUpperCase();

    const promo = await PromoCode.findOne({ code, isActive: true });
    if (!promo) {
      return errorResponse("Invalid or inactive promo code", 404);
    }

    const now = new Date();
    if (promo.startDate && promo.startDate > now) {
      return errorResponse("Promo code is not active yet", 400);
    }
    if (promo.endDate && promo.endDate < now) {
      return errorResponse("Promo code has expired", 400);
    }
    if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
      return errorResponse(
        `Minimum order amount of ₹${promo.minOrderAmount} required`,
        400
      );
    }
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
      return errorResponse("Promo code usage limit reached", 400);
    }

    let discount = 0;
    const promoType = (promo as any).type || (promo as any).discountType || "percentage";
    const promoVal = Number((promo as any).value ?? (promo as any).discountValue ?? 0);

    if (promoType === "percentage") {
      discount = Math.round((orderAmount * promoVal) / 100);
      if (promo.maxDiscount && discount > promo.maxDiscount) {
        discount = promo.maxDiscount;
      }
    } else {
      discount = promoVal;
    }
    discount = Math.min(discount, orderAmount);

    return successResponse({
      valid: true,
      code: promo.code,
      discount,
      discountType: promoType,
      discountValue: promoVal,
      promoId: promo._id.toString(),
      message: `Promo code ${promo.code} applied! Saved ₹${discount}`,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
