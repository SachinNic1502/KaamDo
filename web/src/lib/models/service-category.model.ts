import mongoose, { Schema, Document } from "mongoose";

export interface ISubcategoryDocument {
  name: string;
  slug: string;
  description?: string;
  pricingModel: "fixed" | "visit" | "hourly" | "daily" | "quotation";
  basePrice?: number;
  isActive: boolean;
}

export interface IServiceCategoryDocument extends Document {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  isActive: boolean;
  subcategories: ISubcategoryDocument[];
  createdAt: Date;
  updatedAt: Date;
}

const SubcategorySchema = new Schema<ISubcategoryDocument>({
  name: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  pricingModel: {
    type: String,
    enum: ["fixed", "visit", "hourly", "daily", "quotation"],
    default: "fixed",
  },
  basePrice: Number,
  isActive: { type: Boolean, default: true },
});

const ServiceCategorySchema = new Schema<IServiceCategoryDocument>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    icon: String,
    description: String,
    isActive: { type: Boolean, default: true },
    subcategories: [SubcategorySchema],
  },
  { timestamps: true }
);

ServiceCategorySchema.index({ slug: 1 });
ServiceCategorySchema.index({ isActive: 1 });

export default mongoose.models.ServiceCategory ||
  mongoose.model<IServiceCategoryDocument>("ServiceCategory", ServiceCategorySchema);
