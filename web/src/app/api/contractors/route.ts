import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, ContractorProfile } from "@/lib/models";
import { successResponse, errorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { objectIdSchema } from "@/lib/security-schemas";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    if (authUser.role !== "admin") {
      return errorResponse("Forbidden", 403);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;

    const total = await ContractorProfile.countDocuments(filter);
    const contractors = await ContractorProfile.find(filter)
      .populate("userId", "name phone role")
      .sort({ createdAt: -1 })
      .lean();

    return successResponse({ contractors, total });
  } catch (error) {
    console.error("Get contractors error:", error);
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

    const user = await User.findById(body.userId);
    if (!user) return errorResponse("User not found", 404);
    if (user.role !== "contractor") return errorResponse("User is not a contractor", 400);

    const existing = await ContractorProfile.findOne({ userId: body.userId });
    if (existing) {
      return errorResponse("Contractor profile already exists", 409);
    }

    const profile = await ContractorProfile.create({
      userId: body.userId,
      businessName: body.businessName,
      businessType: body.businessType,
      registrationNumber: body.registrationNumber,
      description: body.description,
      services: body.services || [],
      serviceAreas: body.serviceAreas || [],
      teamSize: body.teamSize ?? 0,
      rating: body.rating ?? 0,
      status: "draft",
    });

    return successResponse(profile, "Contractor profile created", 201);
  } catch (error) {
    console.error("Create contractor error:", error);
    return errorResponse("Internal server error", 500);
  }
}