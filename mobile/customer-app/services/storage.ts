import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

const memoryStore = new Map<string, string>();
const isWeb = Platform.OS === "web" || typeof window !== "undefined";

export const storage = {
  async getItemAsync(key: string): Promise<string | null> {
    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        // Fallback to memory
      }
      return memoryStore.get(key) ?? null;
    }

    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          return window.localStorage.getItem(key);
        }
      } catch {
        // Fallback to memory
      }
      return memoryStore.get(key) ?? null;
    }
  },

  async setItemAsync(key: string, value: string): Promise<void> {
    memoryStore.set(key, value);

    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // Memory fallback
      }
      return;
    }

    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, value);
        }
      } catch {
        // Memory fallback
      }
    }
  },

  async deleteItemAsync(key: string): Promise<void> {
    memoryStore.delete(key);

    if (isWeb) {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Memory fallback
      }
      return;
    }

    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
        }
      } catch {
        // Memory fallback
      }
    }
  },
};

export const getItemAsync = storage.getItemAsync;
export const setItemAsync = storage.setItemAsync;
export const deleteItemAsync = storage.deleteItemAsync;
export default storage;
