"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { api, setToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
export default function LoginPage() {
  const router = useRouter(), cache = useQueryClient();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function login(form: FormData) {
    setBusy(true); setError("");
    try {
      const result = await api.post<ApiResponse<{ token: string; user: { role: string } }>>("/api/auth", { action: "login", phone: form.get("phone"), password: form.get("password") });
      if (!result.data?.token || result.data.user.role !== "admin") throw new Error("An administrator account is required.");
      cache.clear(); setToken(result.data.token); router.replace("/admin");
    } catch (error) { setError(error instanceof Error ? error.message : "Sign in failed"); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-md p-8 space-y-6"><h1 className="text-2xl font-bold">KaamDo admin sign in</h1><form action={login} className="space-y-4"><label className="block">Phone number<input name="phone" type="tel" autoComplete="tel" required className="block w-full border rounded p-3" /></label><label className="block">Password<input name="password" type="password" autoComplete="current-password" required className="block w-full border rounded p-3" /></label><p role="alert">{error}</p><button disabled={busy} className="rounded bg-blue-600 p-3 text-white">{busy ? "Signing in…" : "Sign in"}</button></form></main>;
}
