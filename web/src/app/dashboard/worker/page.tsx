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
import { useJobs, useAttendance, useUpdateJob } from "@/hooks/use-api";
import {
  Briefcase,
  Clock,
  CheckCircle2,
  Wallet,
  MapPin,
  Star,
  Play,
  KeyRound,
  Calendar,
  AlertCircle,
  Phone,
  ArrowRight,
  ShieldCheck,
  Check,
  Power,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

function WorkerDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { data: jobsData, isLoading: jobsLoading, refetch: refetchJobs } = useJobs({ limit: 50 });
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({ limit: 20 });
  const updateJobMutation = useUpdateJob();

  // Presence / Availability State
  const [isOnline, setIsOnline] = React.useState(true);

  // OTP Modal State
  const [selectedJob, setSelectedJob] = React.useState<any | null>(null);
  const [otpType, setOtpType] = React.useState<"start" | "complete">("start");
  const [otpCode, setOtpCode] = React.useState("");
  const [actionLoading, setActionLoading] = React.useState(false);
  const [actionError, setActionError] = React.useState("");

  const jobs = (jobsData?.data as any[]) || [];
  const attendance = (attendanceData?.data as any[]) || [];

  const assignedJobs = jobs.filter((j) =>
    ["worker_assigned", "worker_accepted", "on_the_way", "arrived"].includes(j.status)
  );
  const inProgressJobs = jobs.filter((j) => ["work_started", "in_progress"].includes(j.status));
  const completedJobs = jobs.filter((j) => j.status === "completed");

  const totalEarnings = completedJobs.reduce(
    (sum, j) => sum + (j.workerEarnings || (j.finalAmount ? j.finalAmount * 0.85 : 299 * 0.85)),
    0
  );

  async function handleVerifyOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedJob || !otpCode.trim()) return;

    setActionLoading(true);
    setActionError("");

    try {
      if (otpType === "start") {
        await updateJobMutation.mutateAsync({
          jobId: selectedJob._id,
          status: "work_started",
          startOtp: otpCode.trim(),
        });
      } else {
        await updateJobMutation.mutateAsync({
          jobId: selectedJob._id,
          status: "completed",
          completionOtp: otpCode.trim(),
        });
      }
      setSelectedJob(null);
      setOtpCode("");
      refetchJobs();
    } catch (err: any) {
      setActionError(err.message || "Invalid OTP code entered. Please verify with the customer.");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleUpdateStatus(jobId: string, nextStatus: string) {
    try {
      await updateJobMutation.mutateAsync({
        jobId,
        status: nextStatus,
      });
      refetchJobs();
    } catch (err: any) {
      alert(err.message || "Failed to update job status.");
    }
  }

  return (
    <RoleDashboardLayout
      allowedRoles={["worker"]}
      portalTitle="Partner Cockpit"
      badgeLabel="Worker"
    >
      <div className="space-y-6 max-w-5xl">
        {/* ACTION-ORIENTED WORKER HEADER WITH ONLINE/OFFLINE TOGGLE */}
        <div className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Partner Cockpit</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage incoming customer requests, customer OTP verifications, and weekly earnings.
            </p>
          </div>

          {/* ONLINE / OFFLINE TOGGLE */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition ${
                isOnline
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                  : "bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                }`}
              />
              <span>{isOnline ? "Duty: Online (Receiving Jobs)" : "Duty: Offline"}</span>
            </button>
          </div>
        </div>

        {/* WORKER PERFORMANCE & EARNINGS STRIP (Clean, Actionable) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Assigned Leads</span>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{assignedJobs.length}</p>
            <p className="text-[11px] text-slate-500">Require arrival or start</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Active On-Site</span>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{inProgressJobs.length}</p>
            <p className="text-[11px] text-slate-500">In-progress repairs</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Completed Jobs</span>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{completedJobs.length}</p>
            <p className="text-[11px] text-slate-500">Successful completions</p>
          </div>

          <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Settled Earnings</span>
            <p className="text-2xl font-bold text-[#0456D3] dark:text-blue-400 mt-1">
              ₹{Math.round(totalEarnings).toLocaleString("en-IN")}
            </p>
            <p className="text-[11px] text-slate-500">Payouts every Tuesday</p>
          </div>
        </div>

        {/* PRIORITY 2 & 3: ACTIVE JOBS & ARRIVAL OTP QUEUE */}
        <div className="space-y-4">
          {/* Active In-Progress Jobs (Require Completion OTP) */}
          {inProgressJobs.map((job) => (
            <div
              key={job._id}
              className="p-5 rounded-lg border border-amber-300 dark:border-amber-800/80 bg-amber-50/40 dark:bg-amber-950/20 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      Work In Progress On Site
                    </span>
                    <span className="font-mono text-xs text-slate-500">#{job.jobNumber}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {job.description}
                  </h3>
                </div>

                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setOtpType("complete");
                    setOtpCode("");
                    setActionError("");
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md transition flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Enter Completion OTP</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-amber-200/60 dark:border-amber-900/40">
                <span className="flex items-center gap-1">
                  Customer: <strong>{job.customerId?.name || "Customer"}</strong>
                  {job.customerId?.phone && (
                    <a href={`tel:${job.customerId.phone}`} className="text-[#0456D3] ml-1 hover:underline">
                      ({job.customerId.phone})
                    </a>
                  )}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Wage: ₹{(job.estimatedAmount || 299).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}

          {/* Assigned Leads Awaiting Transit or Start OTP */}
          {assignedJobs.map((job) => (
            <div
              key={job._id}
              className="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                      #{job.jobNumber}
                    </span>
                    <CanonicalStatusBadge status={job.status} />
                    {job.categoryId && (
                      <span className="text-[11px] text-slate-500 font-medium">
                        {job.categoryId.name}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    {job.description}
                  </h3>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {job.status === "worker_assigned" && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, "worker_accepted")}
                      className="px-3.5 py-1.5 bg-[#0456D3] text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition"
                    >
                      Accept Lead
                    </button>
                  )}

                  {job.status === "worker_accepted" && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, "on_the_way")}
                      className="px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition flex items-center gap-1"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Start Transit</span>
                    </button>
                  )}

                  {job.status === "on_the_way" && (
                    <button
                      onClick={() => handleUpdateStatus(job._id, "arrived")}
                      className="px-3.5 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-md hover:bg-emerald-700 transition flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Mark Arrived</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setOtpType("start");
                      setOtpCode("");
                      setActionError("");
                    }}
                    className="px-3.5 py-1.5 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-md transition flex items-center gap-1"
                  >
                    <Play className="w-3.5 h-3.5 text-[#0456D3]" />
                    <span>Verify Start OTP</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>Customer: {job.customerId?.name || "Customer"}</span>
                  {job.customerId?.phone && (
                    <a href={`tel:${job.customerId.phone}`} className="text-[#0456D3] ml-1 hover:underline">
                      ({job.customerId.phone})
                    </a>
                  )}
                </span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  Wage: ₹{(job.estimatedAmount || 299).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}

          {assignedJobs.length === 0 && inProgressJobs.length === 0 && (
            <div className="p-8 text-center rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-xs text-slate-900 dark:text-white">
                No active jobs in your queue
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Keep your status set to &quot;Online&quot; to receive instant notification alerts when a customer books a service in your area.
              </p>
            </div>
          )}
        </div>

        {/* TABS: HISTORY & ATTENDANCE */}
        <Tabs value={activeTab} onValueChange={(val) => router.push(`/dashboard/worker?tab=${val}`)}>
          <TabsList className="bg-slate-100 dark:bg-slate-800/80 p-1 rounded-md">
            <TabsTrigger value="overview" className="text-xs">
              Live Queue ({assignedJobs.length + inProgressJobs.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" className="text-xs">
              Job History ({completedJobs.length})
            </TabsTrigger>
            <TabsTrigger value="attendance" className="text-xs">
              GPS Attendance ({attendance.length})
            </TabsTrigger>
          </TabsList>

          {/* History Tab */}
          <TabsContent value="jobs" className="pt-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-4">
                Completed Job History & Earnings
              </h3>

              {completedJobs.length === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="No completed jobs yet"
                  description="Completed assignments and customer ratings will be archived here."
                />
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="py-2.5 px-3">Job ID</th>
                        <th className="py-2.5 px-3">Service</th>
                        <th className="py-2.5 px-3">Customer</th>
                        <th className="py-2.5 px-3">Status</th>
                        <th className="py-2.5 px-3 text-right">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {completedJobs.map((j) => (
                        <tr key={j._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                          <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-white">
                            {j.jobNumber}
                          </td>
                          <td className="py-3 px-3">{j.categoryId?.name || "Service"}</td>
                          <td className="py-3 px-3 text-slate-600 dark:text-slate-400">
                            {j.customerId?.name || "Customer"}
                          </td>
                          <td className="py-3 px-3">
                            <CanonicalStatusBadge status={j.status} />
                          </td>
                          <td className="py-3 px-3 text-right text-slate-400">
                            {new Date(j.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="pt-3">
            <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Daily Wage GPS Check-Ins
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified biometric and GPS check-ins for commercial site shifts.
                </p>
              </div>

              {attendance.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-md space-y-2">
                  <Calendar className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="font-semibold text-xs text-slate-900 dark:text-white">No attendance records</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    When you punch in at an authorized construction or contractor job site, attendance verification logs will show here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {attendance.map((att: any) => (
                    <div key={att._id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {new Date(att.date).toLocaleDateString("en-IN", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        <p className="text-slate-500">{att.notes || "Regular field duty"}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <CanonicalStatusBadge status={att.status} />
                        {att.approvedWage && (
                          <span className="font-bold text-slate-900 dark:text-white">
                            ₹{att.approvedWage.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* OTP VERIFICATION DIALOG */}
        <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
          <DialogContent className="max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
            <DialogHeader>
              <DialogTitle className="text-base font-bold text-slate-900 dark:text-white">
                {otpType === "start" ? "Verify Job Start OTP" : "Verify Job Completion OTP"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                Ask the customer at the job site to provide their 4-digit verification code.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleVerifyOtpSubmit} className="space-y-4 pt-2">
              <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800/60 text-xs space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white">
                  Job #{selectedJob?.jobNumber}
                </p>
                <p className="text-slate-500 truncate">{selectedJob?.description}</p>
                <p className="text-slate-500">
                  Customer: {selectedJob?.customerId?.name} ({selectedJob?.customerId?.phone})
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                  Customer {otpType === "start" ? "Start" : "Completion"} OTP (4 Digits)
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 1234"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="font-mono text-center tracking-widest text-xl font-bold rounded-md"
                  autoFocus
                />
              </div>

              {actionError && (
                <div className="p-2.5 rounded-md bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedJob(null)}
                  disabled={actionLoading}
                  className="text-xs rounded-md"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={actionLoading || !otpCode.trim()}
                  className="text-xs font-semibold bg-[#0456D3] hover:bg-blue-700 text-white rounded-md"
                >
                  {actionLoading ? "Verifying..." : "Confirm & Proceed"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </RoleDashboardLayout>
  );
}

export default function WorkerDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading worker portal...</div>}>
      <WorkerDashboardContent />
    </React.Suspense>
  );
}
