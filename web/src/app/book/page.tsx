"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
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
  Copy,
  Zap,
} from "lucide-react";
import { getToken } from "@/lib/api-client";
import { useToast } from "@/components/ui/toast";

interface Subcategory {
  _id: string;
  name: string;
  slug?: string;
  basePrice: number;
  pricingModel: "fixed" | "hourly" | "visit" | "daily" | "quotation";
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
  const preselectedSub =
    searchParams.get("sub") ||
    searchParams.get("subcategoryId") ||
    searchParams.get("service");

  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCatId, setSelectedCatId] = useState<string>("");
  const [selectedSubId, setSelectedSubId] = useState<string>("");
  const [description, setDescription] = useState<string>("");

  // Address
  const [street, setStreet] = useState<string>("");
  const [city, setCity] = useState<string>("Bengaluru");
  const [state, setState] = useState<string>("Karnataka");
  const [postalCode, setPostalCode] = useState<string>("");

  // Schedule
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    return tomorrow.toISOString().split("T")[0];
  });
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("10:00 AM - 12:00 PM");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [bookedJob, setBookedJob] = useState<{
    _id: string;
    jobNumber: string;
    startOtp?: string;
  } | null>(null);

  // Load available categories and synchronize with URL search parameters
  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        setLoading(true);
        const res = await fetch("/api/categories?limit=50");
        if (!res.ok) throw new Error("Failed to load trade categories");

        const json = await res.json();
        const cats: Category[] = json.data || [];
        if (!active) return;

        setCategories(cats);

        if (cats.length > 0) {
          // Resolve preselected category by ID, slug, or case-insensitive name
          let matchedCat = cats[0];
          if (preselectedCat) {
            const found = cats.find(
              (c) =>
                c._id === preselectedCat ||
                c.slug === preselectedCat ||
                c.name.toLowerCase() === preselectedCat.toLowerCase()
            );
            if (found) matchedCat = found;
          }

          setSelectedCatId(matchedCat._id);

          // Resolve preselected subcategory
          if (matchedCat.subcategories && matchedCat.subcategories.length > 0) {
            let matchedSub = matchedCat.subcategories[0];
            if (preselectedSub) {
              const foundSub = matchedCat.subcategories.find(
                (s) =>
                  s._id === preselectedSub ||
                  s.slug === preselectedSub ||
                  s.name.toLowerCase() === preselectedSub.toLowerCase()
              );
              if (foundSub) matchedSub = foundSub;
            }
            setSelectedSubId(matchedSub._id || matchedSub.slug || matchedSub.name);
          } else {
            setSelectedSubId("");
          }
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
        if (active) setError("Could not load service categories. Please refresh the page.");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [preselectedCat, preselectedSub]);

  // Active Category & Subcategory references
  const activeCategory = useMemo(() => {
    return categories.find((c) => c._id === selectedCatId || c.slug === selectedCatId);
  }, [categories, selectedCatId]);

  const activeSubcategory = useMemo(() => {
    return activeCategory?.subcategories.find(
      (s) => s._id === selectedSubId || s.slug === selectedSubId || s.name === selectedSubId
    );
  }, [activeCategory, selectedSubId]);

  const basePrice = activeSubcategory?.basePrice || 299;
  const gstAmount = Math.round(basePrice * 0.18 * 100) / 100;
  const grandTotal = Math.round((basePrice + gstAmount) * 100) / 100;

  const handleCopyOtp = (otp: string) => {
    navigator.clipboard.writeText(otp);
    setCopiedOtp(true);
    toast({
      title: "OTP Copied",
      description: "Arrival Start Code copied to clipboard.",
      type: "success",
    });
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const token = getToken();
    if (!token) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to publish and dispatch your job request.",
        type: "warning",
      });
      const redirectPath = encodeURIComponent(
        `/book?category=${selectedCatId}&sub=${selectedSubId}`
      );
      router.push(`/login?redirect=${redirectPath}`);
      return;
    }

    if (!selectedCatId || !selectedSubId) {
      const msg = "Please select both a trade category and specific service.";
      setError(msg);
      toast({ title: "Incomplete Selection", description: msg, type: "error" });
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      const msg = "Please describe the job requirement in detail (at least 10 characters).";
      setError(msg);
      toast({ title: "Description Required", description: msg, type: "error" });
      return;
    }

    if (!street.trim() || street.trim().length < 5) {
      const msg = "Please enter a complete street address, building or flat (at least 5 characters).";
      setError(msg);
      toast({ title: "Address Required", description: msg, type: "error" });
      return;
    }

    if (!postalCode.trim() || !/^\d{6}$/.test(postalCode.trim())) {
      const msg = "Please enter a valid 6-digit Indian PIN code (e.g. 560034).";
      setError(msg);
      toast({ title: "Valid PIN Code Required", description: msg, type: "error" });
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
          categoryId: activeCategory?._id || selectedCatId,
          subcategoryId: activeSubcategory?._id || selectedSubId,
          description: description.trim(),
          address: {
            label: "Home",
            address: street.trim(),
            street: street.trim(),
            city: city.trim(),
            state: state.trim(),
            pincode: postalCode.trim(),
            postalCode: postalCode.trim(),
          },
          scheduledDate: new Date(selectedDate).toISOString(),
          scheduledTime: selectedTimeSlot,
          pricingModel: activeSubcategory?.pricingModel || "fixed",
          estimatedPrice: basePrice,
        }),
      });

      const json = await res.json();

      if (res.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please sign in again to publish your job request.",
          type: "warning",
        });
        const redirectPath = encodeURIComponent(
          `/book?category=${selectedCatId}&sub=${selectedSubId}`
        );
        router.push(`/login?redirect=${redirectPath}`);
        return;
      }

      if (!res.ok) {
        throw new Error(json.message || "Failed to create booking.");
      }

      const createdJob = json.data?.job || json.data;
      setBookedJob(createdJob);
      toast({
        title: "Job Request Published!",
        description: `Your job #${createdJob.jobNumber || createdJob._id.slice(-6)} has been broadcasted to verified professionals.`,
        type: "success",
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Something went wrong while broadcasting your request.";
      setError(errorMsg);
      toast({
        title: "Publishing Failed",
        description: errorMsg,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS CONFIRMATION VIEW
  if (bookedJob) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
        <div className="bg-card border border-border rounded-2xl p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-sm animate-bounce">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              Request Live in Network
            </span>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Service Request Broadcasted
            </h2>
            <p className="text-muted-foreground text-xs max-w-md mx-auto">
              Your service request is now live. Nearby verified technicians are being dispatched to fulfill your booking.
            </p>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-5 text-left space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Job Reference:</span>
              <span className="font-mono font-bold text-foreground">
                #{bookedJob.jobNumber || bookedJob._id}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Trade & Service:</span>
              <span className="font-semibold text-foreground">
                {activeSubcategory?.name || "Service Dispatch"} ({activeCategory?.name || "Trade"})
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Scheduled Window:</span>
              <span className="font-medium text-foreground">
                {selectedDate} • {selectedTimeSlot}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-muted-foreground">Destination:</span>
              <span className="font-medium text-foreground truncate max-w-[220px]">
                {street}, {city} - {postalCode}
              </span>
            </div>

            {bookedJob.startOtp && (
              <div className="mt-4 p-4 bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-primary font-bold uppercase tracking-wider block">
                  Arrival Start Code (OTP)
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-black tracking-widest text-primary">
                    {bookedJob.startOtp}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyOtp(bookedJob.startOtp!)}
                    className="p-1.5 rounded-lg border border-primary/30 hover:bg-primary/15 text-primary transition cursor-pointer"
                    title="Copy Start OTP"
                  >
                    {copiedOtp ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground pt-1">
                  Share this OTP with the technician only after they arrive at your location.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              href={`/jobs/${bookedJob._id}`}
              className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition flex items-center justify-center gap-2"
            >
              <span>Track Job Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/dashboard/customer"
              className="px-5 py-2.5 rounded-xl border border-border bg-card hover:bg-muted text-foreground text-xs font-semibold transition flex items-center justify-center"
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
      <div className="mb-6 space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
          <Link href="/" className="hover:text-primary transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground font-semibold">Post a Job Request</span>
        </div>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Book a Verified Professional
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Specify your trade requirement, choose an arrival window, and dispatch standard-rate technicians.
            </p>
          </div>
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>Escrow Protected & Police Verified</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-destructive text-xs font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground">Loading service categories & verified rates…</p>
        </div>
      ) : (
        <form onSubmit={handleBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Left Column: Form Details */}
          <div className="lg:col-span-2 space-y-5">
            {/* Step 1: Service Selection */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Select Service & Required Trade
                  </h2>
                  <p className="text-[11px] text-muted-foreground">Choose the trade category and specific task required.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Trade Category
                  </label>
                  <select
                    value={selectedCatId}
                    onChange={(e) => {
                      const newCatId = e.target.value;
                      setSelectedCatId(newCatId);
                      const found = categories.find((c) => c._id === newCatId);
                      if (found && found.subcategories?.length > 0) {
                        setSelectedSubId(found.subcategories[0]._id || found.subcategories[0].slug || found.subcategories[0].name);
                      } else {
                        setSelectedSubId("");
                      }
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  >
                    {categories.map((c, cIdx) => (
                      <option key={c._id || `cat-${cIdx}`} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Specific Task / Work
                  </label>
                  <select
                    value={selectedSubId}
                    onChange={(e) => setSelectedSubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  >
                    {(activeCategory?.subcategories || []).map((s, sIdx) => {
                      const val = s._id || s.slug || s.name;
                      return (
                        <option key={val || `sub-${sIdx}`} value={val}>
                          {s.name} (₹{s.basePrice || 299})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Job Description & Specific Problem
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe what needs repair or installation (e.g. Master bedroom switchboard spark, or water leakage under kitchen sink)..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                />
                <span className="text-[10px] text-muted-foreground">
                  Minimum 10 characters. Clear details ensure the technician arrives with proper tools.
                </span>
              </div>
            </div>

            {/* Step 2: Schedule & Arrival Window */}
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Appointment Schedule
                  </h2>
                  <p className="text-[11px] text-muted-foreground">Select your preferred date and arrival window.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Service Date</span>
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Preferred Arrival Window</span>
                  </label>
                  <select
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
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
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center gap-2.5 pb-3 border-b border-border">
                <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <div>
                  <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Service Address
                  </h2>
                  <p className="text-[11px] text-muted-foreground">Location where the service will be performed.</p>
                </div>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>Street Address / Flat / Building</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Oakwood Residency, 18th Cross, Koramangala"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      PIN Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="e.g. 560034"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.replace(/\D/g, ""))}
                      required
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Pricing Breakdown & Submit */}
          <aside className="lg:col-span-1 space-y-4">
            <div className="bg-card border border-border rounded-xl p-5 space-y-4 shadow-xs">
              <h3 className="text-xs font-bold text-foreground uppercase tracking-wider pb-2.5 border-b border-border">
                Estimated Pricing
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Trade Category:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {activeCategory?.name || "Trade"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Service Task:</span>
                  <span className="font-semibold text-foreground truncate max-w-[150px]">
                    {activeSubcategory?.name || "Task"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pricing Model:</span>
                  <span className="text-foreground capitalize font-medium">
                    {activeSubcategory?.pricingModel || "Fixed"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Base Rate:</span>
                  <span className="font-medium text-foreground">₹{basePrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">GST (18%):</span>
                  <span className="font-medium text-foreground">₹{gstAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-baseline">
                <span className="text-xs font-bold text-foreground">Estimated Total:</span>
                <span className="text-2xl font-black text-foreground">₹{grandTotal.toFixed(2)}</span>
              </div>

              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Funds are held securely in Escrow. Payment is released only after you provide the completion verification code.
              </p>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Broadcasting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Publish Job Request</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Guarantee Note */}
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-700 dark:text-emerald-300 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>KaamDo Rework Guarantee</span>
              </div>
              <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80 leading-relaxed">
                Includes 7-day free rework support, Aadhaar-verified technicians, and 24/7 emergency customer care.
              </p>
            </div>
          </aside>
        </form>
      )}
    </div>
  );
}

export default function BookServicePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Header />
      <Suspense
        fallback={
          <div className="flex-1 flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <BookingContent />
      </Suspense>
    </div>
  );
}
