import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { PromoCode } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createPromoSchema, paginationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};
    const activeOnly = searchParams.get("active") === "true" || searchParams.get("active") === "1";
    if (activeOnly) {
      filter.isActive = true;
      filter.startDate = { $lte: new Date() };
      filter.endDate = { $gte: new Date() };
    }
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const total = await PromoCode.countDocuments(filter);
    const promos = await PromoCode.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(promos, total, page, limit);
  } catch (error) {
    console.error("Get promos error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();

    if (body.action === "validate") {
      const code = String(body.code || "").trim().toUpperCase();
      const orderAmount = Number(body.orderAmount || 0);
      if (!code) return errorResponse("Promo code is required", 400);

      const promo = await PromoCode.findOne({ code, isActive: true });
      if (!promo) return errorResponse("Invalid or inactive promo code", 404);

      const now = new Date();
      if (promo.startDate && promo.startDate > now) return errorResponse("Promo code is not active yet", 400);
      if (promo.endDate && promo.endDate < now) return errorResponse("Promo code has expired", 400);
      if (promo.minOrderAmount && orderAmount < promo.minOrderAmount) {
        return errorResponse(`Minimum order amount of ₹${promo.minOrderAmount} required`, 400);
      }
      if (promo.usageLimit && promo.usedCount >= promo.usageLimit) {
        return errorResponse("Promo code usage limit reached", 400);
      }

      let discount = 0;
      if (promo.discountType === "percentage") {
        discount = Math.round((orderAmount * promo.discountValue) / 100);
        if (promo.maxDiscount && discount > promo.maxDiscount) {
          discount = promo.maxDiscount;
        }
      } else {
        discount = promo.discountValue;
      }
      discount = Math.min(discount, orderAmount);

      return successResponse({
        valid: true,
        discount,
        promoId: promo._id.toString(),
        message: `Promo code applied! Saved ₹${discount}`,
      });
    }

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const validated = createPromoSchema.parse(body);

    const existing = await PromoCode.findOne({ code: validated.code });
    if (existing) {
      return errorResponse("Promo code already exists", 409);
    }

    const promo = await PromoCode.create({
      ...validated,
      startDate: new Date(validated.startDate),
      endDate: new Date(validated.endDate),
      isActive: true,
    });

    return successResponse(promo, "Promo code created", 201);
  } catch (error) {
    console.error("Create promo error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
    const { promoId, ...updates } = body;

    if (!promoId) return errorResponse("promoId is required");

    const promo = await PromoCode.findByIdAndUpdate(promoId, updates, { new: true });
    if (!promo) return errorResponse("Promo not found", 404);

    return successResponse(promo, "Promo updated");
  } catch (error) {
    console.error("Update promo error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const promoId = searchParams.get("promoId");

    if (!promoId) return errorResponse("promoId is required");

    const promo = await PromoCode.findByIdAndDelete(promoId);
    if (!promo) return errorResponse("Promo not found", 404);

    return successResponse(null, "Promo deleted");
  } catch (error) {
    console.error("Delete promo error:", error);
    return errorResponse("Internal server error", 500);
  }
}
