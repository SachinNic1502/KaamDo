import mongoose, { Schema, Document } from "mongoose";

export interface IUserDocument extends Document {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  role: "customer" | "worker" | "contractor" | "admin";
  avatar?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  failedLoginAttempts: number;
  lockUntil?: Date;
  passwordChangedAt?: Date;
  sessionVersion: number;
  createdAt: Date;
  updatedAt: Date;
  notificationSettings: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["customer", "worker", "contractor", "admin"],
      default: "customer",
    },
    avatar: String,
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordChangedAt: { type: Date },
    sessionVersion: { type: Number, default: 0 },
    notificationSettings: {
      jobUpdates: { type: Boolean, default: true },
      chatMessages: { type: Boolean, default: true },
      paymentReceipts: { type: Boolean, default: true },
      disputeUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// Exclude password from JSON output - override toJSON
UserSchema.methods.toJSON = function() {
  const object = this.toObject();
  delete object.password;
  return object;
};

UserSchema.index({ phone: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ name: "text", email: "text", phone: "text" }); // Text search index

export default mongoose.models.User || mongoose.model<IUserDocument>("User", UserSchema);