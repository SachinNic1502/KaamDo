import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, Job, User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth, requireRole } from "@/lib/auth-middleware";
import { createAttendanceSchema, paginationSchema } from "@/lib/validations";
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

    const filter: Record<string, unknown> = resourceScope(authUser, "attendance");

    if (search) {
      filter.$or = [
        { notes: { $regex: search, $options: "i" } },
      ];
    }
    if (status) filter.status = status;

    const dateStr = searchParams.get("date");
    if (dateStr) {
      const date = new Date(dateStr);
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      filter.date = { $gte: date, $lt: nextDay };
    }

    const total = await Attendance.countDocuments(filter);
    const records = await Attendance.find(filter)
      .populate("jobId", "jobNumber")
      .populate("workerId", "name phone")
      .populate("customerId", "name phone")
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return paginatedResponse(records, total, page, limit);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireRole(request, ["worker", "admin"]);

    const body = await request.json();
    const validated = createAttendanceSchema.parse(body);
    objectIdSchema.parse(validated.workerId);
    objectIdSchema.parse(validated.jobId);
    if (authUser.role !== "admin" && validated.workerId !== authUser.userId) {
      return errorResponse("Forbidden", 403, "FORBIDDEN");
    }

    const worker = await User.findById(validated.workerId);
    if (!worker || worker.role !== "worker" || !worker.isActive) return errorResponse("Worker not found", 404);

    const job = await Job.findOne({ _id: validated.jobId, workerId: validated.workerId });
    if (!job) return errorResponse("Job not found", 404);

    const existing = await Attendance.findOne({
      jobId: validated.jobId,
      workerId: validated.workerId,
      date: new Date(validated.date),
    });

    if (existing) {
      if (["approved", "rejected"].includes(existing.status)) {
        return errorResponse("Attendance is already reviewed", 409, "ATTENDANCE_REVIEWED");
      }
      if (validated.checkIn) existing.checkIn = new Date(validated.checkIn);
      if (validated.checkOut) existing.checkOut = new Date(validated.checkOut);
      if (validated.status) existing.status = validated.status;
      if (validated.notes) existing.notes = validated.notes;

      if (existing.checkIn && existing.checkOut) {
        const diff = existing.checkOut.getTime() - existing.checkIn.getTime();
        existing.workingHours = Math.round(diff / (1000 * 60 * 60) * 10) / 10;
      }

      await existing.save();
      return successResponse(existing, "Attendance updated");
    }

    const customer = await User.findById(job.customerId);

    const attendance = await Attendance.create({
      jobId: validated.jobId,
      workerId: validated.workerId,
      customerId: customer?._id || job.customerId,
      date: new Date(validated.date),
      checkIn: validated.checkIn ? new Date(validated.checkIn) : undefined,
      checkOut: validated.checkOut ? new Date(validated.checkOut) : undefined,
      status: validated.status,
      notes: validated.notes,
    });

    if (attendance.checkIn && attendance.checkOut) {
      const diff = attendance.checkOut.getTime() - attendance.checkIn.getTime();
      attendance.workingHours = Math.round(diff / (1000 * 60 * 60) * 10) / 10;
      await attendance.save();
    }

    return successResponse(attendance, "Attendance recorded", 201);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireRole(request, ["admin"]);

    const body = await request.json();
    const { attendanceId, status, approvedWage } = body;

    if (!attendanceId) return errorResponse("attendanceId is required");
    objectIdSchema.parse(attendanceId);
    if (status !== undefined && !["approved", "rejected"].includes(status)) return errorResponse("Invalid approval status", 400);
    if (approvedWage !== undefined && (typeof approvedWage !== "number" || !Number.isFinite(approvedWage) || approvedWage < 0)) return errorResponse("Invalid wage", 400);

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return errorResponse("Attendance not found", 404);

    if (status) attendance.status = status;
    if (approvedWage !== undefined) attendance.approvedWage = approvedWage;

    attendance.approvedBy = authUser.userId;

    await attendance.save();

    return successResponse(attendance, "Attendance approved");
  } catch (error) {
    return handleApiError(error);
  }
}
