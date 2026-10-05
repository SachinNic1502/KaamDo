"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardStats, useJobs } from "@/hooks/use-api";
import {
  StatMetricCard,
  DashboardHeader,
  EmptyState,
  CanonicalStatusBadge,
} from "@/components/dashboard/dashboard-components";
import {
  Users,
  Briefcase,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  DollarSign,
  UserCheck,
  Building2,
  Wallet,
  Settings,
  Sparkles,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { data, isLoading, error, refetch } = useDashboardStats();
  const { data: jobsData } = useJobs({ limit: 6 });

  const stats = (data?.data as Record<string, any>) || {};
  const recentJobs = (jobsData?.data as any[]) || [];

  const formatCurrency = (value?: number) =>
    value !== undefined ? `₹${value.toLocaleString("en-IN")}` : "₹0";

  const formatNumber = (value?: number) =>
    value !== undefined ? value.toLocaleString("en-IN") : "0";

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 p-8 text-center bg-card rounded-2xl border border-border">
        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
          <AlertCircle className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-bold text-foreground">Failed to Load Command Metrics</h2>
          <p className="text-xs text-muted-foreground max-w-sm">
            {error instanceof Error ? error.message : "Unable to reach the platform metrics service."}
          </p>
        </div>
        <Button size="sm" onClick={() => refetch()} className="text-xs font-semibold">
          Retry Request
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <DashboardHeader
        title="Executive Command Center"
        description="Real-time marketplace volume, workforce analytics, compliance audits, and platform revenues."
      >
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => router.push("/admin/kyc")}
            className="text-xs font-semibold gap-1.5 border-primary/20 text-primary hover:bg-primary/5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>KYC Queue</span>
          </Button>
          <Button
            size="sm"
            onClick={() => router.push("/admin/analytics")}
            className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Deep Analytics</span>
          </Button>
        </div>
      </DashboardHeader>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatMetricCard
          title="Total Registered Users"
          value={isLoading ? "…" : formatNumber(stats?.totalUsers)}
          icon={Users}
          iconBg="bg-blue-500/10"
          iconColor="text-blue-600 dark:text-blue-400"
          description={`Customers: ${formatNumber(stats?.totalCustomers)} | Contractors: ${formatNumber(stats?.totalContractors)}`}
          onClick={() => router.push("/admin/users")}
        />
        <StatMetricCard
          title="Gross Marketplace GMV"
          value={isLoading ? "…" : formatCurrency(stats?.totalRevenue)}
          icon={CreditCard}
          iconBg="bg-indigo-500/10"
          iconColor="text-indigo-600 dark:text-indigo-400"
          description={`Commission: ${formatCurrency(stats?.totalCommission)}`}
          onClick={() => router.push("/admin/payments")}
        />
        <StatMetricCard
          title="Active Field Jobs"
          value={isLoading ? "…" : formatNumber(stats?.activeJobs)}
          icon={Briefcase}
          iconBg="bg-amber-500/10"
          iconColor="text-amber-600 dark:text-amber-400"
          description={`Completed: ${formatNumber(stats?.completedJobs)} | Cancelled: ${formatNumber(stats?.cancelledJobs)}`}
          onClick={() => router.push("/admin/jobs")}
        />
        <StatMetricCard
          title="Platform Disputes"
          value={isLoading ? "…" : formatNumber(stats?.totalDisputes)}
          icon={AlertCircle}
          iconBg="bg-rose-500/10"
          iconColor="text-rose-600 dark:text-rose-400"
          badge={stats?.totalDisputes > 0 ? "Requires Review" : "Clear"}
          description="Customer & worker ticket queue"
          onClick={() => router.push("/admin/disputes")}
        />
      </div>

      {/* Operational Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          onClick={() => router.push("/admin/kyc")}
          className="border border-border/80 hover:border-primary/50 transition cursor-pointer p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Verified Technicians</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats?.verifiedWorkers)} of {formatNumber(stats?.totalWorkers)} Total
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Card>

        <Card
          onClick={() => router.push("/admin/payments/payouts")}
          className="border border-border/80 hover:border-primary/50 transition cursor-pointer p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Worker Payouts Queue</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(stats?.pendingPayouts)} Pending Approval
              </p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Card>

        <Card
          onClick={() => router.push("/admin/settings")}
          className="border border-border/80 hover:border-primary/50 transition cursor-pointer p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">Platform Settings</p>
              <p className="text-xs text-muted-foreground">Commission & Gateway Setup</p>
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </Card>
      </div>

      {/* Main Tables & Live Streams */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Jobs Registry */}
        <Card className="lg:col-span-2 border border-border/80">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-sm font-bold text-foreground">Recent Marketplace Dispatches</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Live service bookings and assigned technician movements.</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/admin/jobs")}
              className="text-xs gap-1 text-primary"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-14 rounded-xl bg-muted/60 animate-pulse" />
                ))}
              </div>
            ) : recentJobs.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No jobs recorded yet"
                description="When customers book services, dispatches will appear in this registry."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Job Number</th>
                      <th className="py-2.5 px-3">Service</th>
                      <th className="py-2.5 px-3">Customer &rarr; Worker</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {recentJobs.slice(0, 5).map((job) => (
                      <tr key={job._id} className="hover:bg-muted/30 transition">
                        <td className="py-3 px-3 font-mono font-bold text-foreground">{job.jobNumber}</td>
                        <td className="py-3 px-3 font-medium text-foreground">{job.categoryId?.name || "Service"}</td>
                        <td className="py-3 px-3 text-muted-foreground">
                          {job.customerId?.name || "Customer"} &rarr; {job.workerId?.name || "Unassigned"}
                        </td>
                        <td className="py-3 px-3"><CanonicalStatusBadge status={job.status} /></td>
                        <td className="py-3 px-3 text-right font-bold text-foreground">
                          {formatCurrency(job.finalAmount || job.estimatedAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Platform Integrity & Quick Triage */}
        <Card className="border border-border/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold text-foreground">Platform Health & Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3.5 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">Online Technicians</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {formatNumber(stats?.activeWorkers)} Ready
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${stats?.totalWorkers ? Math.min(100, Math.round((stats.activeWorkers / stats.totalWorkers) * 100)) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-foreground">KYC Verification Rate</span>
                <span className="font-bold text-primary">
                  {stats?.totalWorkers ? Math.round(((stats.verifiedWorkers || 0) / stats.totalWorkers) * 100) : 0}%
                </span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{
                    width: `${stats?.totalWorkers ? Math.round(((stats.verifiedWorkers || 0) / stats.totalWorkers) * 100) : 0}%`,
                  }}
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/users?role=worker")}
                className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Audit Unverified Technicians</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/admin/payments/reconciliation")}
                className="w-full justify-between text-xs text-muted-foreground hover:text-foreground"
              >
                <span>Gateway Reconciliation Status</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}