import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

export interface RatingData {
  jobId: string;
  workerId: string;
  rating: number;
  review?: string;
}

export interface Review {
  _id: string;
  jobId: string;
  customerId: { _id: string; name: string; avatar?: string };
  workerId: string;
  rating: number;
  review?: string;
  createdAt: string;
}

export async function submitRating(data: RatingData): Promise<void> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  await api.post("/api/jobs", { action: "rate", ...data }, token);
}

export async function getWorkerReviews(workerId: string): Promise<Review[]> {
  const token = await SecureStore.getItemAsync("token");
  const res = await api.get<{ data: Review[] }>(`/api/workers?workerId=${workerId}&action=reviews`, token || undefined);
  return res.data || [];
}
