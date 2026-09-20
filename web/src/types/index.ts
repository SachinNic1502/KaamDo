export type UserRole = "customer" | "worker" | "contractor" | "admin";

export type WorkerStatus = "draft" | "submitted" | "under_review" | "verified" | "rejected" | "suspended";

export type JobStatus =
  | "draft"
  | "searching"
  | "worker_assigned"
  | "worker_accepted"
  | "on_the_way"
  | "arrived"
  | "work_started"
  | "in_progress"
  | "waiting_approval"
  | "completion_requested"
  | "completed"
  | "payment_pending"
  | "paid"
  | "closed"
  | "cancelled"
  | "rejected"
  | "disputed"
  | "refunded"
  | "rework_requested";

export type PaymentStatus = "pending" | "processing" | "completed" | "failed" | "refunded";

export type PayoutStatus = "eligible" | "processing" | "submitted" | "paid" | "failed";

export interface IUser {
  _id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWorkerProfile {
  _id: string;
  userId: string;
  skills: string[];
  experience: number;
  serviceAreas: string[];
  hourlyRate?: number;
  dailyRate?: number;
  status: WorkerStatus;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  bankDetails?: {
    accountNumber?: string;
    ifsc?: string;
    upi?: string;
  };
  documents?: {
    identity?: string;
    address?: string;
    certifications?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ICustomerProfile {
  _id: string;
  userId: string;
  addresses: IAddress[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IAddress {
  _id?: string;
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isDefault: boolean;
}

export interface IServiceCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  subcategories: ISubcategory[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubcategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  pricingModel: "fixed" | "visit" | "hourly" | "daily" | "quotation";
  basePrice?: number;
  isActive: boolean;
}

export interface IJob {
  _id: string;
  jobNumber: string;
  customerId: string;
  workerId?: string;
  categoryId: string;
  subcategoryId: string;
  description: string;
  images?: string[];
  address: IAddress;
  scheduledDate: Date;
  scheduledTime?: string;
  status: JobStatus;
  pricingModel: string;
  estimatedPrice?: number;
  finalPrice?: number;
  additionalCharges: IAdditionalCharge[];
  materials: IMaterial[];
  startOtp?: string;
  completionOtp?: string;
  startTime?: Date;
  endTime?: Date;
  rating?: number;
  review?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdditionalCharge {
  _id: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

export interface IMaterial {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receipt?: string;
}

export interface IPayment {
  _id: string;
  jobId: string;
  customerId: string;
  workerId: string;
  amount: number;
  platformFee: number;
  workerEarning: number;
  status: PaymentStatus;
  paymentMethod: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPayout {
  _id: string;
  workerId: string;
  amount: number;
  status: PayoutStatus;
  bankDetails: {
    accountNumber: string;
    ifsc: string;
    upi?: string;
  };
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDispute {
  _id: string;
  jobId: string;
  raisedBy: string;
  reason: string;
  description: string;
  images?: string[];
  status: "raised" | "under_review" | "evidence_submitted" | "support_review" | "resolved";
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommission {
  _id: string;
  category: string;
  type: "percentage" | "fixed";
  value: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDashboardStats {
  totalUsers: number;
  totalWorkers: number;
  verifiedWorkers: number;
  activeWorkers: number;
  totalCustomers: number;
  totalContractors: number;
  totalJobs: number;
  activeJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  revenue: number;
  commission: number;
  pendingPayouts: number;
  completedPayouts: number;
  disputes: number;
}
