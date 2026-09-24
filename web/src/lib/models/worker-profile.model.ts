import mongoose, { Schema, Document } from "mongoose";

export interface IWorkerProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  skills: string[];
  experience: number;
  serviceAreas: string[];
  hourlyRate?: number;
  dailyRate?: number;
  status: "draft" | "submitted" | "under_review" | "verified" | "rejected" | "suspended";
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  totalEarnings: number;
  bankDetails: {
    accountNumber?: string;
    ifsc?: string;
    upi?: string;
  };
  documents: {
    identity?: string;
    address?: string;
    certifications: string[];
  };
  availability: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const WorkerProfileSchema = new Schema<IWorkerProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    skills: [{ type: String }],
    experience: { type: Number, default: 0 },
    serviceAreas: [{ type: String }],
    hourlyRate: Number,
    dailyRate: Number,
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "verified", "rejected", "suspended"],
      default: "draft",
    },
    isOnline: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    totalJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      upi: String,
    },
    documents: {
      identity: String,
      address: String,
      certifications: [String],
    },
    availability: {
      days: [String],
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "18:00" },
    },
  },
  { timestamps: true }
);

WorkerProfileSchema.index({ userId: 1 }, { unique: true });
WorkerProfileSchema.index({ status: 1 });
WorkerProfileSchema.index({ skills: 1 });
WorkerProfileSchema.index({ serviceAreas: 1 });
WorkerProfileSchema.index({ isOnline: 1 });
WorkerProfileSchema.index({ rating: -1 });
WorkerProfileSchema.index({ totalJobs: -1 });
WorkerProfileSchema.index({ createdAt: -1 });
WorkerProfileSchema.index({ skills: 1, serviceAreas: 1, isOnline: 1 }); // Compound index for worker matching

export default mongoose.models.WorkerProfile ||
  mongoose.model<IWorkerProfileDocument>("WorkerProfile", WorkerProfileSchema);
