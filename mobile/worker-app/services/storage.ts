import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const TOKEN_KEY = "kaamdo_worker_token";
const USER_KEY = "kaamdo_worker_user";
const PROFILE_KEY = "kaamdo_worker_profile";

export async function setItemAsync(key: string, value: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

export async function getItemAsync(key: string): Promise<string | null> {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  }
  return await SecureStore.getItemAsync(key);
}

export async function deleteItemAsync(key: string): Promise<void> {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

export async function saveAuthToken(token: string): Promise<void> {
  await setItemAsync(TOKEN_KEY, token);
}

export async function getAuthToken(): Promise<string | null> {
  return await getItemAsync(TOKEN_KEY);
}

export async function removeAuthToken(): Promise<void> {
  await deleteItemAsync(TOKEN_KEY);
}

export async function saveUserData(user: any): Promise<void> {
  await setItemAsync(USER_KEY, JSON.stringify(user));
}

export async function getUserData(): Promise<any | null> {
  const data = await getItemAsync(USER_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function removeUserData(): Promise<void> {
  await deleteItemAsync(USER_KEY);
}

export async function saveWorkerProfile(profile: any): Promise<void> {
  await setItemAsync(PROFILE_KEY, JSON.stringify(profile));
}

export async function getWorkerProfile(): Promise<any | null> {
  const data = await getItemAsync(PROFILE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export async function removeWorkerProfile(): Promise<void> {
  await deleteItemAsync(PROFILE_KEY);
}

export async function clearAll(): Promise<void> {
  await removeAuthToken();
  await removeUserData();
  await removeWorkerProfile();
}
