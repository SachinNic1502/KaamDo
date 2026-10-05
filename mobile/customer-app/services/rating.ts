import { api } from "./api";
import * as SecureStore from "./storage";
import { ApiResponse } from "../types";

export interface RatingPayload {
  jobId: string;
  rating: number;
  comment?: string;
}

export async function submitRating(payload: RatingPayload): Promise<ApiResponse<any>> {
  const token = await SecureStore.getItemAsync("token");
  if (!token) throw new Error("Not authenticated");
  return api.post("/api/jobs/rating", payload, token);
}
