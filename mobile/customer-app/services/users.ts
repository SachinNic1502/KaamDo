import { api } from "./api";
import * as SecureStore from "./storage";
import { User, Address, ApiResponse } from "../types";

const SAVED_ADDRESSES_KEY = "kaamdo_saved_addresses_v1";
const SELECTED_LOCATION_KEY = "kaamdo_selected_location_v1";

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: string;
  notificationSettings?: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

export const userService = {
  /**
   * Fetch current authenticated customer profile
   */
  async getProfile(): Promise<ApiResponse<User>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    return api.get<ApiResponse<User>>("/api/auth", token);
  },

  /**
   * Update customer profile details
   */
  async updateProfile(
    payload: UpdateProfilePayload
  ): Promise<ApiResponse<User>> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) throw new Error("Not authenticated");

    const userStr = await SecureStore.getItemAsync("user");
    const currentUser = userStr ? JSON.parse(userStr) : null;
    const userId = currentUser?._id || currentUser?.id;

    if (!userId) throw new Error("User ID not resolved");

    const response = await api.patch<ApiResponse<User>>(
      "/api/users",
      {
        userId,
        ...payload,
      },
      token
    );

    if (response.data) {
      await SecureStore.setItemAsync("user", JSON.stringify(response.data));
    }

    return response;
  },

  /**
   * Register push notification token
   */
  async registerPushToken(pushToken: string): Promise<void> {
    const token = await SecureStore.getItemAsync("token");
    if (!token) return;

    await api.post("/api/users", { pushToken }, token);
  },

  /**
   * Get saved addresses from local device storage
   */
  async getSavedAddresses(): Promise<Address[]> {
    try {
      const data = await SecureStore.getItemAsync(SAVED_ADDRESSES_KEY);
      if (!data) {
        return [
          {
            label: "Home",
            address: "Flat 402, Royal Palms, Sector 18",
            city: "Noida",
            state: "Uttar Pradesh",
            pincode: "201301",
          },
          {
            label: "Office",
            address: "Tower B, Cyber Hub, DLF Phase 2",
            city: "Gurugram",
            state: "Haryana",
            pincode: "122002",
          },
        ];
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  /**
   * Save a new delivery / service address
   */
  async saveAddress(newAddress: Address): Promise<Address[]> {
    const addresses = await this.getSavedAddresses();
    const updated = [newAddress, ...addresses.filter((a) => a.address !== newAddress.address)];
    await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Delete a saved address
   */
  async deleteAddress(addressString: string): Promise<Address[]> {
    const addresses = await this.getSavedAddresses();
    const updated = addresses.filter((a) => a.address !== addressString);
    await SecureStore.setItemAsync(SAVED_ADDRESSES_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Get active location label
   */
  async getSelectedLocation(): Promise<string> {
    const loc = await SecureStore.getItemAsync(SELECTED_LOCATION_KEY);
    return loc || "Sector 62, Noida";
  },

  /**
   * Set active location label
   */
  async setSelectedLocation(location: string): Promise<void> {
    await SecureStore.setItemAsync(SELECTED_LOCATION_KEY, location);
  },
};
