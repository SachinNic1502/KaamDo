import { z } from "zod";

const normalizedPhone = z.string().regex(/^\+?[1-9]\d{9,14}$/, "Invalid phone number").transform(value => {
  const digits = value.replace(/^\+/, "");
  return digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
});

export const phoneSchema = z.object({
  phone: normalizedPhone,
});

export const loginSchema = z.object({
  phone: normalizedPhone,
  password: z.string().min(1, "Password is required"),
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
});

export const otpSchema = z.object({
  phone: normalizedPhone,
  otp: z.string().regex(/^\d{4}$/, "OTP must be 4 digits"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: normalizedPhone,
  email: z.string().email("Invalid email").optional(),
  role: z.enum(["customer", "worker", "contractor"]),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")
    .optional(),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
});

export const workerProfileSchema = z.object({
  skills: z.array(z.string()).min(1, "At least one skill required"),
  experience: z.number().min(0).optional(),
  serviceAreas: z.array(z.string()).min(1, "At least one service area required"),
  hourlyRate: z.number().positive().optional(),
  dailyRate: z.number().positive().optional(),
  availability: z.object({
    days: z.array(z.string()),
    startTime: z.string(),
    endTime: z.string(),
  }).optional(),
});

export const contractorProfileSchema = z.object({
  businessName: z.string().min(2),
  businessType: z.string().min(2),
  registrationNumber: z.string().optional(),
  description: z.string().optional(),
  services: z.array(z.string()).min(1),
  serviceAreas: z.array(z.string()).min(1),
  teamSize: z.number().positive().optional(),
});

export const createJobSchema = z.object({
  categoryId: z.string().regex(/^[a-f\d]{24}$/i),
  subcategoryId: z.string().regex(/^[a-f\d]{24}$/i),
  description: z.string().min(10),
  images: z.array(z.string().url()).optional(),
  address: z.object({
    label: z.string(),
    address: z.string().min(5),
    city: z.string(),
    state: z.string().trim().min(1),
    pincode: z.string(),
    lat: z.number().optional(),
    lng: z.number().optional(),
  }),
  scheduledDate: z.string().datetime(),
  scheduledTime: z.string().optional(),
  pricingModel: z.enum(["fixed", "visit", "hourly", "daily", "quotation"]),
  estimatedPrice: z.number().positive().optional(),
});

export const updateJobStatusSchema = z.object({
  status: z.enum([
    "worker_assigned", "worker_accepted", "on_the_way", "arrived",
    "work_started", "in_progress", "waiting_approval", "completion_requested",
    "completed", "cancelled", "rejected",
  ]),
  reason: z.string().optional(),
});

export const additionalChargeSchema = z.object({
  description: z.string().min(5),
  amount: z.number().positive(),
});

export const materialSchema = z.object({
  name: z.string().min(2),
  quantity: z.number().positive(),
  unitPrice: z.number().positive(),
  receipt: z.string().url().optional(),
});

export const createCategorySchema = z.object({
  name: z.string().min(2),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  icon: z.string().url().optional(),
  description: z.string().optional(),
  subcategories: z.array(z.object({
    name: z.string(),
    slug: z.string(),
    description: z.string().optional(),
    pricingModel: z.enum(["fixed", "visit", "hourly", "daily", "quotation"]),
    basePrice: z.number().positive().optional(),
  })).optional(),
});

export const createDisputeSchema = z.object({
  jobId: z.string(),
  reason: z.string().min(5),
  description: z.string().min(20),
  images: z.array(z.string().url()).optional(),
});

export const createAttendanceSchema = z.object({
  jobId: z.string(),
  workerId: z.string(),
  date: z.string().datetime(),
  checkIn: z.string().datetime().optional(),
  checkOut: z.string().datetime().optional(),
  status: z.enum(["present", "absent", "half_day", "late"]),
  notes: z.string().optional(),
});

export const createProjectSchema = z.object({
  contractorId: z.string(),
  title: z.string().min(5),
  description: z.string().min(20),
  category: z.string(),
  totalAmount: z.number().positive(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  milestones: z.array(z.object({
    title: z.string(),
    description: z.string(),
    amount: z.number().positive(),
    dueDate: z.string().datetime(),
  })).optional(),
});

export const createPromoSchema = z.object({
  code: z.string().min(3).toUpperCase(),
  description: z.string().min(10),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
  minOrderAmount: z.number().min(0),
  maxDiscount: z.number().min(0),
  usageLimit: z.number().positive(),
  applicableCategories: z.array(z.string()).optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export const commissionRuleSchema = z.object({
  category: z.string(),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().positive(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  status: z.string().optional(),
  role: z.string().optional(),
  skill: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});
