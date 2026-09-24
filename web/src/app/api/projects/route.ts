import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Project, User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createProjectSchema, paginationSchema } from "@/lib/validations";
import { generateProjectNumber } from "@/lib/auth";
import { handleApiError } from "@/lib/api-error";
import { resourceScope } from "@/lib/resource-policy";
import { objectIdSchema } from "@/lib/security-schemas";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = resourceScope(authUser, "projects");

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { projectNumber: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const total = await Project.countDocuments(filter);
    const projects = await Project.find(filter)
      .populate("customerId", "name phone")
      .populate("contractorId", "name phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(projects, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const validated = createProjectSchema.parse(body);

    const user = await User.findOne({ phone: authUser.phone });
    if (!user) return errorResponse("User not found", 404);

    const projectNumber = generateProjectNumber();

    const milestones = validated.milestones?.map((m, index) => ({
      ...m,
      dueDate: new Date(m.dueDate),
      status: index === 0 ? "in_progress" : "pending",
    })) || [];

    const project = await Project.create({
      projectNumber,
      customerId: user._id,
      contractorId: validated.contractorId,
      title: validated.title,
      description: validated.description,
      category: validated.category,
      totalAmount: validated.totalAmount,
      startDate: new Date(validated.startDate),
      endDate: validated.endDate ? new Date(validated.endDate) : undefined,
      milestones,
      status: "pending",
    });

    return successResponse(project, "Project created", 201);
  } catch (error) {
    console.error("Create project error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { projectId, milestoneIndex, milestoneStatus, ...updates } = body;

    if (!projectId) return errorResponse("projectId is required");

    objectIdSchema.parse(projectId);
    const project = await Project.findOne({ _id: projectId, ...resourceScope(authUser, "projects") });
    if (!project) return errorResponse("Project not found", 404);

    // Ownership/financial fields require dedicated audited operations.
    const allowedFields = ["title", "description"];
    if (Object.keys(updates).some((key) => !allowedFields.includes(key))) {
      return errorResponse("Unsupported project update", 400, "INVALID_REQUEST");
    }
    if (milestoneIndex !== undefined || milestoneStatus !== undefined) {
      return errorResponse("Milestone updates are temporarily unavailable", 503, "MILESTONE_VALIDATION_UNAVAILABLE");
    }

    if (!Object.keys(updates).length ||
      (updates.title !== undefined && (typeof updates.title !== "string" || updates.title.trim().length < 5 || updates.title.length > 200)) ||
      (updates.description !== undefined && (typeof updates.description !== "string" || updates.description.trim().length < 20 || updates.description.length > 10000))) {
      return errorResponse("Invalid project update", 400, "INVALID_REQUEST");
    }
    Object.assign(project, updates);

    const completedCount = project.milestones.filter(
      (m: { status: string }) => m.status === "completed" || m.status === "approved" || m.status === "paid"
    ).length;
    project.progress = project.milestones.length > 0
      ? Math.round((completedCount / project.milestones.length) * 100)
      : 0;

    await project.save();

    return successResponse(project, "Project updated");
  } catch (error) {
    return handleApiError(error);
  }
}
