import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import {
  Job,
  ServiceCategory,
  WorkerProfile,
  EarningsSummary,
  PayoutTransaction,
  ApiResponse,
} from "../types";

export function useIncomingRequests() {
  return useQuery({
    queryKey: ["worker", "requests"],
    queryFn: async () => {
      // Fetch available jobs looking for workers matching profile skills
      const res = await api.get<ApiResponse<Job[]>>("/api/jobs?status=searching&limit=20");
      return res.data || [];
    },
    refetchInterval: 10000, // Poll for live broadcast requests every 10s
  });
}

export function useWorkerJobs(statusFilter?: string) {
  return useQuery({
    queryKey: ["worker", "jobs", statusFilter],
    queryFn: async () => {
      let endpoint = "/api/jobs?role=worker";
      if (statusFilter && statusFilter !== "all") {
        endpoint += `&status=${statusFilter}`;
      }
      const res = await api.get<ApiResponse<Job[]>>(endpoint);
      return res.data || [];
    },
  });
}

export function useJobDetail(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Job>>(`/api/jobs/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
}

export function useAcceptJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (jobId: string) => {
      return api.post<ApiResponse<Job>>(`/api/jobs/${jobId}/accept`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "requests"] });
      queryClient.invalidateQueries({ queryKey: ["worker", "jobs"] });
    },
  });
}

export function useRejectJob() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, reason }: { jobId: string; reason?: string }) => {
      return api.post<ApiResponse<any>>(`/api/jobs/${jobId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "requests"] });
    },
  });
}

export function useUpdateJobStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      status,
      otp,
      startOtp,
      completionOtp,
    }: {
      jobId: string;
      status: string;
      otp?: string;
      startOtp?: string;
      completionOtp?: string;
      note?: string;
    }) => {
      const payload: Record<string, any> = { jobId, status };
      if (status === "work_started") {
        payload.startOtp = startOtp || otp;
      }
      if (status === "completed") {
        payload.completionOtp = completionOtp || otp;
      }
      return api.patch<ApiResponse<Job>>("/api/jobs", payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] });
      queryClient.invalidateQueries({ queryKey: ["worker", "jobs"] });
      queryClient.invalidateQueries({ queryKey: ["worker", "earnings"] });
    },
  });
}

export function useAddAdditionalCharge() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      amount,
      reason,
    }: {
      jobId: string;
      amount: number;
      reason: string;
    }) => {
      return api.patch<ApiResponse<Job>>("/api/jobs", {
        jobId,
        additionalCharge: {
          amount,
          description: reason,
          reason,
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] });
    },
  });
}

export function useAddMaterial() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      jobId,
      name,
      quantity,
      unitPrice,
    }: {
      jobId: string;
      name: string;
      quantity: number;
      unitPrice: number;
    }) => {
      return api.patch<ApiResponse<Job>>("/api/jobs", {
        jobId,
        material: { name, quantity, unitPrice },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["job", variables.jobId] });
    },
  });
}

export function useWorkerEarnings() {
  return useQuery({
    queryKey: ["worker", "earnings"],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<EarningsSummary>>("/api/workers/earnings");
        if (res.data) return res.data;
      } catch {
        // Handled cleanly with empty/zero state
      }
      return {
        today: 0,
        thisWeek: 0,
        thisMonth: 0,
        totalEarnings: 0,
        pendingPayout: 0,
        completedJobsCount: 0,
        rating: 5.0,
      } as EarningsSummary;
    },
  });
}

export function usePayoutHistory() {
  return useQuery({
    queryKey: ["worker", "payouts"],
    queryFn: async () => {
      try {
        const res = await api.get<ApiResponse<any[]>>("/api/payouts");
        if (res.data && Array.isArray(res.data)) {
          return res.data.map((p) => ({
            _id: p._id,
            amount: p.amount || (p.amountMinor ? p.amountMinor / 100 : 0),
            status: p.status || "completed",
            payoutDate: p.createdAt || p.payoutDate || new Date().toISOString(),
            transactionReference: p.transactionReference || p._id,
            paymentMethod: p.paymentMethod || "Bank Transfer",
          })) as PayoutTransaction[];
        }
        return [] as PayoutTransaction[];
      } catch {
        return [] as PayoutTransaction[];
      }
    },
  });
}

export function useRequestPayout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: { amount: number; paymentMethod: string; upiId?: string }) => {
      return api.post<ApiResponse<PayoutTransaction>>("/api/payouts", {
        amount: data.amount,
        beneficiaryName: data.upiId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "earnings"] });
      queryClient.invalidateQueries({ queryKey: ["worker", "payouts"] });
    },
  });
}

export function useWorkerProfile() {
  return useQuery({
    queryKey: ["worker", "profile"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<WorkerProfile>>("/api/workers/me");
      return res.data;
    },
  });
}

export function useUpdateWorkerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Partial<WorkerProfile>) => {
      return api.patch<ApiResponse<WorkerProfile>>("/api/workers/me", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "profile"] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<ServiceCategory[]>>("/api/categories");
      return res.data || [];
    },
  });
}
