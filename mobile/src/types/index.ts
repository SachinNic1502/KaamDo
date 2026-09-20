export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: "customer" | "worker" | "contractor";
  avatar?: string;
  isActive: boolean;
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
  materials: Material[];
  startOtp?: string;
  completionOtp?: string;
  startTime?: string;
  endTime?: string;
  rating?: number;
  review?: string;
  createdAt: string;
}

export interface Address {
  label: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
}

export interface AdditionalCharge {
  _id: string;
  description: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
}

export interface Material {
  _id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Payment {
  _id: string;
  jobId: Job;
  customerId: User;
  workerId: User;
  amount: number;
  platformFee: number;
  workerEarning: number;
  status: string;
  paymentMethod: string;
  transactionId?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
