import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import * as SecureStore from "expo-secure-store";
import { api } from "../api/client";
import { User, ApiResponse } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
};

export const sendOtp = createAsyncThunk("auth/sendOtp", async (phone: string) => {
  const res = await api.post<ApiResponse<{ phone: string }>>("/api/auth", { action: "send-otp", phone });
  return res;
});

export const verifyOtp = createAsyncThunk("auth/verifyOtp", async ({ phone, otp }: { phone: string; otp: string }) => {
  const res = await api.post<ApiResponse<{ user: User; token: string }>>("/api/auth", { action: "verify-otp", phone, otp });
  if (res.data?.token) {
    await SecureStore.setItemAsync("token", res.data.token);
    await SecureStore.setItemAsync("user", JSON.stringify(res.data.user));
  }
  return res.data;
});

export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const token = await SecureStore.getItemAsync("token");
  const userStr = await SecureStore.getItemAsync("user");
  if (token && userStr) {
    return { token, user: JSON.parse(userStr) as User };
  }
  return null;
});

export const logout = createAsyncThunk("auth/logout", async () => {
  await SecureStore.deleteItemAsync("token");
  await SecureStore.deleteItemAsync("user");
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOtp.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload?.user && action.payload?.token) {
          state.user = action.payload.user;
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
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export default authSlice.reducer;
