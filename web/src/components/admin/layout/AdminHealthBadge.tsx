"use client";

import React, { useEffect, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { SystemHealthData } from "./types";

export function AdminHealthBadge() {
  const [health, setHealth] = useState<SystemHealthData>({
    status: "loading",
  });

  useEffect(() => {
    let active = true;

    async function fetchHealth() {
      try {
        const res = await fetch("/api/health");
        if (!res.ok) throw new Error("Health check failed");
        const json = await res.json();
        if (!active) return;

        setHealth({
          status: json.status === "healthy" ? "healthy" : "degraded",
          responseTimeMs: json.responseTimeMs,
          databaseStatus: json.checks?.database?.status,
          uptimeSeconds: json.uptimeSeconds,
          environment: json.environment,
        });
      } catch {
        if (!active) return;
        setHealth({
          status: "unreachable",
          databaseStatus: "disconnected",
        });
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 60000); // refresh every minute

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const isHealthy = health.status === "healthy";
  const isDegraded = health.status === "degraded";

  return (
    <Tooltip>
      <TooltipTrigger render={
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-medium transition cursor-default shadow-2xs select-none">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isHealthy
                ? "bg-emerald-500 animate-pulse"
                : isDegraded
                ? "bg-amber-500 animate-pulse"
                : "bg-rose-500"
            }`}
          />
          <span
            className={
              isHealthy
                ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                : isDegraded
                ? "text-amber-600 dark:text-amber-400 font-semibold"
                : "text-rose-600 dark:text-rose-400 font-semibold"
            }
          >
            {isHealthy
              ? `Live System${health.responseTimeMs ? ` (${health.responseTimeMs}ms)` : ""}`
              : isDegraded
              ? "Degraded System"
              : health.status === "loading"
              ? "Checking System…"
              : "System Offline"}
          </span>
        </div>
      } />
      <TooltipContent side="bottom" className="text-xs space-y-1">
        <p className="font-semibold text-foreground">API & Database Status</p>
        <p className="text-[11px] text-muted-foreground">
          DB: <strong className="text-foreground capitalize">{health.databaseStatus || "Connected"}</strong>
          {health.uptimeSeconds ? ` • Uptime: ${Math.floor(health.uptimeSeconds / 3600)}h` : ""}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
