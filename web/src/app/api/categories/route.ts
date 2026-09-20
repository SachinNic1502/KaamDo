import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ServiceCategory } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createCategorySchema, paginationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
      ];
    }

    const total = await ServiceCategory.countDocuments(filter);
    const categories = await ServiceCategory.find(filter)
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(categories, total, page, limit);
  } catch (error) {
    console.error("Get categories error:", error);
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
    const validated = createCategorySchema.parse(body);

    const existing = await ServiceCategory.findOne({ slug: validated.slug });
    if (existing) {
      return errorResponse("Category with this slug already exists", 409);
    }

    const category = await ServiceCategory.create(validated);
    return successResponse(category, "Category created", 201);
  } catch (error) {
    console.error("Create category error:", error);
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
    const { categoryId, ...updates } = body;

    if (!categoryId) return errorResponse("categoryId is required");

    const category = await ServiceCategory.findByIdAndUpdate(
      categoryId,
      updates,
      { new: true }
    );

    if (!category) return errorResponse("Category not found", 404);

    return successResponse(category, "Category updated");
  } catch (error) {
    console.error("Update category error:", error);
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
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) return errorResponse("categoryId is required");

    const category = await ServiceCategory.findByIdAndDelete(categoryId);
    if (!category) return errorResponse("Category not found", 404);

    return successResponse(null, "Category deleted");
  } catch (error) {
    console.error("Delete category error:", error);
    return errorResponse("Internal server error", 500);
  }
}
