import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentDocument extends Document {
  jobId: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  workerId: mongoose.Types.ObjectId;
  amount: number;
  platformFee: number;
  workerEarning: number;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  refundAmount?: number;
  refundReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPaymentDocument>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    workerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, required: true },
    workerEarning: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: { type: String, required: true },
    transactionId: String,
    refundAmount: Number,
    refundReason: String,
  },
  { timestamps: true }
);

PaymentSchema.index({ jobId: 1 }, { unique: true });
PaymentSchema.index({ customerId: 1 });
PaymentSchema.index({ workerId: 1 });
PaymentSchema.index({ status: 1 });
PaymentSchema.index({ createdAt: -1 });
PaymentSchema.index({ transactionId: 1 }, { unique: true, sparse: true });
PaymentSchema.index({ customerId: 1, status: 1 }); // Compound index for customer payments
PaymentSchema.index({ workerId: 1, status: 1 }); // Compound index for worker payments

export default mongoose.models.Payment ||
  mongoose.model<IPaymentDocument>("Payment", PaymentSchema);
