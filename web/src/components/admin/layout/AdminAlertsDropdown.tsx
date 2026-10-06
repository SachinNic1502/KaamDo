"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle2, AlertCircle, ShieldAlert, CreditCard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { AdminAlert } from "./types";

interface AnalyticsResponse {
  totalWorkers?: number;
  verifiedWorkers?: number;
  pendingPayouts?: number;
  totalDisputes?: number;
  disputedJobs?: number;
}

export function AdminAlertsDropdown() {
  const router = useRouter();
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadAlerts() {
      try {
        const token = getToken();
        if (!token) return;

        const res = await api.get<ApiResponse<AnalyticsResponse>>("/api/analytics", token);
        if (!active) return;

        const data = res.data;
        const generatedAlerts: AdminAlert[] = [];

        if (data) {
          // 1. Pending KYC Verifications
          const unverifiedWorkers = (data.totalWorkers || 0) - (data.verifiedWorkers || 0);
          if (unverifiedWorkers > 0) {
            generatedAlerts.push({
              id: "kyc-pending",
              title: "Worker KYC Verifications Pending",
              description: `${unverifiedWorkers} technician registration${unverifiedWorkers > 1 ? "s" : ""} require document verification.`,
              href: "/admin/kyc",
              badge: `${unverifiedWorkers} Pending`,
              badgeVariant: "default",
              type: "kyc",
            });
          }

          // 2. Open Disputes
          const openDisputes = data.disputedJobs || data.totalDisputes || 0;
          if (openDisputes > 0) {
            generatedAlerts.push({
              id: "open-disputes",
              title: "Active Service Disputes",
              description: `${openDisputes} job dispute${openDisputes > 1 ? "s" : ""} require resolution and escrow review.`,
              href: "/admin/disputes",
              badge: `${openDisputes} Open`,
              badgeVariant: "destructive",
              type: "dispute",
            });
          }

          // 3. Pending Payouts
          if (data.pendingPayouts && data.pendingPayouts > 0) {
            generatedAlerts.push({
              id: "pending-payouts",
              title: "Worker Payout Obligations",
              description: `${data.pendingPayouts} worker payout${data.pendingPayouts > 1 ? "s" : ""} ready for settlement dispatch.`,
              href: "/admin/payments/payouts",
              badge: `${data.pendingPayouts} Due`,
              badgeVariant: "secondary",
              type: "payout",
            });
          }
        }

        setAlerts(generatedAlerts);
      } catch {
        // Non-blocking error handling
      } finally {
        if (active) setLoading(false);
      }
    }

    loadAlerts();
    const interval = setInterval(loadAlerts, 60000); // refresh every minute

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const totalCount = alerts.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger render={
        <Button
          variant="outline"
          size="icon-sm"
          className="relative text-muted-foreground hover:text-foreground rounded-lg"
          aria-label="System Alerts"
        >
          <Bell className="h-4 w-4" />
          {totalCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-xs animate-pulse">
              {totalCount}
            </span>
          )}
        </Button>
      } />

      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="font-semibold text-xs flex items-center justify-between">
          <span>Live Administrative Alerts</span>
          {totalCount > 0 ? (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0 h-4">
              {totalCount} Action{totalCount > 1 ? "s" : ""} Required
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
              Zero Pending
            </Badge>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <div className="p-2 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              Checking operational alerts…
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => router.push(alert.href)}
                className="p-2.5 rounded-lg bg-muted/50 hover:bg-muted text-xs space-y-1 cursor-pointer transition border border-transparent hover:border-border"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    {alert.type === "dispute" ? (
                      <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    ) : alert.type === "kyc" ? (
                      <ShieldAlert className="w-3.5 h-3.5 text-primary shrink-0" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    )}
                    <p className="font-semibold text-foreground truncate">{alert.title}</p>
                  </div>
                  {alert.badge && (
                    <Badge variant={alert.badgeVariant || "secondary"} className="text-[9px] px-1 py-0 h-3.5 shrink-0">
                      {alert.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2">{alert.description}</p>
              </div>
            ))
          ) : (
            <div className="py-5 px-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-center space-y-1.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-semibold text-foreground">All Systems Operational</p>
              <p className="text-[11px] text-muted-foreground">
                Zero open disputes, unverified technicians, or pending payouts require attention.
              </p>
            </div>
          )}

          <div className="pt-1.5 border-t border-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/analytics")}
              className="w-full text-xs text-primary hover:text-primary/90 justify-center font-semibold gap-1.5"
            >
              <span>View Analytics & Logs</span>
              <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
