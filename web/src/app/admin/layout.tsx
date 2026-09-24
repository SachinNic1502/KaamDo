"use client";
import { Sidebar } from "@/components/admin/sidebar";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = useState(false);
  const router = useRouter();
  useEffect(() => {
    let active = true;
    void api.get<ApiResponse<{ role: string }>>("/api/auth", getToken() ?? undefined).then(response => {
      if (!active) return;
      if (response.data?.role === "admin") setAuthorized(true);
      else { removeToken(); router.replace("/login"); }
    }).catch(() => { if (active) { removeToken(); router.replace("/login"); } });
    return () => { active = false; };
  }, [router]);
  if (!authorized) return <p className="p-6" role="status">Checking session…</p>;
  return <div className="flex h-screen"><div className="w-64 flex-shrink-0"><Sidebar /></div><main className="flex-1 overflow-y-auto bg-muted/30"><div className="p-6">{children}</div></main></div>;
}
