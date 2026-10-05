import { getAuthToken } from "./storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const storedToken = await getAuthToken();
  const token = options.token || storedToken || undefined;
  const { headers: customHeaders, ...rest } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(customHeaders as Record<string, string>),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers,
    ...rest,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "An error occurred");
  }

  return data;
}

export const api = {
  get: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "GET", token }),

  post: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    }),

  put: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      token,
    }),

  patch: <T>(endpoint: string, body: any, token?: string) =>
    request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    }),

  delete: <T>(endpoint: string, token?: string) =>
    request<T>(endpoint, { method: "DELETE", token }),

  // File uploads with multipart/form-data
  upload: async <T>(endpoint: string, formData: FormData, token?: string): Promise<T> => {
    const storedToken = await getAuthToken();
    const authToken = token || storedToken;
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "Upload failed");
    }
    return data;
  },
};
