const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...fetchOptions,
      headers: { ...this.getHeaders(token), ...fetchOptions.headers },
    });
    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }
    if (!response.ok) {
      const err = data as { error?: string; message?: string } | null;
      throw new Error(err?.error || err?.message || "Request failed");
    }
    return data as T;
  }

  get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: "GET", token });
  }

  post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, { method: "POST", body: JSON.stringify(body), token });
  }

  patch<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body), token });
  }
}

export const api = new ApiClient(API_BASE_URL);
