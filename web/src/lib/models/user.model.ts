import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email?: string;
  phone: string;
  password: string;
  role: "customer" | "worker" | "contractor" | "admin";
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["customer", "worker", "contractor", "admin"],
      default: "customer",
    },
    avatar: String,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.index({ phone: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });

export default mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);
