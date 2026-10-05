"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { RoleDashboardLayout } from "@/components/dashboard/role-layout";
import {
  DashboardHeader,
  EmptyState,
  CanonicalStatusBadge,
} from "@/components/dashboard/dashboard-components";
import { useJobs, useDisputes } from "@/hooks/use-api";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Search,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  Phone,
  Sparkles,
  Receipt,
  KeyRound,
  MapPin,
  Calendar,
  Zap,
  Droplets,
  Hammer,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface JobRecord {
  _id: string;
  jobNumber: string;
  description: string;
  status: string;
  finalAmount?: number;
  estimatedAmount?: number;
  startOtp?: string;
  completionOtp?: string;
  createdAt: string;
  scheduledDate?: string;
  workerId?: {
    _id: string;
    name: string;
    phone: string;
  };
  categoryId?: {
    name: string;
    slug: string;
  };
}

const QUICK_SERVICES = [
  { name: "Electrician", slug: "electrical", icon: Zap },
  { name: "Plumber", slug: "plumbing", icon: Droplets },
  { name: "Carpenter", slug: "carpentry", icon: Hammer },
  { name: "AC & Appliances", slug: "appliances", icon: Wrench },
];

function CustomerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { data: jobsData, isLoading: jobsLoading } = useJobs({ limit: 50 });
  const { data: disputesData, isLoading: disputesLoading } = useDisputes({ limit: 10 });

  const jobs = (jobsData?.data as JobRecord[]) || [];
  const disputes = (disputesData?.data as any[]) || [];

  const activeJobs = jobs.filter((j) =>
    ["searching", "worker_assigned", "worker_accepted", "on_the_way", "arrived", "work_started", "in_progress"].includes(j.status)
  );
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const primaryActiveJob = activeJobs[0];

  return (
    <RoleDashboardLayout
      allowedRoles={["customer"]}
      portalTitle="Customer Hub"
      badgeLabel="Customer"
    >
      <div className="space-y-6 max-w-5xl">
        {/* Customer Top Bar */}
        <DashboardHeader
          title="Customer Service Hub"
          description="Track ongoing technician dispatches, arrival OTPs, past service receipts, and guarantees."
        >
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/workers")}
              className="text-xs"
            >
              <Search className="h-3.5 w-3.5 mr-1" />
              <span>Find Workers</span>
            </Button>
            <Button
              size="sm"
              onClick={() => router.push("/book")}
              className="text-xs font-semibold bg-[#0456D3] hover:bg-blue-700 text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              <span>Post a Job</span>
            </Button>
          </div>
        </DashboardHeader>

        {/* PRIORITY 1: CURRENT / ACTIVE WORK (Action-Oriented) */}
        {primaryActiveJob ? (
          <div className="p-5 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-blue-100 dark:border-blue-900/40">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Active Service in Progress
                </h3>
                <span className="font-mono text-xs text-slate-500">#{primaryActiveJob.jobNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <CanonicalStatusBadge status={primaryActiveJob.status} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Job summary */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Service Details</span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                  {primaryActiveJob.description}
                </p>
                <p className="text-[11px] text-slate-500">
                  Category: <strong>{primaryActiveJob.categoryId?.name || "General Service"}</strong>
                </p>
              </div>

              {/* Technician Info */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Technician</span>
                {primaryActiveJob.workerId ? (
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900 dark:text-white">{primaryActiveJob.workerId.name}</p>
                    <a
                      href={`tel:${primaryActiveJob.workerId.phone}`}
                      className="inline-flex items-center gap-1 text-[#0456D3] dark:text-blue-400 hover:underline font-medium mt-0.5"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{primaryActiveJob.workerId.phone}</span>
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">Dispatched partner being assigned...</p>
                )}
              </div>

              {/* OTP Display Box */}
              <div className="p-3 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/80 space-y-1 text-center">
                <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 font-semibold uppercase">
                  <KeyRound className="w-3.5 h-3.5 text-[#0456D3]" />
                  <span>Security OTP Code</span>
                </div>
                <div className="font-mono text-xl font-bold tracking-widest text-[#0456D3] dark:text-blue-400">
                  {primaryActiveJob.startOtp || primaryActiveJob.completionOtp || "••••"}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Share this OTP with technician when they arrive on site.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Est. Total: <strong>₹{(primaryActiveJob.finalAmount || primaryActiveJob.estimatedAmount || 299).toLocaleString("en-IN")}</strong>
              </span>
              <Link
                href={`/jobs/${primaryActiveJob._id}`}
                className="inline-flex items-center gap-1 font-semibold text-[#0456D3] dark:text-blue-400 hover:underline"
              >
                <span>View Full Live Dispatch Tracker</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          /* QUICK SERVICE REQUEST STRIP WHEN IDLE */
          <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Need help with home maintenance today?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Book verified local technicians with upfront standard rate cards.
                </p>
              </div>
              <Link
                href="/book"
                className="px-4 py-2 bg-[#0456D3] hover:bg-blue-700 text-white text-xs font-semibold rounded-md transition shrink-0 inline-flex items-center gap-1"
              >
                <span>Post Service Request</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {QUICK_SERVICES.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    key={s.slug}
                    href={`/book?category=${s.slug}`}
                    className="p-2.5 rounded-md border border-slate-200/80 dark:border-slate-800 hover:border-[#0456D3] dark:hover:border-blue-500 text-xs flex items-center gap-2 text-slate-700 dark:text-slate-300 transition group"
                  >
                    <Icon className="w-4 h-4 text-[#0456D3] shrink-0" />
                    <span className="font-medium group-hover:text-[#0456D3] truncate">{s.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* TABS: HISTORY & SUPPORT */}
        <Tabs value={activeTab} onValueChange={(val) => router.push(`/dashboard/customer?tab=${val}`)}>
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md">
            <TabsTrigger value="overview" className="text-xs">
              Overview & Active ({activeJobs.length})
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs">
              All Bookings ({jobs.length})
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs">
              Support & Protection ({disputes.length})
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab Content */}
          <TabsContent value="overview" className="space-y-4 pt-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Recent Service Requests</h3>
                <Link
                  href="/dashboard/customer?tab=bookings"
                  className="text-xs text-[#0456D3] dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View All History</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              {jobsLoading ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-12 rounded bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
                  ))}
                </div>
              ) : jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="You haven't posted any work yet."
                  description="When you need an electrician, plumber, carpenter, or cleaning professional, post your first job request here."
                  actionText="Post Your First Job"
                  onAction={() => router.push("/book")}
                />
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {jobs.slice(0, 6).map((job) => (
                    <div
                      key={job._id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {job.jobNumber}
                          </span>
                          <CanonicalStatusBadge status={job.status} />
                          {job.categoryId && (
                            <span className="text-[11px] text-slate-500">
                              {job.categoryId.name}
                            </span>
                          )}
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 truncate max-w-md">
                          {job.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-left sm:text-right">
                          <p className="font-bold text-slate-900 dark:text-white">
                            ₹{(job.finalAmount || job.estimatedAmount || 0).toLocaleString("en-IN")}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {new Date(job.createdAt).toLocaleDateString("en-IN", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                        <Link
                          href={`/jobs/${job._id}`}
                          className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
                        >
                          Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* All Bookings Tab */}
          <TabsContent value="bookings" className="pt-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
                Complete Service Booking History
              </h3>

              {jobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No bookings recorded"
                  description="Your booking history will appear here once you schedule services."
                  actionText="Book a Technician"
                  onAction={() => router.push("/book")}
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Assigned Worker</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Amount</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                        <th className="py-2.5 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {jobs.map((j) => (
                        <tr key={j._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                            {j.jobNumber}
                          </td>
                          <td className="py-3 px-3 text-slate-700 dark:text-slate-300">
                            {j.categoryId?.name || "General Service"}
                          </td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {j.workerId ? j.workerId.name : "Awaiting Dispatch"}
                          </td>
                          <td className="py-3 px-3">
                            <CanonicalStatusBadge status={j.status} />
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-white">
                            ₹{(j.finalAmount || j.estimatedAmount || 0).toLocaleString("en-IN")}
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {new Date(j.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <Link
                              href={`/jobs/${j._id}`}
                              className="text-[#0456D3] dark:text-blue-400 hover:underline font-medium"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support" className="pt-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  KaamDo Customer Protection & Dispute Desk
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  All services booked on KaamDo are protected by our 7-day free rework guarantee.
                </p>
              </div>

              {disputes.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">No active dispute tickets</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    All your completed bookings are in good standing. If you ever face an issue with a technician or job quality, submit a ticket from the job details page.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {disputes.map((d: any) => (
                    <div key={d._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white">{d.reason || "Service Quality Issue"}</p>
                        <p className="text-slate-500">{d.description}</p>
                      </div>
                      <CanonicalStatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </RoleDashboardLayout>
  );
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function CustomerDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading customer portal...</div>}>
      <CustomerDashboardContent />
    </React.Suspense>
  );
}
