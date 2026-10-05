import { api } from "./api";

export const disputeService = {
  createDispute: async (data: {
    jobId: string;
    reason: string;
    description: string;
    evidence?: string[];
  }) => {
    return api.post<{ success: boolean; dispute: any }>("/api/disputes", data);
  },

  getDisputes: async () => {
    return api.get<{ disputes: any[] }>("/api/disputes");
  },
};

export const createDispute = disputeService.createDispute;
export const getDisputes = disputeService.getDisputes;
