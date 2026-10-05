import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as SecureStore from "../services/storage";
import { api } from "../services/api";
import { disconnectSocket } from "../services/chat";
import { User, ApiResponse } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  otpExpiresAt: number | null;
  notificationSettings: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  otpExpiresAt: null,
  notificationSettings: {
    jobUpdates: true,
    chatMessages: true,
    paymentReceipts: true,
    disputeUpdates: true,
  },
};

export const sendOtp = createAsyncThunk("auth/sendOtp", async (phone: string) => {
  const res = await api.post<ApiResponse<{ phone: string; otpExpiresIn: number }>>("/api/auth", {
    action: "send-otp",
    phone,
    role: "customer",
  });
  return res;
});

export const verifyOtp = createAsyncThunk(
  "auth/verifyOtp",
  async ({ phone, otp, name }: { phone: string; otp: string; name?: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>("/api/auth", {
      action: "verify-otp",
      phone,
      otp,
      role: "customer",
      name,
    });
    const payloadData = (res as any)?.data || res;
    const user = payloadData?.user;
    const token = payloadData?.token;
    if (token && user) {
      user.role = "customer";
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("user", JSON.stringify(user));
    }
    return { user, token };
  }
);

export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const token = await SecureStore.getItemAsync("token");
  const userStr = await SecureStore.getItemAsync("user");
  if (token && userStr) {
    try {
      const response = await api.get<ApiResponse<User>>("/api/auth", token);
      if (!response.data) throw new Error("Invalid session");
      const user = response.data;
      user.role = "customer";
      await SecureStore.setItemAsync("user", JSON.stringify(user));
      return { token, user };
    } catch {
      await SecureStore.deleteItemAsync("token");
      await SecureStore.deleteItemAsync("user");
      return null;
    }
  }
  return null;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  const token = await SecureStore.getItemAsync("token");
  try {
    if (token) await api.post("/api/auth", { action: "logout" }, token);
  } finally {
    disconnectSocket();
    await SecureStore.deleteItemAsync("token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("kaamdo_job_draft_v1");
  }
});

export const updateNotificationSettings = createAsyncThunk(
  "auth/updateNotificationSettings",
  async (args: { settings: any }) => {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Please sign in again");
    await api.patch("/api/users", { notificationSettings: args.settings }, token);
    const savedUser = await SecureStore.getItemAsync("user");
    if (savedUser) {
      await SecureStore.setItemAsync(
        "user",
        JSON.stringify({ ...JSON.parse(savedUser), notificationSettings: args.settings })
      );
    }
    return args.settings;
  }
);

export const resetOtpExpire = createAsyncThunk("auth/resetOtpExpire", async (phone: string) => {
  const res = await api.post<ApiResponse<{ phone: string; otpExpiresIn: number }>>("/api/auth", {
    action: "resend-otp",
    phone,
    role: "customer",
  });
  return res.data;
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.otpExpiresAt = Date.now() + (action.payload.data?.otpExpiresIn ?? 300) * 1000;
      })
      .addCase(sendOtp.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user && action.payload?.token) {
          state.user = action.payload.user;
          state.notificationSettings =
            action.payload.user.notificationSettings ?? initialState.notificationSettings;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(verifyOtp.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
          state.isAuthenticated = true;
        }
      })
      .addCase(loadUser.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.otpExpiresAt = null;
      })
      .addCase(logout.rejected, () => ({ ...initialState, isLoading: false }))
      .addCase(updateNotificationSettings.fulfilled, (state, action) => {
        state.notificationSettings = action.payload;
        if (state.user) state.user.notificationSettings = action.payload;
      })
      .addCase(resetOtpExpire.fulfilled, (state, action) => {
        state.otpExpiresAt = Date.now() + (action.payload?.otpExpiresIn ?? 300) * 1000;
      });
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
