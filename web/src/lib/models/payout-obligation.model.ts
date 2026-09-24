import mongoose, { Schema } from "mongoose";
// This is an earning obligation, not a claim that a bank transfer has been paid.
const schema = new Schema({
  paymentId: { type: Schema.Types.ObjectId, required: true, unique: true },
  workerId: { type: Schema.Types.ObjectId, required: true },
  amountMinor: { type: Number, required: true },
  status: { type: String, enum: ["awaiting_settlement", "eligible", "submitted", "paid", "failed"], default: "awaiting_settlement" },
  gateway: { type: String, required: true },
  providerPaymentId: { type: String, required: true },
  providerTransferId: String,
  bankReference: { type: String, unique: true, sparse: true },
  transferredAt: Date,
  statementReference: String,
  reconciledBy: { type: Schema.Types.ObjectId, ref: "User" },
  reconciliationMethod: String,
  reconciledAt: Date,
}, { timestamps: true });
export default mongoose.models.PayoutObligation || mongoose.model("PayoutObligation", schema);
