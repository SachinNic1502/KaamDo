import { api } from "./api";
import * as SecureStore from "./storage";
import { WorkerProfile, ApiResponse } from "../types";

export interface WorkerQueryParams {
  search?: string;
  skill?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  page?: number;
  limit?: number;
}

export interface WorkerDetailResponse extends WorkerProfile {
  recentReviews?: Array<{
    _id: string;
    rating: number;
    review?: string;
    createdAt: string;
    customerId?: {
      _id: string;
      name: string;
    };
  }>;
}

export const workerService = {
  /**
   * Search and filter verified service professionals
   */
  async getWorkers(
    params: WorkerQueryParams = {}
  ): Promise<ApiResponse<WorkerProfile[]>> {
    const token = await SecureStore.getItemAsync("token");
    const searchParams = new URLSearchParams();

    if (params.search) searchParams.append("search", params.search);
    if (params.skill) searchParams.append("skill", params.skill);
    if (params.minPrice !== undefined)
      searchParams.append("minPrice", String(params.minPrice));
    if (params.maxPrice !== undefined)
      searchParams.append("maxPrice", String(params.maxPrice));
    if (params.minRating !== undefined)
      searchParams.append("minRating", String(params.minRating));
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));

    const query = searchParams.toString();
    const endpoint = `/api/workers${query ? `?${query}` : ""}`;
    return api.get<ApiResponse<WorkerProfile[]>>(endpoint, token || undefined);
  },

  /**
   * Fetch worker detailed profile with rating reviews
   */
  async getWorkerById(workerId: string): Promise<ApiResponse<WorkerDetailResponse>> {
    const token = await SecureStore.getItemAsync("token");
    return api.get<ApiResponse<WorkerDetailResponse>>(
      `/api/workers/${workerId}`,
      token || undefined
    );
  },

  /**
   * Fetch top verified professionals for home screen spotlight
   */
  async getTopRatedWorkers(limit = 6): Promise<WorkerProfile[]> {
    try {
      const response = await this.getWorkers({ minRating: 4.0, limit });
      return response.data || [];
    } catch {
      return [];
    }
  },
};
