import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, Job, User } from "@/lib/models";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth-middleware";
import { createAttendanceSchema, paginationSchema } from "@/lib/validations";

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const { searchParams } = new URL(request.url);
    const query = Object.fromEntries(searchParams);
    const { page, limit, search, status } = paginationSchema.parse(query);

    const filter: Record<string, unknown> = {};

    if (authUser.role !== "admin") {
      const user = await User.findOne({ phone: authUser.phone });
      if (user) {
        if (authUser.role === "worker") {
          filter.workerId = user._id;
        } else {
          filter.customerId = user._id;
        }
      }
    }

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
    console.error("Get attendance error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const validated = createAttendanceSchema.parse(body);

    const worker = await User.findById(validated.workerId);
    if (!worker) return errorResponse("Worker not found", 404);

    const job = await Job.findById(validated.jobId);
    if (!job) return errorResponse("Job not found", 404);

    const existing = await Attendance.findOne({
      jobId: validated.jobId,
      workerId: validated.workerId,
      date: new Date(validated.date),
    });

    if (existing) {
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
    console.error("Create attendance error:", error);
    return errorResponse("Internal server error", 500);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await connectDB();
    const authUser = await requireAuth(request);

    const body = await request.json();
    const { attendanceId, status, approvedWage } = body;

    if (!attendanceId) return errorResponse("attendanceId is required");

    const attendance = await Attendance.findById(attendanceId);
    if (!attendance) return errorResponse("Attendance not found", 404);

    if (status) attendance.status = status;
    if (approvedWage !== undefined) attendance.approvedWage = approvedWage;

    const admin = await User.findOne({ phone: authUser.phone });
    if (admin) attendance.approvedBy = admin._id;

    await attendance.save();

    return successResponse(attendance, "Attendance approved");
  } catch (error) {
    console.error("Update attendance error:", error);
    return errorResponse("Internal server error", 500);
  }
}
