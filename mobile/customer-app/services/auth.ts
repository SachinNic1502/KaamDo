import { api } from "./api";
import * as SecureStore from "./storage";
import { disconnectSocket } from "./chat";
import { User, ApiResponse } from "../types";

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface SendOtpResponseData {
  phone: string;
  otpExpiresIn: number;
  debugOtp?: string;
}

export const authService = {
  /**
   * Request OTP verification code for mobile number
   */
  async sendOtp(phone: string): Promise<ApiResponse<SendOtpResponseData>> {
    return api.post<ApiResponse<SendOtpResponseData>>("/api/auth/send-otp", {
      phone,
      role: "customer",
    });
  },

  /**
   * Resend OTP verification code
   */
  async resendOtp(phone: string): Promise<ApiResponse<SendOtpResponseData>> {
    return api.post<ApiResponse<SendOtpResponseData>>("/api/auth", {
      action: "resend-otp",
      phone,
      role: "customer",
    });
  },

  /**
   * Verify OTP and complete login / registration
   */
  async verifyOtp(
    phone: string,
    otp: string,
    name?: string
  ): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>("/api/auth/verify-otp", {
      phone,
      otp,
      role: "customer",
      name,
    });

    const data = (response as any)?.data || response;
    if (data?.token && data?.user) {
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    }

    return response;
  },

  /**
   * Login with phone and password credentials
   */
  async loginWithPassword(
    phone: string,
    password: string
  ): Promise<ApiResponse<AuthResponseData>> {
    const response = await api.post<ApiResponse<AuthResponseData>>("/api/auth", {
      action: "login",
      phone,
      password,
      role: "customer",
    });

    const data = (response as any)?.data || response;
    if (data?.token && data?.user) {
      await SecureStore.setItemAsync("token", data.token);
      await SecureStore.setItemAsync("user", JSON.stringify(data.user));
    }

    return response;
  },

  /**
   * Reset password via OTP verification
   */
  async forgotPassword(
    phone: string,
    newPassword: string,
    otp: string
  ): Promise<ApiResponse<{ phone: string }>> {
    return api.post<ApiResponse<{ phone: string }>>("/api/auth/forgot-password", {
      phone,
      newPassword,
      otp,
    });
  },

  /**
   * Change password for authenticated session
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<null>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.post<ApiResponse<null>>(
      "/api/auth",
      {
        action: "change-password",
        currentPassword,
        newPassword,
      },
      token
    );
  },

  /**
   * Fetch current authenticated customer profile
   */
  async getMe(): Promise<ApiResponse<User>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("No active session");

    const response = await api.get<ApiResponse<User>>("/api/auth", token);
    if (response.data) {
      await SecureStore.setItemAsync("user", JSON.stringify(response.data));
    }
    return response;
  },

  /**
   * Sign out customer session and purge local tokens
   */
  async logout(): Promise<void> {
    const token = await SecureStore.getItemAsync("token");
    try {
      if (token) {
        await api.post("/api/auth", { action: "logout" }, token);
      }
    } catch {
      // Ignore network errors on logout to allow offline clean-up
    } finally {
      disconnectSocket();
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      await SecureStore.deleteItemAsync("kaamdo_job_draft_v1");
    }
  },

  /**
   * Get cached token from secure storage
   */
  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync("token");
  },

  /**
   * Get cached user from secure storage
   */
  async getCachedUser(): Promise<User | null> {
    const userStr = await SecureStore.getItemAsync("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};
