import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { User, WorkerProfile } from "../types";
import { api } from "../services/api";
import { getAuthToken, saveUserData, getUserData } from "../services/storage";

interface AuthState {
  token: string | null;
  user: User | null;
  workerProfile: WorkerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOnline: boolean;
  notificationSettings: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

const initialState: AuthState = {
  token: null,
  user: null,
  workerProfile: null,
  isAuthenticated: false,
  isLoading: true,
  isOnline: false,
  notificationSettings: {
    jobUpdates: true,
    chatMessages: true,
    paymentReceipts: true,
    disputeUpdates: true,
  },
};

export const updateNotificationSettings = createAsyncThunk(
  "auth/updateNotificationSettings",
  async (args: { settings: any }) => {
    const token = await getAuthToken();
    if (!token) throw new Error("Please sign in again");
    await api.patch("/api/users", { notificationSettings: args.settings }, token);
    const savedUser = await getUserData();
    if (savedUser) {
      await saveUserData({ ...savedUser, notificationSettings: args.settings });
    }
    return args.settings;
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        user: User;
        workerProfile?: WorkerProfile;
      }>
    ) => {
      state.token = action.payload.token;
      state.user = action.payload.user;
      if (action.payload.workerProfile) {
        state.workerProfile = action.payload.workerProfile;
        state.isOnline = action.payload.workerProfile.isOnline;
      }
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    updateProfile: (state, action: PayloadAction<Partial<WorkerProfile>>) => {
      if (state.workerProfile) {
        state.workerProfile = { ...state.workerProfile, ...action.payload };
      }
      if (action.payload.isOnline !== undefined) {
        state.isOnline = action.payload.isOnline;
      }
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.isOnline = action.payload;
      if (state.workerProfile) {
        state.workerProfile.isOnline = action.payload;
        state.workerProfile.status = action.payload ? "available" : "offline";
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.workerProfile = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.isOnline = false;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(updateNotificationSettings.fulfilled, (state, action) => {
      state.notificationSettings = action.payload;
    });
  },
});

export const {
  setCredentials,
  updateProfile,
  updateUser,
  setOnlineStatus,
  logout,
  setLoading,
} = authSlice.actions;

export default authSlice.reducer;
