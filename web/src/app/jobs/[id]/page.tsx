"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { CanonicalStatusBadge } from "@/components/dashboard/dashboard-components";
import {
  Briefcase,
  ArrowLeft,
  Calendar,
  Clock,
  Phone,
  User,
  Shield,
  FileText,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ExternalLink,
  Download,
  DollarSign,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface JobDetail {
  _id: string;
  jobNumber: string;
  description: string;
  status: string;
  category?: string;
  categoryId?: {
    name: string;
    slug: string;
  };
  customerId?: {
    _id: string;
    name: string;
    phone: string;
  };
  workerId?: {
    _id: string;
    name: string;
    phone: string;
  };
  estimatedAmount?: number;
  finalAmount?: number;
  materialCharges?: number;
  startOtp?: string;
  completionOtp?: string;
  createdAt: string;
  updatedAt: string;
  location?: {
    address?: string;
    city?: string;
  };
}

const LIFECYCLE_STEPS = [
  { key: "searching", label: "Requested", desc: "Finding technician" },
  { key: "worker_assigned", label: "Assigned", desc: "Technician assigned" },
  { key: "on_the_way", label: "On The Way", desc: "En route to site" },
  { key: "arrived", label: "Arrived", desc: "Technician at location" },
  { key: "work_started", label: "In Progress", desc: "Work underway" },
  { key: "completed", label: "Completed", desc: "Work verified & paid" },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [job, setJob] = React.useState<JobDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [currentUserRole, setCurrentUserRole] = React.useState<string>("");

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    // Fetch active auth user role
    api.get<ApiResponse<{ role: string }>>("/api/auth", token).then((res) => {
      if (res.data?.role) setCurrentUserRole(res.data.role);
    });

    // Fetch Job details
    api
      .get<ApiResponse<JobDetail>>(`/api/jobs?jobId=${id}`, token)
      .then((res) => {
        if (res.data) setJob(res.data);
        else setError("Job record not found.");
      })
      .catch((err) => {
        setError(err.message || "Failed to load job details.");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const currentStepIndex = React.useMemo(() => {
    if (!job) return 0;
    const idx = LIFECYCLE_STEPS.findIndex((s) => s.key === job.status);
    if (idx !== -1) return idx;
    if (job.status === "worker_accepted") return 1;
    return 0;
  }, [job]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="space-y-2 text-center max-w-sm">
          <div className="w-10 h-10 rounded-md bg-[#0456D3] text-white font-bold flex items-center justify-center mx-auto animate-pulse">
            KD
          </div>
          <p className="text-xs text-slate-500 font-medium">Loading dispatch record...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 flex items-center justify-center">
        <div className="max-w-md w-full p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Job Record Unavailable</h2>
            <p className="text-xs text-slate-500">{error || "Unable to retrieve job."}</p>
          </div>
          <Button onClick={() => router.back()} size="sm" variant="outline" className="text-xs">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      {/* Sticky Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="text-slate-500 hover:text-slate-900 h-8 w-8"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                #{job.jobNumber}
              </span>
              <CanonicalStatusBadge status={job.status} />
            </div>
            <p className="text-[11px] text-slate-500">
              Created {new Date(job.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {job.status === "completed" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(`/api/jobs/${job._id}/invoice`, "_blank")}
              className="text-xs font-semibold gap-1.5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Tax Invoice</span>
            </Button>
          )}
          <Button
            size="sm"
            onClick={() =>
              router.push(
                currentUserRole === "admin"
                  ? "/admin/jobs"
                  : currentUserRole === "worker"
                  ? "/dashboard/worker"
                  : "/dashboard/customer"
              )
            }
            className="text-xs font-semibold bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800"
          >
            Dashboard
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6 flex-1 w-full">
        {/* SECTION 23: STATUS TIMELINE */}
        <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Service Progress
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {LIFECYCLE_STEPS.map((step, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-md border text-center transition ${
                    isCurrent
                      ? "bg-blue-50 dark:bg-blue-950/60 border-[#0456D3] text-[#0456D3] dark:text-blue-300 font-semibold"
                      : isPast
                      ? "bg-emerald-50/50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      : "bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 text-slate-400"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <span className="w-3.5 h-3.5 rounded-full border border-current text-[9px] font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-xs truncate">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECURITY OTP STRIP (If customer & in flight) */}
        {job.status !== "completed" && job.status !== "cancelled" && (
          <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
                <KeyRound className="w-4 h-4 text-[#0456D3]" />
                <span>On-Site Security Verification Codes</span>
              </div>
              <p className="text-xs text-slate-500">
                Share these verification codes with your technician only at the specified step.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {job.startOtp && (
                <div className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Start OTP</span>
                  <span className="font-mono text-base font-bold text-[#0456D3] dark:text-blue-400 tracking-wider">
                    {job.startOtp}
                  </span>
                </div>
              )}
              {job.completionOtp && (
                <div className="px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completion OTP</span>
                  <span className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 tracking-wider">
                    {job.completionOtp}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TWO-COLUMN DETAILS & BILLING */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* Main Details (2 cols) */}
          <div className="md:col-span-2 space-y-4">
            {/* Service & Scope */}
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Service Request Scope
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  {job.categoryId?.name || "General Service"}
                </span>
              </div>

              <div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {job.description}
                </p>
              </div>

              {job.location && (
                <div className="flex items-start gap-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    {job.location.address || "Customer Premise"}{" "}
                    {job.location.city ? `(${job.location.city})` : ""}
                  </span>
                </div>
              )}
            </div>

            {/* Stakeholders Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Customer Info */}
              <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Customer
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {job.customerId?.name || "Customer"}
                </p>
                {job.customerId?.phone && (
                  <a
                    href={`tel:${job.customerId.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0456D3] hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{job.customerId.phone}</span>
                  </a>
                )}
              </div>

              {/* Worker Info */}
              <div className="p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold block">
                  Assigned Professional
                </span>
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  {job.workerId?.name || "Technician Awaiting Dispatch"}
                </p>
                {job.workerId?.phone ? (
                  <a
                    href={`tel:${job.workerId.phone}`}
                    className="inline-flex items-center gap-1 text-xs text-[#0456D3] hover:underline"
                  >
                    <Phone className="w-3 h-3" />
                    <span>{job.workerId.phone}</span>
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 italic">Dispatched nearby</span>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Billing & Actions (1 col) */}
          <aside className="space-y-4">
            <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block pb-2 border-b border-slate-100 dark:border-slate-800">
                Payment Summary
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Base Fare:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    ₹{(job.estimatedAmount || 299).toLocaleString("en-IN")}
                  </span>
                </div>
                {job.materialCharges ? (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Materials / Parts:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{job.materialCharges.toLocaleString("en-IN")}
                    </span>
                  </div>
                ) : null}
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <span className="text-xs font-bold text-slate-900 dark:text-white">Final Total:</span>
                <span className="text-xl font-bold text-[#0456D3] dark:text-blue-400">
                  ₹{(job.finalAmount || job.estimatedAmount || 299).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => router.push("/dashboard/customer?tab=support")}
                >
                  <AlertCircle className="w-3.5 h-3.5 mr-1" />
                  <span>Report Dispute or Quality Issue</span>
                </Button>
              </div>
            </div>

            {/* Rework Guarantee */}
            <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>KaamDo Assured</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                7-day rework guarantee on this service booking.
              </p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
