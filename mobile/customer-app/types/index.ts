export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: "customer" | "worker" | "contractor";
  avatar?: string;
  isActive: boolean;
  notificationSettings?: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

export interface WorkerProfile {
  _id: string;
  userId: User;
  skills: string[];
  experience: number;
  serviceAreas: string[];
  hourlyRate?: number;
  dailyRate?: number;
  status: string;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
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
  _id?: string;
  label?: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: [number, number];
  isDefault?: boolean;
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
  workerLocation?: {
    latitude: number;
    longitude: number;
    address?: string;
    lastUpdated?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  jobId: string;
  customerId: string;
  workerId?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  status: string;
  transactionId?: string;
  createdAt: string;
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
