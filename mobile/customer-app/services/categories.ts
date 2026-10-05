import { api } from "./api";
import { ServiceCategory, Subcategory, ApiResponse } from "../types";

export interface CategoryQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const categoryService = {
  /**
   * Fetch all active service categories (e.g. Electrician, Plumber, Cleaning, AC Service)
   */
  async getCategories(
    params: CategoryQueryParams = {}
  ): Promise<ApiResponse<ServiceCategory[]>> {
    const searchParams = new URLSearchParams();
    if (params.search) searchParams.append("search", params.search);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));

    const query = searchParams.toString();
    const endpoint = `/api/categories${query ? `?${query}` : ""}`;
    return api.get<ApiResponse<ServiceCategory[]>>(endpoint);
  },

  /**
   * Fetch a single category by ID with its full subcategory tree
   */
  async getCategoryById(categoryId: string): Promise<ServiceCategory | null> {
    const res = await this.getCategories({ limit: 100 });
    const categories = res.data || [];
    return categories.find((c) => c._id === categoryId) || null;
  },

  /**
   * Fetch subcategories under a specific parent category
   */
  async getSubcategories(categoryId: string): Promise<Subcategory[]> {
    const category = await this.getCategoryById(categoryId);
    return category?.subcategories || [];
  },

  /**
   * Get featured categories for high-priority home screen showcase
   */
  async getFeaturedCategories(): Promise<ServiceCategory[]> {
    const res = await this.getCategories({ limit: 12 });
    return (res.data || []).filter((c) => c.isActive !== false);
  },
};
