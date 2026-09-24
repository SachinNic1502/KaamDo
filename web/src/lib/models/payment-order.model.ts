import mongoose, { Schema } from "mongoose";
const schema = new Schema({
  jobId: { type: Schema.Types.ObjectId, required: true, unique: true },
  customerId: { type: Schema.Types.ObjectId, required: true },
  workerId: { type: Schema.Types.ObjectId, required: true },
  gateway: { type: String, enum: ["razorpay", "cashfree"], required: true },
  amountMinor: { type: Number, required: true },
  feeMinor: { type: Number, required: true },
  orderId: String, sessionId: String, keyId: String,
  status: { type: String, enum: ["creating", "pending", "completed"], default: "creating" },
  paymentId: String,
}, { timestamps: true });
export default mongoose.models.PaymentOrder || mongoose.model("PaymentOrder", schema);
