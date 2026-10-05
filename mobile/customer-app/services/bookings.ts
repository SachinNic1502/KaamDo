import { api } from "./api";
import * as SecureStore from "./storage";
import { Job, Address, ApiResponse } from "../types";

export interface CreateBookingPayload {
  categoryId: string;
  subcategoryId: string;
  description: string;
  scheduledDate: string; // ISO date string
  scheduledTime?: string;
  address: Address;
  images?: string[];
}

export interface BookingQueryParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface BookingDraft {
  step: number;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  description?: string;
  scheduledDate?: string;
  scheduledTime?: string;
  address?: Address;
  images?: string[];
  notes?: string;
  updatedAt: number;
}

const DRAFT_STORAGE_KEY = "kaamdo_job_draft_v1";

export const bookingService = {
  /**
   * Create a new service request / booking
   */
  async createBooking(
    payload: CreateBookingPayload
  ): Promise<ApiResponse<{ job: Job; matchedWorkers: number }>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    const response = await api.post<ApiResponse<{ job: Job; matchedWorkers: number }>>(
      "/api/jobs",
      payload,
      token
    );

    // Clear draft once booking is successfully placed
    await this.clearDraftBooking();
    return response;
  },

  /**
   * Fetch customer bookings with optional status filter and pagination
   */
  async getBookings(
    params: BookingQueryParams = {}
  ): Promise<ApiResponse<Job[]>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    const searchParams = new URLSearchParams();
    if (params.status) searchParams.append("status", params.status);
    if (params.search) searchParams.append("search", params.search);
    if (params.page) searchParams.append("page", String(params.page));
    if (params.limit) searchParams.append("limit", String(params.limit));

    const query = searchParams.toString();
    const endpoint = `/api/jobs${query ? `?${query}` : ""}`;
    return api.get<ApiResponse<Job[]>>(endpoint, token);
  },

  /**
   * Fetch single booking details by ID
   */
  async getBookingById(jobId: string): Promise<ApiResponse<Job>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.get<ApiResponse<Job>>(`/api/jobs?jobId=${jobId}`, token);
  },

  /**
   * Cancel a booking before or during dispatch
   */
  async cancelBooking(jobId: string, reason?: string): Promise<ApiResponse<Job>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.patch<ApiResponse<Job>>(
      "/api/jobs",
      {
        jobId,
        status: "cancelled",
        reason,
      },
      token
    );
  },

  /**
   * Submit star rating and written review for a completed job
   */
  async rateBooking(
    jobId: string,
    rating: number,
    review?: string
  ): Promise<ApiResponse<Job>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.patch<ApiResponse<Job>>(
      "/api/jobs",
      {
        jobId,
        rating,
        review,
      },
      token
    );
  },

  /**
   * Customer approves or rejects an additional charge request from worker
   */
  async respondToAdditionalCharge(
    jobId: string,
    chargeId: string,
    decision: "approved" | "rejected"
  ): Promise<ApiResponse<Job>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.patch<ApiResponse<Job>>(
      "/api/jobs",
      {
        jobId,
        chargeDecision: {
          chargeId,
          decision,
        },
      },
      token
    );
  },

  /**
   * Get all active / in-progress bookings for live tracking
   */
  async getActiveBookings(): Promise<Job[]> {
    try {
      const response = await this.getBookings({ limit: 10 });
      const activeStatuses = [
        "searching",
        "worker_assigned",
        "arrived",
        "work_started",
        "in_progress",
        "completion_requested",
      ];
      return (response.data || []).filter((job) =>
        activeStatuses.includes(job.status)
      );
    } catch {
      return [];
    }
  },

  /**
   * Save step progress draft so user never loses their multi-step job creation progress
   */
  async saveDraftBooking(draft: Partial<BookingDraft>): Promise<void> {
    try {
      const existing = (await this.getDraftBooking()) || { step: 1, updatedAt: Date.now() };
      const merged: BookingDraft = {
        ...existing,
        ...draft,
        updatedAt: Date.now(),
      };
      await SecureStore.setItemAsync(DRAFT_STORAGE_KEY, JSON.stringify(merged));
    } catch (e) {
      console.warn("Failed to persist booking draft", e);
    }
  },

  /**
   * Retrieve cached booking draft
   */
  async getDraftBooking(): Promise<BookingDraft | null> {
    try {
      const data = await SecureStore.getItemAsync(DRAFT_STORAGE_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  /**
   * Clear saved booking draft
   */
  async clearDraftBooking(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(DRAFT_STORAGE_KEY);
    } catch {
      // ignore
    }
  },
};
