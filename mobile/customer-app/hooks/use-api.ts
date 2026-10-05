import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import * as SecureStore from "../services/storage";
import { ApiResponse, Job, ServiceCategory, Payment, WorkerProfile, User } from "../types";

async function getToken(): Promise<string | undefined> {
  const token = await SecureStore.getItemAsync("token");
  return token || undefined;
}

function buildQueryString(params: Record<string, any>): string {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "" && v !== null) sp.set(k, String(v));
  });
  const str = sp.toString();
  return str ? `?${str}` : "";
}

// Categories
export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ApiResponse<ServiceCategory[]>>("/api/categories", token);
    },
  });
}

// Customer Jobs / Bookings
export function useJobs(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["jobs", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return api.get<ApiResponse<Job[]>>(`/api/jobs${qs}`, token);
    },
  });
}

export function useJobDetail(jobId: string) {
  return useQuery({
    queryKey: ["jobs", jobId],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ApiResponse<Job>>(`/api/jobs?jobId=${jobId}`, token);
    },
    enabled: !!jobId,
    refetchInterval: 10000,
  });
}

export function useCreateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      const token = await getToken();
      return api.post<ApiResponse<{ job: Job; matchedWorkers: number }>>("/api/jobs", data, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

export function useUpdateJob() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ jobId, ...updates }: { jobId: string; [key: string]: any }) => {
      const token = await getToken();
      return api.patch<ApiResponse<Job>>("/api/jobs", { jobId, ...updates }, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  });
}

// Workers
export function useWorkers(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["workers", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return api.get<ApiResponse<WorkerProfile[]>>(`/api/workers${qs}`, token);
    },
  });
}

export function useWorkerDetail(workerId: string) {
  return useQuery({
    queryKey: ["worker", workerId],
    queryFn: async () => {
      const token = await getToken();
      return api.get<ApiResponse<WorkerProfile>>(`/api/workers?workerId=${workerId}`, token);
    },
    enabled: !!workerId,
  });
}

// Payments
export function usePayments(params: Record<string, any> = {}) {
  return useQuery({
    queryKey: ["payments", params],
    queryFn: async () => {
      const token = await getToken();
      const qs = buildQueryString(params);
      return api.get<ApiResponse<Payment[]>>(`/api/payments${qs}`, token);
    },
  });
}

// Customer Profile
export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { userId: string; [key: string]: any }) => {
      const token = await getToken();
      return api.patch<ApiResponse<User>>("/api/users", data, token);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
