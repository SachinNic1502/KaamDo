import mongoose, { Schema, Document } from "mongoose";

export interface ICommissionDocument extends Document {
  category: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionSchema = new Schema<ICommissionDocument>(
  {
    category: { type: String, required: true },
    type: {
      type: String,
      enum: ["percentage", "fixed"],
      default: "percentage",
    },
    value: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CommissionSchema.index({ category: 1 });
CommissionSchema.index({ isActive: 1 });

export default mongoose.models.Commission ||
  mongoose.model<ICommissionDocument>("Commission", CommissionSchema);
