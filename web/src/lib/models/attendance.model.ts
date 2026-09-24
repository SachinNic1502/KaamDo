import mongoose, { Schema, Document } from "mongoose";

export interface IAttendanceDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  date: Date;
  checkIn?: Date;
  checkOut?: Date;
  workingHours?: number;
  status: "present" | "absent" | "half_day" | "late" | "approved" | "rejected";
  approvedBy?: mongoose.Types.ObjectId;
  approvedWage?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema = new Schema<IAttendanceDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    checkIn: Date,
    checkOut: Date,
    workingHours: Number,
    status: {
      type: String,
      enum: ["present", "absent", "half_day", "late", "approved", "rejected"],
      default: "present",
    },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedWage: Number,
    notes: String,
  },
  { timestamps: true }
);

AttendanceSchema.index({ jobId: 1 });
AttendanceSchema.index({ workerId: 1 });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ status: 1 });
AttendanceSchema.index({ workerId: 1, date: 1 }, { unique: true }); // Compound index for worker attendance by date
AttendanceSchema.index({ jobId: 1, date: 1 }); // Compound index for job attendance by date
AttendanceSchema.index({ status: 1, date: -1 }); // Compound index for status filtering

export default mongoose.models.Attendance ||
  mongoose.model<IAttendanceDocument>("Attendance", AttendanceSchema);
