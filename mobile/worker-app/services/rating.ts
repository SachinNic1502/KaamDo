import { api } from "./api";
import { getAuthToken } from "./storage";
import { ApiResponse } from "../types";

export interface RatingPayload {
  jobId: string;
  rating: number;
  comment?: string;
}

export async function submitRating(payload: RatingPayload): Promise<ApiResponse<any>> {
  const token = await getAuthToken();
  if (!token) throw new Error("Not authenticated");
  return api.post("/api/jobs/rating", payload, token);
}
