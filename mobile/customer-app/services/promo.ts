import { api } from "./api";
import * as SecureStore from "./storage";
import { ApiResponse } from "../types";

export interface PromoCode {
  _id: string;
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  description?: string;
  expiresAt: string;
}

export async function fetchPromos(): Promise<ApiResponse<PromoCode[]>> {
  const token = await SecureStore.getItemAsync("token");
  return api.get("/api/promotions", token || undefined);
}

export async function validatePromo(code: string, amount: number): Promise<ApiResponse<any>> {
  const token = await SecureStore.getItemAsync("token");
  return api.post("/api/promotions/validate", { code, orderAmount: amount }, token || undefined);
}
