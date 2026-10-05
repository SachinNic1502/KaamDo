"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getToken, api } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

export default function JobsIndexPage() {
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
        if (res.data?.role === "admin") {
          router.replace("/admin/jobs");
        } else if (res.data?.role === "worker") {
          router.replace("/dashboard/worker?tab=jobs");
        } else {
          router.replace("/dashboard/customer?tab=bookings");
        }
      })
      .catch(() => {
        router.replace("/login");
      });
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold animate-pulse">
        KD
      </div>
    </div>
  );
}
