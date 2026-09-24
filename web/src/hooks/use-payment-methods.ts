import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
interface PaymentMethod { _id: string; type: "card" | "bank" | "upi"; last4?: string; brand?: string; isDefault: boolean; }

export function usePaymentMethods() {
  return useQuery({
    queryKey: ["payment-methods"],
    queryFn: async () => {
      const res = await api.get<ApiResponse<PaymentMethod[]>>("/api/payment-methods", getToken() ?? undefined);
      return res.data ?? [];
    },
    staleTime: 60 * 1000,
  });
}

export function useDeletePaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string) =>
      api.delete<ApiResponse<null>>(`/api/payment-methods?methodId=${encodeURIComponent(methodId)}`, getToken() ?? undefined),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}

export function useSetDefaultPaymentMethod() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (methodId: string) =>
      api.patch<ApiResponse<PaymentMethod>>(
        `/api/payment-methods?methodId=${methodId}`,
        { isDefault: true }, getToken() ?? undefined
      ),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["payment-methods"] });
    },
  });
}