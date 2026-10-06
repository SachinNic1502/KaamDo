export interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  pricingModel?: "fixed" | "hourly" | "visit";
  estimatedDuration?: number;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: Subcategory[];
  isActive?: boolean;
}

export interface WorkerRecord {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
  };
  skills: string[];
  experience: number;
  serviceAreas?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  status: string;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
}
