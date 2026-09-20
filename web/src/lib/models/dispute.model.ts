import mongoose, { Schema, Document } from "mongoose";

export interface IDisputeDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  raisedBy: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  images: string[];
  status: "raised" | "under_review" | "evidence_submitted" | "support_review" | "resolved";
  resolution?: string;
  resolvedBy?: mongoose.Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema = new Schema<IDisputeDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    raisedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    images: [String],
    status: {
      type: String,
      enum: ["raised", "under_review", "evidence_submitted", "support_review", "resolved"],
      default: "raised",
    },
    resolution: String,
    resolvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    resolvedAt: Date,
  },
  { timestamps: true }
);

DisputeSchema.index({ jobId: 1 });
DisputeSchema.index({ raisedBy: 1 });
DisputeSchema.index({ status: 1 });
DisputeSchema.index({ createdAt: -1 });

export default mongoose.models.Dispute ||
  mongoose.model<IDisputeDocument>("Dispute", DisputeSchema);
