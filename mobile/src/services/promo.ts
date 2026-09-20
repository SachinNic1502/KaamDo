import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  maxDiscount?: number;
  minOrder?: number;
  validUntil: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export async function validatePromoCode(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; promoId?: string; message: string }> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  const res = await api.post<{ data: { valid: boolean; discount: number; promoId: string; message: string } }>(
    "/api/promotions",
    { action: "validate", code, orderAmount },
    token
  );
  return res.data || { valid: false, discount: 0, message: "Invalid promo code" };
}

export async function getActivePromos(): Promise<PromoCode[]> {
  const token = await SecureStore.getItemAsync("token");
  const res = await api.get<{ data: PromoCode[] }>("/api/promotions?active=true", token || undefined);
  return res.data || [];
}
