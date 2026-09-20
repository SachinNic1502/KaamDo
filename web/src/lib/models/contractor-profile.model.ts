import mongoose, { Schema, Document } from "mongoose";

export interface IContractorProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  businessType: string;
  registrationNumber?: string;
  description?: string;
  services: string[];
  serviceAreas: string[];
  teamSize: number;
  completedProjects: number;
  rating: number;
  status: "draft" | "submitted" | "under_review" | "verified" | "rejected" | "suspended";
  documents: {
    businessRegistration?: string;
    gstNumber?: string;
    panCard?: string;
    insurance?: string;
    otherDocs: string[];
  };
  bankDetails: {
    accountNumber?: string;
    ifsc?: string;
    upi?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ContractorProfileSchema = new Schema<IContractorProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    registrationNumber: String,
    description: String,
    services: [String],
    serviceAreas: [String],
    teamSize: { type: Number, default: 0 },
    completedProjects: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["draft", "submitted", "under_review", "verified", "rejected", "suspended"],
      default: "draft",
    },
    documents: {
      businessRegistration: String,
      gstNumber: String,
      panCard: String,
      insurance: String,
      otherDocs: [String],
    },
    bankDetails: {
      accountNumber: String,
      ifsc: String,
      upi: String,
    },
  },
  { timestamps: true }
);

ContractorProfileSchema.index({ userId: 1 });
ContractorProfileSchema.index({ status: 1 });
ContractorProfileSchema.index({ services: 1 });

export default mongoose.models.ContractorProfile ||
  mongoose.model<IContractorProfileDocument>("ContractorProfile", ContractorProfileSchema);
