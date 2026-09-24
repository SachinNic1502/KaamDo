import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentMethodDocument extends Document {
  userId: mongoose.Types.ObjectId;
  type: "card" | "bank" | "upi";
  last4?: string;
  brand?: "visa" | "mastercard" | "amex" | "razorpay";
  isDefault: boolean;
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    upiId?: string;
  };
  cardDetails?: {
    expMonth?: number;
    expYear?: number;
    holderName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const PaymentMethodSchema = new Schema<IPaymentMethodDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["card", "bank", "upi"],
      required: true,
    },
    last4: { type: String },
    brand: { type: String },
    isDefault: { type: Boolean, default: false },
    bankDetails: {
      type: {
        object: {
          accountNumber: { type: String },
          ifsc: { type: String },
          upiId: { type: String },
        },
      },
    },
    cardDetails: {
      type: {
        object: {
          expMonth: { type: Number },
          expYear: { type: Number },
          holderName: { type: String },
        },
      },
    },
  },
  { timestamps: true }
);

PaymentMethodSchema.index({ userId: 1 });
PaymentMethodSchema.index({ isDefault: 1 });

export default mongoose.models.PaymentMethod ||
  mongoose.model<IPaymentMethodDocument>("PaymentMethod", PaymentMethodSchema);