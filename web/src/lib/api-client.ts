const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

interface RequestOptions extends RequestInit {
  token?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, ...fetchOptions } = options;
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(token),
        ...fetchOptions.headers,
      },
    });

    let data: unknown = null;
    try {
      data = await response.json();
    } catch {
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
      const err = data as { error?: string; message?: string } | null;
      throw new Error(err?.error || err?.message || "API request failed");
    }

    return data as T;
  }

  get<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: "GET", token });
  }

  post<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      token,
    });
  }

  patch<T>(endpoint: string, body: unknown, token?: string) {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      token,
    });
  }

  delete<T>(endpoint: string, token?: string) {
    return this.request<T>(endpoint, { method: "DELETE", token });
  }
}

export const api = new ApiClient(API_BASE_URL);

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}
