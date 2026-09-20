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

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const body = await request.json();
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
