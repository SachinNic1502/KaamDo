import { z } from "zod";
import { workerProfileSchema, updateJobStatusSchema, additionalChargeSchema, materialSchema } from "./validations";

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid identifier");

export const workerSearchSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(100).optional(),
  status: z.enum(["draft", "submitted", "under_review", "verified", "rejected", "suspended"]).optional(),
  skill: z.string().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
}).refine((v) => v.minPrice === undefined || v.maxPrice === undefined || v.minPrice <= v.maxPrice,
  "Invalid price range");

export const workerSelfUpdateSchema = workerProfileSchema.partial().extend({
  workerId: objectIdSchema.optional(),
  isOnline: z.boolean().optional(),
  address: z.string().min(5).optional(),
  documents: z.object({
    identity: z.string().optional(),
    address: z.string().optional(),
    certifications: z.array(z.string()).optional(),
  }).optional(),
}).strict();

export const workerAdminUpdateSchema = workerSelfUpdateSchema.extend({
  workerId: objectIdSchema,
  status: z.enum(["draft", "submitted", "under_review", "verified", "rejected", "suspended"]).optional(),
}).strict();

export const userSelfUpdateSchema = z.object({
  userId: objectIdSchema,
  name: z.string().trim().min(2).max(100).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  notificationSettings: z.object({
    jobUpdates: z.boolean(),
    chatMessages: z.boolean(),
    paymentReceipts: z.boolean(),
    disputeUpdates: z.boolean(),
  }).strict().optional(),
}).strict();

export const userAdminUpdateSchema = userSelfUpdateSchema.extend({
  role: z.enum(["customer", "worker", "contractor", "admin"]).optional(),
  isActive: z.boolean().optional(),
}).strict();

export const jobUpdateSchema = z.object({
  jobId: objectIdSchema,
  status: updateJobStatusSchema.shape.status.optional(),
  workerId: objectIdSchema.optional(),
  startOtp: z.string().regex(/^\d{4}$/).optional(),
  completionOtp: z.string().regex(/^\d{4}$/).optional(),
  additionalCharge: additionalChargeSchema.strict().optional(),
  chargeDecision: z.object({
    chargeId: objectIdSchema,
    decision: z.enum(["approved", "rejected"]),
  }).strict().optional(),
  materials: z.array(materialSchema.strict()).max(100).optional(),
  rating: z.number().int().min(1).max(5).optional(),
  review: z.string().trim().max(2000).optional(),
}).strict().refine((value) => Object.keys(value).length > 1, "No updates provided");

export function escapeSearch(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
