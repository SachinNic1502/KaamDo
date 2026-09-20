import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Project, User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createProjectSchema, paginationSchema } from "@/lib/validations";
import { generateProjectNumber } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (authUser.role === "customer") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.customerId = user._id;
    } else if (authUser.role === "contractor") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) filter.contractorId = user._id;
    }

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
    console.error("Get projects error:", error);
    return errorResponse("Internal server error", 500);
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

    const project = await Project.findById(projectId);
    if (!project) return errorResponse("Project not found", 404);

    if (milestoneIndex !== undefined && milestoneStatus) {
      if (project.milestones[milestoneIndex]) {
        project.milestones[milestoneIndex].status = milestoneStatus;
        if (milestoneStatus === "completed") {
          project.milestones[milestoneIndex].completedAt = new Date();
        }
        if (milestoneStatus === "approved") {
          project.milestones[milestoneIndex].approvedAt = new Date();
        }
      }
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
    console.error("Update project error:", error);
    return errorResponse("Internal server error", 500);
  }
}
