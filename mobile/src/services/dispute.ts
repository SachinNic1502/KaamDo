import { api } from "../api/client";
import * as SecureStore from "expo-secure-store";

export interface DisputeData {
  jobId: string;
  reason: string;
  description: string;
  images?: string[];
}

export interface Dispute {
  _id: string;
  jobId: { _id: string; jobNumber: string };
  raisedBy: { _id: string; name: string };
  againstUser: { _id: string; name: string };
  reason: string;
  description: string;
  images: string[];
  status: "raised" | "under_review" | "evidence_submitted" | "support_review" | "resolved";
  resolution?: string;
  createdAt: string;
}

export async function raiseDispute(data: DisputeData): Promise<void> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  await api.post("/api/disputes", { ...data, images: data.images || [] }, token);
}

export async function getDisputes(params?: { status?: string }): Promise<Dispute[]> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  const qs = params?.status ? `?status=${params.status}` : "";
  const res = await api.get<{ data: Dispute[] }>(`/api/disputes${qs}`, token);
  return res.data || [];
}

export async function getDisputeById(disputeId: string): Promise<Dispute | null> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  const res = await api.get<{ data: Dispute }>(`/api/disputes?disputeId=${disputeId}`, token);
  return res.data || null;
}
