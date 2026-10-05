"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getToken } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

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
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
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
  const { toast } = useToast()
  return useMutation({
    mutationFn: (phone: string) =>
      api.post<ApiResponse<{ phone: string }>>("/api/auth", { action: "send-otp", phone }),
    onSuccess: () => {
      toast({
        title: "OTP Sent",
        description: "OTP has been sent to your phone number",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Failed to Send OTP",
        description: error instanceof Error ? error.message : "Something went wrong",
        type: "error",
      })
    },
  })
}

export function useVerifyOtp() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ phone, otp }: { phone: string; otp: string }) =>
      api.post<ApiResponse<{ user: unknown; token: string }>>("/api/auth", { action: "verify-otp", phone, otp }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] })
      toast({
        title: "Verification Successful",
        description: "Your account has been verified",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "OTP verification failed",
        type: "error",
      })
    },
  })
}

// Users
export function useUsers(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/users${qs}`, getToken() || undefined)
    },
  })
}

export function useUpdateUser() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, ...updates }: { userId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/users", { userId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      toast({
        title: "User Updated",
        description: "User information has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update user",
        type: "error",
      })
    },
  })
}

// Workers
export function useWorkers(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["workers", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/workers${qs}`, getToken() || undefined)
    },
  })
}

export function useUpdateWorker() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ workerId, ...updates }: { workerId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/workers", { workerId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] })
      toast({
        title: "Worker Updated",
        description: "Worker information has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update worker",
        type: "error",
      })
    },
  })
}

// Categories
export function useCategories(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/categories${qs}`, getToken() || undefined)
    },
  })
}

export function useCreateCategory() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/categories", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "Category Created",
        description: "New category has been added successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create category",
        type: "error",
      })
    },
  })
}

export function useUpdateCategory() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ categoryId, ...updates }: { categoryId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/categories", { categoryId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "Category Updated",
        description: "Category information has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update category",
        type: "error",
      })
    },
  })
}

export function useDeleteCategory() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (categoryId: string) =>
      api.delete<ApiResponse<unknown>>(`/api/categories?categoryId=${categoryId}`, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] })
      toast({
        title: "Category Deleted",
        description: "Category has been removed successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete category",
        type: "error",
      })
    },
  })
}

// Jobs
export function useJobs(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/jobs${qs}`, getToken() || undefined)
    },
  })
}

export function useCreateJob() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/jobs", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast({
        title: "Job Created",
        description: "New job has been added successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create job",
        type: "error",
      })
    },
  })
}

export function useUpdateJob() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ jobId, ...updates }: { jobId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/jobs", { jobId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] })
      toast({
        title: "Job Updated",
        description: "Job information has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update job",
        type: "error",
      })
    },
  })
}

// Payments
export function usePayments(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/payments${qs}`, getToken() || undefined)
    },
  })
}

export function useCreatePayment() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { jobId: string; paymentMethod: string }) =>
      api.post<ApiResponse<unknown>>("/api/payments", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payments"] })
      toast({
        title: "Payment Recorded",
        description: "Payment has been recorded successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "Failed to record payment",
        type: "error",
      })
    },
  })
}

// Disputes
export function useDisputes(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["disputes", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/disputes${qs}`, getToken() || undefined)
    },
  })
}

export function useCreateDispute() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/disputes", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] })
      toast({
        title: "Dispute Created",
        description: "Dispute has been created successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create dispute",
        type: "error",
      })
    },
  })
}

export function useUpdateDispute() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ disputeId, status, resolution }: { disputeId: string; status?: string; resolution?: string }) =>
      api.patch<ApiResponse<unknown>>("/api/disputes", { disputeId, status, resolution }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["disputes"] })
      toast({
        title: "Dispute Updated",
        description: "Dispute status has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update dispute",
        type: "error",
      })
    },
  })
}

// Attendance
export function useAttendance(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["attendance", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/attendance${qs}`, getToken() || undefined)
    },
  })
}

export function useCreateAttendance() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/attendance", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      toast({
        title: "Attendance Recorded",
        description: "Attendance has been recorded successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Recording Failed",
        description: error instanceof Error ? error.message : "Failed to record attendance",
        type: "error",
      })
    },
  })
}

export function useUpdateAttendance() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ attendanceId, status, approvedWage }: { attendanceId: string; status?: string; approvedWage?: number }) =>
      api.patch<ApiResponse<unknown>>("/api/attendance", { attendanceId, status, approvedWage }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] })
      toast({
        title: "Attendance Updated",
        description: "Attendance has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update attendance",
        type: "error",
      })
    },
  })
}

// Projects
export function useProjects(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["projects", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/projects${qs}`, getToken() || undefined)
    },
  })
}

export function useCreateProject() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/projects", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast({
        title: "Project Created",
        description: "New project has been added successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create project",
        type: "error",
      })
    },
  })
}

export function useUpdateProject() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ projectId, ...updates }: { projectId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/projects", { projectId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast({
        title: "Project Updated",
        description: "Project information has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update project",
        type: "error",
      })
    },
  })
}

// Promotions
export function usePromotions(params: QueryParams = {}) {
  return useQuery({
    queryKey: ["promotions", params],
    queryFn: () => {
      const qs = buildQueryString(params)
      return api.get<ApiResponse<unknown[]>>(`/api/promotions${qs}`, getToken() || undefined)
    },
  })
}

export function useCreatePromo() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post<ApiResponse<unknown>>("/api/promotions", data, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] })
      toast({
        title: "Promo Code Created",
        description: "New promo code has been added successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create promo code",
        type: "error",
      })
    },
  })
}

export function useUpdatePromo() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ promoId, ...updates }: { promoId: string; [key: string]: unknown }) =>
      api.patch<ApiResponse<unknown>>("/api/promotions", { promoId, ...updates }, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] })
      toast({
        title: "Promo Updated",
        description: "Promo code has been updated successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : "Failed to update promo code",
        type: "error",
      })
    },
  })
}

export function useDeletePromo() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (promoId: string) =>
      api.delete<ApiResponse<unknown>>(`/api/promotions?promoId=${promoId}`, getToken() || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promotions"] })
      toast({
        title: "Promo Deleted",
        description: "Promo code has been removed successfully",
        type: "success",
      })
    },
    onError: (error) => {
      toast({
        title: "Deletion Failed",
        description: error instanceof Error ? error.message : "Failed to delete promo code",
        type: "error",
      })
    },
  })
}

// Analytics
export function useDashboardStats() {
  return useQuery({
    queryKey: ["analytics", "dashboard"],
    queryFn: () => api.get<ApiResponse<unknown>>("/api/analytics", getToken() || undefined),
    refetchInterval: 30000,
  })
}