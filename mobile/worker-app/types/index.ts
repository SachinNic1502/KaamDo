export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: "worker" | "contractor" | "customer";
  avatar?: string;
  isActive: boolean;
  notificationSettings?: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

export interface KYCInfo {
  status: "not_submitted" | "pending" | "approved" | "rejected";
  aadhaarNumber?: string;
  panNumber?: string;
  aadhaarFrontUrl?: string;
  aadhaarBackUrl?: string;
  panCardUrl?: string;
  policeVerificationUrl?: string;
  submittedAt?: string;
  rejectionReason?: string;
}

export interface BankDetails {
  accountNumber: string;
  ifscCode?: string;
  ifsc?: string;
  bankName?: string;
  accountHolderName?: string;
  upiId?: string;
  upi?: string;
}

export interface WorkerProfile {
  _id: string;
  userId: User;
  skills: string[];
  experience: number;
  serviceAreas: string[];
  serviceRadiusKm?: number;
  hourlyRate?: number;
  dailyRate?: number;
  status: "available" | "busy" | "offline";
  isOnline: boolean;
  rating: number;
  totalJobs: number;
  kyc?: KYCInfo;
  bankDetails?: BankDetails;
  currentLocation?: {
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  location?: {
    type: "Point";
    coordinates: [number, number];
    address?: string;
    city?: string;
  };
}

export interface ServiceCategory {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  subcategories: Subcategory[];
}

export interface Subcategory {
  _id: string;
  name: string;
  slug: string;
  pricingModel: string;
  basePrice?: number;
}

export interface Address {
  label?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface AdditionalCharge {
  _id: string;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

export interface MaterialItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Job {
  _id: string;
  jobNumber: string;
  customerId: User;
  workerId?: User;
  categoryId: ServiceCategory;
  subcategoryId: string;
  description: string;
  images: string[];
  address: Address;
  scheduledDate: string;
  scheduledTime?: string;
  status: string;
  pricingModel: string;
  estimatedPrice?: number;
  finalPrice?: number;
  additionalCharges: AdditionalCharge[];
  materials?: MaterialItem[];
  startOtp?: string;
  completionOtp?: string;
  distanceKm?: number;
  workerLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    lastUpdated?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EarningsSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  totalEarnings: number;
  pendingPayout: number;
  completedJobsCount: number;
  rating: number;
}

export interface PayoutTransaction {
  _id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "paid" | "submitted" | "eligible";
  payoutDate: string;
  transactionReference?: string;
  paymentMethod: string;
}

export interface AttendanceRecord {
  _id: string;
  jobId?: {
    _id: string;
    jobNumber?: string;
    title?: string;
  } | string;
  workerId: string;
  customerId?: {
    _id: string;
    name?: string;
    phone?: string;
  } | string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  workingHours?: number;
  status: "present" | "absent" | "half_day" | "approved" | "rejected";
  notes?: string;
  approvedWage?: number;
  createdAt?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
