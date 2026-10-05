import mongoose, { Schema, Document } from "mongoose";

export interface ICommissionRule {
  category: string;
  type: "percentage" | "fixed";
  value: number;
}

export interface ICancellationPolicy {
  status: string;
  fee: string;
}

export interface INotificationSetting {
  name: string;
  description: string;
  enabled: boolean;
}

export interface IPlatformSetting extends Document {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  description: string;
  commissionRules: ICommissionRule[];
  cancellationPolicies: ICancellationPolicy[];
  notifications: INotificationSetting[];
  serviceAreas: string[];
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommissionRuleSchema = new Schema<ICommissionRule>(
  {
    category: { type: String, required: true },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    value: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const CancellationPolicySchema = new Schema<ICancellationPolicy>(
  {
    status: { type: String, required: true },
    fee: { type: String, required: true },
  },
  { _id: false }
);

const NotificationSettingSchema = new Schema<INotificationSetting>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    enabled: { type: Boolean, default: true },
  },
  { _id: false }
);

const PlatformSettingSchema = new Schema<IPlatformSetting>(
  {
    platformName: { type: String, default: "KaamDo" },
    tagline: { type: String, default: "Har Kaam, Sahi Insaan" },
    supportEmail: { type: String, default: "support@kaamdo.com" },
    supportPhone: { type: String, default: "+91 1800-123-4567" },
    description: { type: String, default: "One platform for getting local work done." },
    commissionRules: {
      type: [CommissionRuleSchema],
      default: [
        { category: "Electrician", type: "percentage", value: 10 },
        { category: "Plumbing", type: "percentage", value: 12 },
        { category: "AC Repair", type: "percentage", value: 10 },
        { category: "Carpentry", type: "percentage", value: 10 },
        { category: "Cleaning", type: "percentage", value: 15 },
        { category: "Painting Contract", type: "percentage", value: 5 },
        { category: "Labor", type: "fixed", value: 30 },
      ],
    },
    cancellationPolicies: {
      type: [CancellationPolicySchema],
      default: [
        { status: "Before assignment", fee: "Free" },
        { status: "After assignment", fee: "5% of job value" },
        { status: "Worker en route", fee: "Visit charge" },
        { status: "Worker arrived", fee: "Full visit charge" },
        { status: "Work started", fee: "No cancellation" },
      ],
    },
    notifications: {
      type: [NotificationSettingSchema],
      default: [
        { name: "New Job", description: "Send notification for new job events", enabled: true },
        { name: "Job Accepted", description: "Send notification when job is accepted", enabled: true },
        { name: "Worker Assigned", description: "Send notification when worker is assigned", enabled: true },
        { name: "Payment Received", description: "Send notification for payment received", enabled: true },
        { name: "Dispute Update", description: "Send notification for dispute updates", enabled: true },
        { name: "KYC Status", description: "Send notification for KYC status changes", enabled: true },
      ],
    },
    serviceAreas: {
      type: [String],
      default: ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata"],
    },
    updatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const PlatformSetting =
  mongoose.models.PlatformSetting ||
  mongoose.model<IPlatformSetting>("PlatformSetting", PlatformSettingSchema);

export default PlatformSetting;
