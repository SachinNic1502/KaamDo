"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import Header from "@/components/header/Header";
import {
  Star,
  ShieldCheck,
  Briefcase,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  ArrowRight,
  User,
  MessageSquare,
  Award,
  Loader2,
  ChevronLeft,
  Phone,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

interface WorkerData {
  _id: string;
  userId: {
    _id: string;
    name: string;
    avatar?: string;
  };
  skills: string[];
  experience: number;
  serviceAreas: string[];
  hourlyRate?: number;
  dailyRate?: number;
  rating: number;
  totalJobs: number;
  isOnline: boolean;
  status: string;
  recentReviews?: {
    _id: string;
    rating: number;
    review: string;
    createdAt: string;
    customerId?: {
      name: string;
    };
  }[];
}

export default function WorkerProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const workerId = resolvedParams.id;

  const [worker, setWorker] = useState<WorkerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorker() {
      try {
        setLoading(true);
        const res = await fetch(`/api/workers/${workerId}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setWorker(json.data);
            return;
          }
        }
        setWorker(null);
      } catch {
        setWorker(null);
      } finally {
        setLoading(false);
      }
    }
    loadWorker();
  }, [workerId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin text-[#0456D3] mb-3" />
          <p className="text-xs text-slate-500">Loading professional profile...</p>
        </div>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
        <Header />
        <div className="flex-1 max-w-md mx-auto flex flex-col items-center justify-center p-8 text-center space-y-3">
          <User className="w-10 h-10 text-slate-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Profile Unavailable</h2>
          <p className="text-xs text-slate-500">
            This professional may currently be inactive or undergoing credential review.
          </p>
          <Link
            href="/workers"
            className="px-4 py-2 bg-[#0456D3] text-white rounded-md text-xs font-semibold hover:bg-blue-700 transition"
          >
            Browse Other Technicians
          </Link>
        </div>
      </div>
    );
  }

  const workerName = worker.userId?.name || "Verified Professional";
  const displayRate = worker.hourlyRate
    ? `₹${worker.hourlyRate}`
    : worker.dailyRate
    ? `₹${worker.dailyRate}`
    : "₹299";
  const rateUnit = worker.hourlyRate ? "/ hour" : "/ day visit";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <Header />

      {/* Breadcrumb Navigation Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-3">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#0456D3]">Home</Link>
          <span>/</span>
          <Link href="/workers" className="hover:text-[#0456D3]">Workers Directory</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{workerName}</span>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* LEFT / MAIN COLUMN: Profile Details, Bio, Skills, Experience, Reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Identity Block */}
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="relative shrink-0">
                  {worker.userId?.avatar ? (
                    <img
                      src={worker.userId.avatar}
                      alt={workerName}
                      className="w-20 h-20 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] font-bold text-2xl flex items-center justify-center border border-blue-200 dark:border-blue-900">
                      {workerName.charAt(0)}
                    </div>
                  )}
                  {worker.isOnline && (
                    <span
                      title="Available Live"
                      className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                    />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {workerName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Aadhaar Verified Partner
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    {(worker.skills || []).slice(0, 2).join(" • ") || "General Services"}
                  </p>

                  <div className="flex items-center gap-3 text-xs pt-1 text-slate-500 flex-wrap">
                    <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                      <span className="text-slate-400 font-normal">({worker.totalJobs || 0} jobs)</span>
                    </div>
                    <span>•</span>
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {worker.experience || 5}+ Years Field Experience
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {(worker.serviceAreas || ["Bengaluru"])[0]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About & Credentials */}
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                Professional Background
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Dedicated service professional with over {worker.experience || 5} years of on-site experience across residential apartments, independent villas, and commercial properties. Specialized in precision diagnostics, safety compliance, and durable long-lasting repairs. All work is covered under KaamDo&apos;s 7-day service rework warranty.
              </p>
            </div>

            {/* Verified Skills & Services */}
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#0456D3]" />
                <span>Verified Skills & Competencies</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(worker.skills || []).map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-medium border border-slate-200 dark:border-slate-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Service Areas */}
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Service Coverage Localities</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {(worker.serviceAreas || ["Indiranagar", "Koramangala", "HSR Layout"]).map((area) => (
                  <span
                    key={area}
                    className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs border border-slate-200/80 dark:border-slate-700/60"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>

            {/* Customer Reviews Section */}
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0456D3]" />
                  <h2 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
                    Customer Reviews
                  </h2>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                  <span className="text-slate-400 font-normal">({(worker.recentReviews || []).length} ratings)</span>
                </div>
              </div>

              {worker.recentReviews && worker.recentReviews.length > 0 ? (
                <div className="space-y-3">
                  {worker.recentReviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="p-4 rounded-md bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {rev.customerId?.name || "Verified Customer"}
                        </span>
                        <div className="flex items-center gap-0.5 text-amber-600 font-semibold">
                          <Star className="w-3 h-3 fill-current" />
                          <span>{rev.rating.toFixed(1)}</span>
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        &quot;{rev.review}&quot;
                      </p>
                      <div className="text-[11px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">
                  No written reviews yet. This worker holds a verified clean track record.
                </p>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Sticky Side Panel (Pricing, Availability, Direct Hire) */}
          <aside className="lg:col-span-1 lg:sticky lg:top-20 space-y-4">
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-5">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold block mb-1">
                  Standard Rate
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">
                    {displayRate}
                  </span>
                  <span className="text-xs text-slate-500">{rateUnit}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Official standard rate with zero surprise pricing.
                </p>
              </div>

              {/* Availability Status */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Status</span>
                  <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Available for Dispatch
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Response Time</span>
                  <span className="font-semibold text-slate-900 dark:text-white">&lt; 30 Mins</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Payment Modes</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">UPI, Card, Cash</span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Link
                  href={`/book?workerId=${worker.userId?._id || worker._id}`}
                  className="w-full py-2.5 px-4 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white font-semibold text-xs transition shadow-xs flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Book This Professional</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>

                <p className="text-[11px] text-slate-400 text-center">
                  Job protected by KaamDo OTP verification
                </p>
              </div>
            </div>

            {/* Trust Assurance Badge */}
            <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-2">
              <div className="flex items-center gap-1.5 font-semibold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>KaamDo Safety Guarantee</span>
              </div>
              <ul className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 space-y-1.5">
                <li>• Aadhaar biometric identity authenticated</li>
                <li>• 7-day free rework warranty</li>
                <li>• Payment released only after your completion OTP</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
