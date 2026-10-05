import { api } from "./api";
import * as SecureStore from "./storage";
import { ApiResponse } from "../types";

export interface DisputePayload {
  jobId: string;
  reason: string;
  description: string;
}

export async function createDispute(payload: DisputePayload): Promise<ApiResponse<any>> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  return api.post("/api/disputes", payload, token);
}
