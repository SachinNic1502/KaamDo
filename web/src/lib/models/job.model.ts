import mongoose, { Schema, Document } from "mongoose";

export interface IAdditionalChargeDocument {
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface IMaterialDocument {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receipt?: string;
}

export interface IJobDocument extends Document {
  jobNumber: string;
  customerId: mongoose.Types.ObjectId;
  workerId?: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  subcategoryId: mongoose.Types.ObjectId;
  description: string;
  images: string[];
  address: {
    label: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  };
  scheduledDate: Date;
  scheduledTime?: string;
  status: string;
  pricingModel: string;
  estimatedPrice?: number;
  finalPrice?: number;
  additionalCharges: IAdditionalChargeDocument[];
  materials: IMaterialDocument[];
  startOtp?: string;
  completionOtp?: string;
  startTime?: Date;
  endTime?: Date;
  rating?: number;
  review?: string;
  cancellationReason?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema = new Schema<IJobDocument>(
  {
    jobNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "User" },
    categoryId: { type: Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
    subcategoryId: { type: Schema.Types.ObjectId, required: true },
    description: { type: String, required: true },
    images: [String],
    address: {
      label: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      lat: Number,
      lng: Number,
    },
    scheduledDate: { type: Date, required: true },
    scheduledTime: String,
    status: {
      type: String,
      enum: [
        "draft",
        "searching",
        "worker_assigned",
        "worker_accepted",
        "on_the_way",
        "arrived",
        "work_started",
        "in_progress",
        "waiting_approval",
        "completion_requested",
        "completed",
        "payment_pending",
        "paid",
        "closed",
        "cancelled",
        "rejected",
        "disputed",
        "refunded",
        "rework_requested",
      ],
      default: "draft",
    },
    pricingModel: { type: String, required: true },
    estimatedPrice: Number,
    finalPrice: Number,
    additionalCharges: [
      {
        description: String,
        amount: Number,
        status: {
          type: String,
          enum: ["pending", "approved", "rejected"],
          default: "pending",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    materials: [
      {
        name: String,
        quantity: Number,
        unitPrice: Number,
        totalPrice: Number,
        receipt: String,
      },
    ],
    startOtp: String,
    completionOtp: String,
    startTime: Date,
    endTime: Date,
    rating: Number,
    review: String,
    cancellationReason: String,
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

JobSchema.index({ jobNumber: 1 });
JobSchema.index({ customerId: 1 });
JobSchema.index({ workerId: 1 });
JobSchema.index({ status: 1 });
JobSchema.index({ categoryId: 1 });
JobSchema.index({ createdAt: -1 });

export default mongoose.models.Job || mongoose.model<IJobDocument>("Job", JobSchema);
