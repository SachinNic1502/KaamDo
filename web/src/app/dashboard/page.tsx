"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

export default function DashboardRedirectPage() {
  const router = useRouter();

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get<ApiResponse<{ role: string }>>("/api/auth", token)
      .then((res) => {
        const role = res.data?.role;
        if (role === "admin") {
          router.replace("/admin");
        } else if (role === "worker") {
          router.replace("/dashboard/worker");
        } else if (role === "contractor") {
          router.replace("/dashboard/contractor");
        } else {
          router.replace("/dashboard/customer");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
        <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl animate-pulse">
          KD
        </div>
        <p className="text-xs text-muted-foreground">Routing to your workspace…</p>
      </div>
    </div>
  );
}
