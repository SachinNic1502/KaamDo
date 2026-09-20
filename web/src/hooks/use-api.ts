"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getToken } from "@/lib/api-client";

function authHeaders() {
  const token = getToken();
  return token ? { token } : undefined;
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

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  role?: string;
  skill?: string;
  date?: string;
}

function buildQueryString(params: QueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "" && value !== null) {
      searchParams.set(key, String(value));
    }
  });
  const str = searchParams.toString();
  return str ? `?${str}` : "";
}

// Auth
export function useSendOtp() {
  return useMutation({
    mutationFn: (phone: string) =>
      api.post<ApiResponse<{ phone: string }>>("/api/auth", { action: "send-otp", phone }),
  });
}

export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      api.post<ApiResponse<{ user: unknown; token: string }>>("/api/auth", { action: "verify-otp", phone, otp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}

// Users
export function useUsers(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/users${qs}`, getToken() || undefined);
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...updates }: { userId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/users", { userId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}

// Workers
export function useWorkers(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["workers", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/workers${qs}`, getToken() || undefined);
    },
  });
}

export function useUpdateWorker() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workerId, ...updates }: { workerId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/workers", { workerId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
    },
  });
}

// Categories
export function useCategories(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/categories${qs}`, getToken() || undefined);
    },
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/categories", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ categoryId, ...updates }: { categoryId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/categories", { categoryId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) =>
      api.delete<ApiResponse<unknown>>(`/api/categories?categoryId=${categoryId}`, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

// Jobs
export function useJobs(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/jobs${qs}`, getToken() || undefined);
    },
  });
}

export function useCreateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/jobs", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

export function useUpdateJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ jobId, ...updates }: { jobId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/jobs", { jobId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });
}

// Payments
export function usePayments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/payments${qs}`, getToken() || undefined);
    },
  });
}

export function useCreatePayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { jobId: string; paymentMethod: string }) =>
      api.post<ApiResponse<unknown>>("/api/payments", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] });
    },
  });
}

// Disputes
export function useDisputes(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["disputes", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/disputes${qs}`, getToken() || undefined);
    },
  });
}

export function useCreateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/disputes", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

export function useUpdateDispute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ disputeId, status, resolution }: { disputeId: string; status?: string; resolution?: string }) =>
      api.patch<ApiResponse<unknown>>("/api/disputes", { disputeId, status, resolution }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] });
    },
  });
}

// Attendance
export function useAttendance(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/attendance${qs}`, getToken() || undefined);
    },
  });
}

export function useCreateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/attendance", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ attendanceId, status, approvedWage }: { attendanceId: string; status?: string; approvedWage?: number }) =>
      api.patch<ApiResponse<unknown>>("/api/attendance", { attendanceId, status, approvedWage }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });
}

// Projects
export function useProjects(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/projects${qs}`, getToken() || undefined);
    },
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/projects", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, ...updates }: { projectId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/projects", { projectId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}

// Promotions
export function usePromotions(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: () => {
      const qs = buildQueryString(params);
      return api.get<ApiResponse<unknown[]>>(`/api/promotions${qs}`, getToken() || undefined);
    },
  });
}

export function useCreatePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/promotions", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useUpdatePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ promoId, ...updates }: { promoId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/promotions", { promoId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

export function useDeletePromo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (promoId: string) =>
      api.delete<ApiResponse<unknown>>(`/api/promotions?promoId=${promoId}`, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] });
    },
  });
}

// Analytics
export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get<ApiResponse<unknown>>("/api/analytics", getToken() || undefined),
    refetchInterval: 30000,
  });
}
