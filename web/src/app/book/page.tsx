"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/header/Header";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Check,
  Zap,
} from "lucide-react";
import { getToken } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Subcategory {
  _id: string;
  name: string;
  basePrice: number;
  pricingModel: "fixed" | "hourly" | "visit";
  estimatedDuration?: number;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  subcategories: Subcategory[];
}

function BookingContent() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();

  const preselectedCat = searchParams.get("category");
  const preselectedSub = searchParams.get("sub") || searchParams.get("subcategoryId");
  const preselectedWorker = searchParams.get("workerId");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>(preselectedCat || "");
  const [selectedSubId, setSelectedSubId] = useState<string>(preselectedSub || "");
  const [description, setDescription] = useState<string>("");

  // Address
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("Bengaluru");
  const [state, setState] = useState<string>("Karnataka");
  const [postalCode, setPostalCode] = useState<string>("");

  // Schedule
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM - 12:00 PM");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookedJob, setBookedJob] = useState<{
    _id: string;
    jobNumber: string;
    startOtp?: string;
  } | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/categories?limit=50");
        if (res.ok) {
          const json = await res.json();
          const cats: Category[] = json.data || [];
          setCategories(cats);

          if (!selectedCatId && cats.length > 0) {
            setSelectedCatId(cats[0]._id);
            if (cats[0].subcategories?.length > 0) {
              setSelectedSubId(cats[0].subcategories[0]._id);
            }
          } else if (selectedCatId && !selectedSubId) {
            const found = cats.find((c) => c._id === selectedCatId || c.slug === selectedCatId);
            if (found && found.subcategories?.length > 0) {
              setSelectedCatId(found._id);
              setSelectedSubId(found.subcategories[0]._id);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [selectedCatId, selectedSubId]);

  const activeCategory = categories.find((c) => c._id === selectedCatId || c.slug === selectedCatId);
  const activeSubcategory = activeCategory?.subcategories.find((s) => s._id === selectedSubId);

  const basePrice = activeSubcategory?.basePrice || 299;
  const gstAmount = Math.round(basePrice * 0.18 * 100) / 100;
  const grandTotal = Math.round((basePrice + gstAmount) * 100) / 100;

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to confirm and dispatch your booking.",
        type: "warning",
      });
      router.push(`/login?redirect=/book?category=${selectedCatId}&sub=${selectedSubId}`);
      return;
    }

    if (!selectedCatId || !selectedSubId) {
      const msg = "Please select a valid service and category.";
      setError(msg);
      toast({ title: "Incomplete Selection", description: msg, type: "error" });
      return;
    }

    if (!description.trim() || description.trim().length < 5) {
      const msg = "Please provide a brief description of the job (at least 5 characters).";
      setError(msg);
      toast({ title: "Description Required", description: msg, type: "error" });
      return;
    }

    if (!street.trim() || !postalCode.trim()) {
      const msg = "Please provide your complete address and postal code.";
      setError(msg);
      toast({ title: "Address Required", description: msg, type: "error" });
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          categoryId: selectedCatId,
          subcategoryId: selectedSubId,
          description: description.trim(),
          address: {
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            postalCode: postalCode.trim(),
          },
          scheduledDate: new Date(selectedDate).toISOString(),
          scheduledTime: selectedTimeSlot,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to create booking.");
      }

      setBookedJob(json.data.job);
      toast({
        title: "Booking Confirmed",
        description: `Your job #${json.data.job.jobNumber || json.data.job._id.slice(-6)} has been created!`,
        type: "success",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
      toast({
        title: "Booking Failed",
        description: errorMsg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (bookedJob) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Service Request Broadcasted
            </h2>
            <p className="text-slate-500 text-xs mt-1">
              Your service request is now live in the KaamDo verified partner network.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-md p-4 text-left space-y-2.5">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Job Reference:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">#{bookedJob.jobNumber}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Service:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{activeSubcategory?.name || "Service Dispatch"}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Scheduled Window:</span>
              <span className="font-medium text-slate-900 dark:text-white">{selectedDate} ({selectedTimeSlot})</span>
            </div>

            {bookedJob.startOtp && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 rounded-md text-center">
                <span className="text-[11px] text-[#0456D3] dark:text-blue-300 font-semibold uppercase tracking-wider block">
                  Arrival Start Code (OTP)
                </span>
                <span className="text-2xl font-mono font-bold tracking-widest text-[#0456D3] dark:text-blue-100 mt-0.5 block">
                  {bookedJob.startOtp}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Share this OTP code with the technician only when they arrive at your location.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href={`/jobs/${bookedJob._id}`}
              className="px-4 py-2 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              Track Job Dispatch
            </Link>
            <Link
              href="/dashboard/customer"
              className="px-4 py-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
            >
              Go to Customer Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
          <Link href="/" className="hover:text-[#0456D3]">Home</Link>
          <span>/</span>
          <span className="text-slate-800 dark:text-slate-200 font-medium">Post a Job Request</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Book a Verified Professional
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Specify your trade requirement, choose an arrival window, and confirm standard rate dispatch.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 rounded-md bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Form Details */}
        <div className="lg:col-span-2 space-y-5">
          {/* Step 1: Service Selection */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Select Service & Required Trade
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={selectedCatId}
                  onChange={(e) => {
                    setSelectedCatId(e.target.value);
                    const found = categories.find((c) => c._id === e.target.value || c.slug === e.target.value);
                    if (found && found.subcategories?.length > 0) {
                      setSelectedSubId(found.subcategories[0]._id);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                >
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Specific Work
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                >
                  {(activeCategory?.subcategories || []).map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} (₹{s.basePrice})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description of the Issue
              </label>
              <textarea
                rows={3}
                placeholder="Describe what needs to be fixed (e.g. Master bedroom switchboard spark, or water leakage under kitchen sink)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-[#0456D3]"
              />
            </div>
          </div>

          {/* Step 2: Schedule & Arrival Window */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Appointment Schedule
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service Date
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Arrival Window
                </label>
                <select
                  value={selectedTimeSlot}
                  onChange={(e) => setSelectedTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                >
                  <option value="09:00 AM - 11:00 AM">Morning (09:00 AM - 11:00 AM)</option>
                  <option value="11:00 AM - 01:00 PM">Mid-Day (11:00 AM - 01:00 PM)</option>
                  <option value="02:00 PM - 04:00 PM">Afternoon (02:00 PM - 04:00 PM)</option>
                  <option value="04:00 PM - 06:00 PM">Evening (04:00 PM - 06:00 PM)</option>
                  <option value="06:00 PM - 08:00 PM">Late Evening (06:00 PM - 08:00 PM)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Service Address */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="w-6 h-6 rounded bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Service Address
              </h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Street Address / Flat / Building
                </label>
                <input
                  type="text"
                  placeholder="e.g. Flat 302, Palm Heights, 12th Main Road"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 560034"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#0456D3]"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Breakdown & Submit */}
        <aside className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider pb-2 border-b border-slate-100 dark:border-slate-800">
              Estimated Pricing
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Service:</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[160px]">
                  {activeSubcategory?.name || "Service Booking"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Pricing Model:</span>
                <span className="text-slate-700 dark:text-slate-300 capitalize">
                  {activeSubcategory?.pricingModel || "Standard"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Base Fare:</span>
                <span className="font-medium text-slate-900 dark:text-white">₹{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">GST (18%):</span>
                <span className="font-medium text-slate-900 dark:text-white">₹{gstAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
              <span className="text-xs font-bold text-slate-900 dark:text-white">Total Estimate:</span>
              <span className="text-xl font-bold text-slate-900 dark:text-white">₹{grandTotal.toFixed(2)}</span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              Payment is held securely in escrow and released only after your completion OTP.
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Broadcasting Request...</span>
                </>
              ) : (
                <>
                  <span>Publish Job Request</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Guarantee Note */}
          <div className="p-4 rounded-lg bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40 text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>KaamDo Rework Guarantee</span>
            </div>
            <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
              Includes 7-day free rework support and direct police-verified technician dispatch.
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

export default function BookServicePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-[#0456D3]" />
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </div>
  );
}
