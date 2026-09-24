import mongoose, { Schema, Document } from "mongoose";

export interface IPayoutDocument extends Document {
  workerId: mongoose.Types.ObjectId;
  amount: number;
  status: "eligible" | "processing" | "submitted" | "paid" | "failed";
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    upi?: string;
  };
  processedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PayoutSchema = new Schema<IPayoutDocument>(
  {
    workerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["eligible", "processing", "submitted", "paid", "failed"],
      default: "eligible",
    },
    bankDetails: {
      accountNumber: { type: String, required: true },
      ifsc: { type: String, required: true },
      upi: String,
    },
    processedAt: Date,
    failureReason: String,
  },
  { timestamps: true }
);

PayoutSchema.index({ workerId: 1 });
PayoutSchema.index({ status: 1 });
PayoutSchema.index({ createdAt: -1 });
PayoutSchema.index({ workerId: 1, status: 1 }); // Compound index for worker payouts
PayoutSchema.index({ processedAt: -1 }); // For processing history

export default mongoose.models.Payout || mongoose.model<IPayoutDocument>("Payout", PayoutSchema);
