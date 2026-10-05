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
    accountHolderName?: string;
    bankName?: string;
    accountNumber?: string;
    ifsc?: string;
    ifscCode?: string;
    upi?: string;
  };
  kyc?: {
    aadhaarNumber?: string;
    panNumber?: string;
    aadhaarFrontUrl?: string;
    panCardUrl?: string;
    tradeCertificateUrl?: string;
    status: "not_submitted" | "pending" | "verified" | "rejected";
    submittedAt?: Date;
    verifiedAt?: Date;
    rejectionReason?: string;
    reviewedBy?: mongoose.Types.ObjectId;
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
  location?: {
    type: string;
    coordinates: [number, number];
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    lastUpdated?: Date;
  };
  serviceRadiusKm: number;
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
      accountHolderName: String,
      bankName: String,
      accountNumber: String,
      ifsc: String,
      ifscCode: String,
      upi: String,
    },
    kyc: {
      aadhaarNumber: String,
      panNumber: String,
      aadhaarFrontUrl: String,
      panCardUrl: String,
      tradeCertificateUrl: String,
      status: {
        type: String,
        enum: ["not_submitted", "pending", "verified", "rejected"],
        default: "not_submitted",
      },
      submittedAt: Date,
      verifiedAt: Date,
      rejectionReason: String,
      reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
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
    location: {
      type: { type: String, default: "Point" },
      coordinates: { type: [Number], default: [77.5946, 12.9716] },
      address: String,
      city: String,
      state: String,
      pincode: String,
      lastUpdated: { type: Date, default: Date.now },
    },
    serviceRadiusKm: { type: Number, default: 15, min: 1, max: 100 },
  },
  { timestamps: true }
);

WorkerProfileSchema.index({ userId: 1 }, { unique: true });
WorkerProfileSchema.index({ "location.coordinates": "2dsphere" });
WorkerProfileSchema.index({ status: 1 });
WorkerProfileSchema.index({ skills: 1 });
WorkerProfileSchema.index({ serviceAreas: 1 });
WorkerProfileSchema.index({ isOnline: 1 });
WorkerProfileSchema.index({ rating: -1 });
WorkerProfileSchema.index({ totalJobs: -1 });
WorkerProfileSchema.index({ status: 1, isOnline: 1 });
WorkerProfileSchema.index({ skills: 1, isOnline: 1 });
WorkerProfileSchema.index({ serviceAreas: 1, isOnline: 1 });

export default mongoose.models.WorkerProfile ||
  mongoose.model<IWorkerProfileDocument>("WorkerProfile", WorkerProfileSchema);
