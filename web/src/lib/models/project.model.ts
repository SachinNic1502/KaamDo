import mongoose, { Schema, Document } from "mongoose";

export interface IMilestoneDocument {
  title: string;
  description: string;
  amount: number;
  dueDate: Date;
  status: "pending" | "in_progress" | "completed" | "approved" | "paid";
  completedAt?: Date;
  approvedAt?: Date;
  images: string[];
}

export interface IProjectDocument extends Document {
  projectNumber: string;
  customerId: mongoose.Types.ObjectId;
  contractorId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  totalAmount: number;
  paidAmount: number;
  startDate: Date;
  endDate?: Date;
  status: "pending" | "in_progress" | "on_hold" | "completed" | "cancelled";
  milestones: IMilestoneDocument[];
  progress: number;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestoneDocument>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "approved", "paid"],
    default: "pending",
  },
  completedAt: Date,
  approvedAt: Date,
  images: [String],
});

const ProjectSchema = new Schema<IProjectDocument>(
  {
    projectNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    contractorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    startDate: { type: Date, required: true },
    endDate: Date,
    status: {
      type: String,
      enum: ["pending", "in_progress", "on_hold", "completed", "cancelled"],
      default: "pending",
    },
    milestones: [MilestoneSchema],
    progress: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProjectSchema.index({ projectNumber: 1 });
ProjectSchema.index({ customerId: 1 });
ProjectSchema.index({ contractorId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project ||
  mongoose.model<IProjectDocument>("Project", ProjectSchema);
