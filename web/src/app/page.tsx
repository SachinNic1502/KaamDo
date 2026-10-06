"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header/Header";
import {
  Search,
  MapPin,
  ShieldCheck,
  Star,
  CheckCircle2,
  Clock,
  ArrowRight,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wrench,
  Sparkles,
  HardHat,
  ChevronRight,
  PhoneCall,
  BadgePercent,
  CalendarCheck,
  Award,
  Smartphone,
  Download,
  Check,
  X,
  HelpCircle,
  ChevronDown,
  Building2,
  Home as HomeIcon,
  Users,
  Shield,
  Layers,
  ArrowUpRight,
  Sparkle,
  Briefcase,
  Loader2,
} from "lucide-react";

// Top Metro & Tier 1 Cities
const POPULAR_CITIES = [
  "Bengaluru",
  "Delhi NCR",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

export interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  pricingModel?: "fixed" | "hourly" | "visit";
  estimatedDuration?: number;
  isActive?: boolean;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories?: Subcategory[];
  isActive?: boolean;
}

export interface WorkerRecord {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    avatar?: string;
    phone?: string;
  };
  skills: string[];
  experience: number;
  serviceAreas?: string[];
  hourlyRate?: number;
  dailyRate?: number;
  status: string;
  isOnline: boolean;
  rating: number;
  totalJobs: number;
}

// Icon mapper for dynamic categories
const CATEGORY_ICON_MAP: Record<string, any> = {
  electrician: Zap,
  electrical: Zap,
  plumbing: Droplets,
  plumber: Droplets,
  carpentry: Hammer,
  carpenter: Hammer,
  "ac-repair": Wrench,
  "ac-and-appliance-repair": Wrench,
  appliances: Wrench,
  ac: Wrench,
  painting: Paintbrush,
  "painting-and-waterproofing": Paintbrush,
  painter: Paintbrush,
  cleaning: Sparkles,
  "cleaning-and-pest-control": Sparkles,
  construction: HardHat,
  labour: HardHat,
  handyman: Layers,
};

function getCategoryIcon(slug?: string, name?: string) {
  const normalizedSlug = slug?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "";
  const normalizedName = name?.toLowerCase().replace(/[^a-z0-9]/g, "-") || "";
  return CATEGORY_ICON_MAP[normalizedSlug] || CATEGORY_ICON_MAP[normalizedName] || Layers;
}

const TRUST_METRICS = [
  { label: "Verified Professionals", value: "24,000+" },
  { label: "Completed Service Requests", value: "85,000+" },
  { label: "Average Response Time", value: "< 25 Mins" },
  { label: "Customer Satisfaction", value: "4.86 / 5.0" },
];

// Target Audience Use Cases
const USE_CASES = [
  {
    title: "Homeowners & Families",
    icon: HomeIcon,
    tagline: "Zero safety compromises for your family",
    description: "Every technician entering your home is biometric Aadhaar verified with judicial background clearance. Receive arrival and completion OTPs with digital ID photo verification.",
    highlights: ["Photo ID check at doorstep", "Itemized parts billing approval", "Clean work area post completion"],
  },
  {
    title: "Tenants & Flat Renters",
    icon: Users,
    tagline: "Fast move-in and hand-over fixes",
    description: "Hang curtains, mount TVs, repair faulty switchboards, or fix bathroom fittings quickly with standardized hourly or fixed rates. No arbitrary roadside bargaining.",
    highlights: ["Same-day emergency arrival", "Digital receipt for landlord claims", "Transparent rate cards"],
  },
  {
    title: "Gated Societies & RWAs",
    icon: Building2,
    tagline: "Audited workforce for society gates",
    description: "Security gate-friendly records. Guards can verify job OTP and technician credentials directly through the app, ensuring peace of mind for the entire residential community.",
    highlights: ["Centralized contractor registry", "Scheduled maintenance batches", "Verified service logs"],
  },
  {
    title: "Retail & Commercial Spaces",
    icon: Briefcase,
    tagline: "Dedicated technicians on business SLAs",
    description: "Keep shops, clinics, cafes, and offices operating smoothly with swift HVAC repairs, commercial lighting fixes, and dependable daily wage assistance.",
    highlights: ["GST-compliant tax invoices", "Priority dispatch desk", "Multi-site coverage"],
  },
];

// Comparison Matrix Data
const COMPARISON_ROWS = [
  {
    feature: "Identity & Background Check",
    kaamdo: "100% Aadhaar Biometric & Police Cleared",
    local: "Unverified / Unknown background",
    aggregator: "Basic phone number OTP check only",
  },
  {
    feature: "Pricing Transparency",
    kaamdo: "Standardized itemized rate cards upfront",
    local: "Arbitrary verbal quotes & bargaining",
    aggregator: "High surge pricing during peak hours",
  },
  {
    feature: "Parts & Hardware Replacement",
    kaamdo: "Customer must approve quote before purchase",
    local: "Hidden margins added without receipts",
    aggregator: "Bundled into generic expensive packages",
  },
  {
    feature: "Security Protocols",
    kaamdo: "Dual-OTP (Start OTP + Completion OTP)",
    local: "None (Cash handovers with no record)",
    aggregator: "Single confirmation SMS only",
  },
  {
    feature: "Rework Warranty",
    kaamdo: "7-Day Free Corrective Rework Guarantee",
    local: "Zero warranty once worker leaves",
    aggregator: "Lengthy multi-day support ticket review",
  },
];

// Testimonials
const TESTIMONIALS = [
  {
    name: "Priya Deshmukh",
    role: "Homeowner",
    city: "Indiranagar, Bengaluru",
    service: "AC Servicing & Gas Refill",
    rating: 5,
    quote: "The AC technician arrived in 22 minutes, showed his digital ID on the app, and walked me through the filter inspection before touching anything. The OTP payment meant I only approved once cooling was verified.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Rajesh Kulkarni",
    role: "Apartment Resident",
    city: "Kothrud, Pune",
    service: "Plumbing Pipe Replacement",
    rating: 5,
    quote: "Our bathroom main inlet burst on a Sunday morning. The KaamDo plumber brought standard PVC fittings, added the exact hardware cost with the bill attached, and charged the standard rate. Truly reliable.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
  },
  {
    name: "Amit Sen",
    role: "Property Manager",
    city: "Sector 62, Noida",
    service: "Switchboard & Wiring Overhaul",
    rating: 5,
    quote: "We use KaamDo for our rented studio apartments. The technicians are prompt, courteous, and the rate card eliminates any disputes with tenants. Best service platform we have used in NCR.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
  },
];

// Frequently Asked Questions
const FAQS = [
  {
    question: "How does KaamDo verify tradesmen and technicians?",
    answer: "Every professional undergoes mandatory 3-tier onboarding: Aadhaar biometric identity authentication, judicial police record clearance, and a practical trade skill assessment. Only workers with clean verification records receive active platform credentials.",
  },
  {
    question: "How does the Start and Completion OTP mechanism protect me?",
    answer: "When a technician arrives at your premises, you provide a 4-digit Arrival OTP only after checking their digital ID photo in the app. Once the repair is complete and inspected, you share a separate Completion OTP which securely releases payment from escrow.",
  },
  {
    question: "How are spare parts and replacement hardware billed?",
    answer: "Technicians do not mark up hardware. If replacement parts (e.g. MCB, valves, locks) are needed, the technician itemizes the part details and cost in the app. You must review and digitally approve the additional charge before they proceed.",
  },
  {
    question: "What if the repair has an issue after the technician leaves?",
    answer: "All services booked through KaamDo are backed by our 7-Day Free Rework Guarantee. If the fix fails within 7 days, request a rework from your dashboard and a senior verified pro will correct the issue at zero extra service charge.",
  },
  {
    question: "Can I book daily wage workers or masonry helpers?",
    answer: "Yes! KaamDo provides vetted daily wage workforce for construction support, tile fixing, debris clearing, wall painting, and heavy furniture shifting with standardized daily base rates.",
  },
  {
    question: "How can I install the KaamDo Android Mobile Apps?",
    answer: "You can download the standalone Universal Android APKs (.apk) directly from our website for both the Customer App and the Partner App. Sideloading requires enabling 'Allow from this source' in your Android Settings.",
  },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [catRes, workerRes] = await Promise.allSettled([
          fetch("/api/categories?limit=50").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/workers?limit=6").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!active) return;

        if (catRes.status === "fulfilled" && catRes.value?.data) {
          setCategories(catRes.value.data);
        }
        if (workerRes.status === "fulfilled" && workerRes.value?.data) {
          setWorkers(workerRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load marketplace data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  const heroWorker = workers[0];
  const heroWorkerName = heroWorker?.userId?.name || "Mohammad Riaz";
  const heroWorkerRate = heroWorker?.hourlyRate ? `₹${heroWorker.hourlyRate}/hr` : "₹299/hr";
  const heroWorkerTrade = heroWorker?.skills?.[0] || "Master Electrician";
  const heroWorkerExp = `${heroWorker?.experience || 8} yrs exp`;
  const heroWorkerRating = heroWorker?.rating ? heroWorker.rating.toFixed(1) : "4.9";
  const heroWorkerJobs = heroWorker?.totalJobs || 320;
  const heroWorkerAvatar = heroWorker?.userId?.avatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80";
  const heroWorkerLocality = heroWorker?.serviceAreas?.[0] || "Indiranagar";

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Header />

      {/* 1. HERO SECTION: Focused Value Proposition + Live Interface Anchor */}
      <section className="relative border-b border-border bg-gradient-to-b from-muted/30 via-background to-background pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

            {/* Left Column: Headline, Value Proposition, Search */}
            <div className="lg:col-span-7 space-y-6">
              {/* Trust Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span>Government Aadhaar & Police Verified Network</span>
                <span className="text-muted-foreground/60">•</span>
                <span className="font-normal text-muted-foreground hidden sm:inline">24,000+ Active Pros</span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.12]">
                  Find verified tradesmen & skilled technicians near you.
                </h1>
                <p className="text-base sm:text-lg text-muted-foreground max-w-xl font-normal leading-relaxed">
                  Book certified electricians, plumbers, carpenters, and appliance experts at fixed, transparent rate cards. Backed by 4-digit OTP security and our 7-day rework warranty.
                </p>
              </div>

              {/* Unified Search Engine */}
              <div className="bg-card border border-border rounded-xl p-2 shadow-sm max-w-2xl transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    window.location.href = `/workers?search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`;
                  }}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
                >
                  {/* Service Input */}
                  <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b sm:border-b-0 sm:border-r border-border">
                    <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                    <input
                      type="text"
                      placeholder="What service do you need? (e.g. Electrician, AC Repair)"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  {/* City Selector */}
                  <div className="flex items-center gap-2 px-3 py-2 border-b sm:border-b-0 border-border min-w-[140px]">
                    <MapPin className="w-4 h-4 text-primary shrink-0" />
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-transparent text-foreground font-medium focus:outline-none cursor-pointer"
                    >
                      {POPULAR_CITIES.map((c) => (
                        <option key={c} value={c} className="bg-background text-foreground">
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Primary Submit */}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs"
                  >
                    <span>Find Workers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Popular Discovery Chips */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                <span className="font-medium text-foreground">Popular:</span>
                {(categories.length > 0 ? categories.slice(0, 5) : [
                  { name: "Electrician", slug: "electrician" },
                  { name: "Plumbing", slug: "plumbing" },
                  { name: "AC & Appliance Repair", slug: "ac-repair" },
                  { name: "Carpentry", slug: "carpentry" },
                  { name: "Painting & Waterproofing", slug: "painting" },
                ]).map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/workers?skill=${encodeURIComponent(cat.name)}&city=${encodeURIComponent(selectedCity)}`}
                    className="px-2.5 py-1 rounded-md bg-muted/60 hover:bg-muted text-foreground border border-border/70 hover:border-primary/40 transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>

              {/* Dual Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <Link
                  href="/book"
                  className="px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  Post a Job Request
                </Link>
                <Link
                  href="/services"
                  className="px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs sm:text-sm font-semibold transition-colors"
                >
                  Explore Rate Cards
                </Link>
              </div>
            </div>

            {/* Right Column: Live Product Preview Anchor (Authentic Dispatch Interface) */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md">
                {/* Visual Decorative Glow */}
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 blur-xl opacity-60" />

                {/* Main Mockup Card */}
                <div className="relative bg-card border border-border/80 rounded-2xl p-6 shadow-xl space-y-5">
                  {/* Dispatch Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-xs font-bold text-foreground">LIVE DISPATCH RADAR</span>
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                      #KD-8921
                    </span>
                  </div>

                  {/* Worker Card Snippet */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={heroWorkerAvatar}
                      alt={heroWorkerName}
                      className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-foreground truncate">{heroWorkerName}</h4>
                        <span className="text-xs font-bold text-primary">{heroWorkerRate}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{heroWorkerTrade} • {heroWorkerExp}</p>

                      <div className="flex items-center gap-2 mt-1.5 text-xs">
                        <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{heroWorkerRating}</span>
                        </div>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-muted-foreground">{heroWorkerJobs} jobs</span>
                        <span className="text-muted-foreground/40">•</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Police Cleared</span>
                      </div>
                    </div>
                  </div>

                  {/* Real-time Status Tracker */}
                  <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-primary" />
                        Technician En Route
                      </span>
                      <span className="font-bold text-primary">Arriving in 14 mins</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full w-3/4 animate-pulse" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span>1.4 km away • {heroWorkerLocality}</span>
                      <span>GPS Radar Active</span>
                    </div>
                  </div>

                  {/* Dual-OTP Security Banner */}
                  <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                    <div className="p-2.5 rounded-lg border border-primary/20 bg-primary/5">
                      <span className="text-[10px] uppercase font-bold text-primary block">Arrival OTP</span>
                      <span className="text-base font-mono font-bold tracking-widest text-foreground">4892</span>
                      <span className="text-[10px] text-muted-foreground block">Share at doorstep</span>
                    </div>
                    <div className="p-2.5 rounded-lg border border-border bg-card">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">Completion OTP</span>
                      <span className="text-base font-mono font-bold tracking-widest text-muted-foreground">••••</span>
                      <span className="text-[10px] text-muted-foreground block">Share after inspection</span>
                    </div>
                  </div>

                  {/* Guarantee Strip */}
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" /> 7-Day Free Rework Warranty
                    </span>
                    <span className="font-medium text-foreground">Zero Surge Pricing</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Metric Stats Strip */}
          <div className="mt-16 pt-8 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_METRICS.map((m) => (
              <div key={m.label} className="space-y-1">
                <p className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST & BRAND INDICATORS */}
      <section className="py-8 bg-muted/20 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
            Operating under India&apos;s most stringent workforce verification standards
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
            <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
              <span className="text-xs font-semibold text-foreground">Aadhaar Biometric KYC</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
              <Award className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-foreground">Police Background Checked</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
              <BadgePercent className="w-4 h-4 text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-foreground">Standard Fixed Rate Cards</span>
            </div>
            <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
              <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="text-xs font-semibold text-foreground">7-Day Free Rework Warranty</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. MAIN BENEFITS: Why KaamDo is Different */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Built For Trust
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Fixing what&apos;s broken with home service marketplaces
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            No endless bargaining on street corners. No unverified strangers entering your family residence. KaamDo delivers full accountability from dispatch to payment release.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Standardized Itemized Rates</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Every job begins with an official rate card. If extra parts are required, the worker itemizes each part in-app, requiring your digital approval before purchase.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">Biometric Photo ID Check</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Never wonder who is knocking. Check their digital photo ID and police clearance status on your phone, then verify using the 4-digit doorstep Arrival OTP.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-foreground">7-Day Free Rework Guarantee</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If an electrical switch fails or a plumbing fitting leaks again within 7 days, request a rework from your dashboard. A verified pro returns at zero extra charge.
            </p>
          </div>
        </div>
      </section>

      {/* 4. SERVICE CATALOG: Explore By Trade */}
      <section className="py-16 bg-muted/20 border-y border-border" id="services">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Explore Rate Cards
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                Standard rate cards by trade
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Transparent base pricing. Zero surge multipliers. All hardware parts billed with customer approval.
              </p>
            </div>
            <Link
              href="/services"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View full rate card directory</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Marketplace Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading && categories.length === 0 ? (
              [...Array(8)].map((_, i) => (
                <div key={i} className="p-5 rounded-xl bg-card border border-border animate-pulse space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="w-16 h-4 rounded bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <div className="w-24 h-4 rounded bg-muted" />
                    <div className="w-full h-3 rounded bg-muted" />
                    <div className="w-3/4 h-3 rounded bg-muted" />
                  </div>
                  <div className="pt-3 border-t border-border flex justify-between">
                    <div className="w-16 h-3 rounded bg-muted" />
                    <div className="w-16 h-3 rounded bg-muted" />
                  </div>
                </div>
              ))
            ) : (
              categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug, cat.name);
                const minPrice = cat.subcategories?.length
                  ? Math.min(...cat.subcategories.map((s) => s.basePrice || 199))
                  : 199;
                const count = cat.subcategories?.length
                  ? `${cat.subcategories.length} Services`
                  : "Standard Rate";
                const tagline =
                  cat.description ||
                  cat.subcategories?.map((s) => s.name).slice(0, 3).join(", ") ||
                  "Standard trade service";

                return (
                  <Link
                    key={cat._id || cat.slug}
                    href={`/workers?skill=${encodeURIComponent(cat.name)}`}
                    className="group p-5 rounded-xl bg-card border border-border hover:border-primary/60 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-10 h-10 rounded-lg bg-muted text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-foreground bg-muted px-2.5 py-0.5 rounded-md">
                          From ₹{minPrice}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {tagline}
                      </p>
                    </div>

                    <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                      <span>{count}</span>
                      <span className="text-primary font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                        View Pros <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 5. VERIFIED WORKERS SPOTLIGHT */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full" id="workers">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Verified Directory
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Highest-rated local technicians available for booking
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Biometric Aadhaar authenticated, police cleared, and equipped with verified job track records.
            </p>
          </div>
          <Link
            href="/workers"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Browse all verified workers</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading && workers.length === 0 ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-card border border-border p-6 animate-pulse space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-full bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="w-24 h-4 rounded bg-muted" />
                    <div className="w-16 h-3 rounded bg-muted" />
                    <div className="w-32 h-3 rounded bg-muted" />
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <div className="w-20 h-3 rounded bg-muted" />
                  <div className="w-14 h-4 rounded bg-muted" />
                </div>
                <div className="pt-4 border-t border-border flex gap-2">
                  <div className="flex-1 h-8 rounded-lg bg-muted" />
                  <div className="flex-1 h-8 rounded-lg bg-muted" />
                </div>
              </div>
            ))
          ) : (
            workers.map((w) => {
              const workerName = w.userId?.name || "Verified Professional";
              const workerAvatar =
                w.userId?.avatar ||
                "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80";
              const primarySkill = w.skills?.[0] || "Skilled Tradesman";
              const rateDisplay = w.hourlyRate
                ? `₹${w.hourlyRate}/hr`
                : w.dailyRate
                ? `₹${w.dailyRate}/day`
                : "₹299/hr";
              const location = w.serviceAreas?.join(", ") || "City Center";

              return (
                <div
                  key={w._id}
                  className="rounded-2xl bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <img
                        src={workerAvatar}
                        alt={workerName}
                        className="w-14 h-14 rounded-full object-cover border border-border shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-foreground truncate">{workerName}</h3>
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{primarySkill}</p>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span>{w.rating ? w.rating.toFixed(1) : "4.8"}</span>
                          </div>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-muted-foreground">{w.totalJobs || 50} jobs</span>
                          <span className="text-muted-foreground/40">•</span>
                          <span className="text-muted-foreground">{w.experience || 4} yrs exp</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3.5 border-t border-border flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground truncate max-w-[180px]">
                        <MapPin className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
                        <span className="truncate">{location}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-foreground text-sm">{rateDisplay}</span>
                      </div>
                    </div>

                    <div className="mt-3.5 flex flex-wrap gap-1.5">
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                        {w.status === "verified" ? "Aadhaar Verified" : "Identity Verified"}
                      </span>
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
                        Police Cleared
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border flex gap-2">
                    <Link
                      href={`/workers/${w._id}`}
                      className="flex-1 py-2.5 text-center text-xs font-semibold rounded-lg border border-border hover:bg-muted text-foreground transition-colors"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/book?workerId=${w._id}`}
                      className="flex-1 py-2.5 text-center text-xs font-semibold rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground transition-colors shadow-xs"
                    >
                      Hire Worker
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
        </div>
      </section>

      {/* 6. HOW KAAMDO WORKS: 3-Step Clear Flow */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Transparent Workflow
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              How KaamDo connects you with the right pro
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Three clear steps with full accountability, live tracking, and digital escrow protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                01
              </div>
              <h3 className="font-bold text-base text-foreground">
                Choose Service & Time
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Select your required trade, describe the issue, and pick a convenient date or request emergency arrival within 30 minutes.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                02
              </div>
              <h3 className="font-bold text-base text-foreground">
                OTP-Secured Arrival
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A verified local technician is dispatched. Check their digital photo ID and share your arrival OTP only when they arrive at your location.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                03
              </div>
              <h3 className="font-bold text-base text-foreground">
                Inspect & Release
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Inspect the completed repair. Share the completion OTP to release payment securely. Backed by KaamDo&apos;s 7-day rework guarantee.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. USE CASES: Who KaamDo Serves */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Tailored Solutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Built for residences, societies, and businesses
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Whether you need a quick home switchboard fix or regular maintenance for a commercial complex.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {USE_CASES.map((uc) => {
            const Icon = uc.icon;
            return (
              <div
                key={uc.title}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-foreground">{uc.title}</h3>
                  <p className="text-xs font-semibold text-primary mt-0.5">{uc.tagline}</p>
                  <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                    {uc.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-border space-y-1.5">
                  {uc.highlights.map((h) => (
                    <div key={h} className="flex items-center gap-1.5 text-[11px] text-foreground">
                      <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 8. COMPARISON MATRIX: Why KaamDo Stands Out */}
      <section className="py-16 sm:py-20 bg-muted/20 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Objective Comparison
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Why homeowners choose KaamDo
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              How our vetted, OTP-secured platform compares to roadside unverified workers and high-commission aggregator apps.
            </p>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-foreground">Key Feature</th>
                  <th className="py-3.5 px-4 sm:px-6 font-bold text-primary bg-primary/5">
                    KaamDo Platform
                  </th>
                  <th className="py-3.5 px-4 sm:px-6 font-medium text-muted-foreground">Local Unverified Worker</th>
                  <th className="py-3.5 px-4 sm:px-6 font-medium text-muted-foreground">Generic Aggregators</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-semibold text-foreground">
                      {row.feature}
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 font-medium text-foreground bg-primary/5">
                      <div className="flex items-center gap-1.5 text-primary font-bold">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        <span>{row.kaamdo}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <X className="w-4 h-4 text-destructive shrink-0" />
                        <span>{row.local}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] shrink-0">•</span>
                        <span>{row.aggregator}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 9. TESTIMONIALS: Real Verified Customer Feedback */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Customer Stories
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Loved by 85,000+ households across India
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Genuine experiences from homeowners, renters, and property managers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
              </div>

              <div className="pt-4 border-t border-border flex items-center gap-3">
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0"
                />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{t.role} • {t.city}</p>
                  <span className="text-[10px] text-primary font-semibold">{t.service}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10. MOBILE APPS SHOWCASE BANNER */}
      <section className="py-16 bg-muted/20 border-y border-border" id="download-apps">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Mobile Ecosystem
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
                Install KaamDo Android Mobile Apps
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
                Real-time proximity dispatch, live GPS navigation, in-app technician chat, and instant payouts on your smartphone.
              </p>
            </div>
            <Link
              href="/apps"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View installation guide & details</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer App Card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-primary/60 transition-colors shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                    For Customers
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">KaamDo Customer App</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Book verified local technicians, track them in real time on GPS radar, chat in-app, and confirm completions with secure 4-digit OTP.
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Live GPS radar tracking of technicians en route</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Transparent rate cards & parts billing approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Razorpay UPI, cards & digital wallet payments</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <a
                  href="/downloads/kaamdo-customer.apk"
                  download="kaamdo-customer.apk"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Customer APK</span>
                </a>
                <Link
                  href="/apps"
                  className="py-2.5 px-3 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>

            {/* Partner / Worker App Card */}
            <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500/60 transition-colors shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#831843] text-amber-400 flex items-center justify-center">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    For Technicians & Partners
                  </span>
                </div>
                <h3 className="text-lg font-bold text-foreground">KaamDo Partner App</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Claim local job leads within 10km, stream live navigation, submit extra labor & hardware parts, and request instant bank payouts.
                </p>
                <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Instant proximity broadcast & lead claiming</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Digital KYC, Aadhaar check & weekly bank payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Itemized onsite extra labor & parts addition</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                <a
                  href="/downloads/kaamdo-partner.apk"
                  download="kaamdo-partner.apk"
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#831843] hover:bg-[#701338] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <Download className="w-4 h-4 text-amber-400" />
                  <span>Download Partner APK</span>
                </a>
                <Link
                  href="/apps"
                  className="py-2.5 px-3 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ ACCORDION: Common Queries */}
      <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full" id="faq">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Everything you need to know about booking, rates, security OTPs, and rework warranties.
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={faq.question}
                className="border border-border rounded-xl bg-card overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-foreground hover:bg-muted/40 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-primary" : ""
                      }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* 12. FINAL HIGH-CONVERTING CTA BANNER */}
      <section className="py-16 bg-gradient-to-b from-primary/10 via-primary/5 to-background border-t border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guaranteed Reliability • Zero Hassle</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Ready to experience dependable home services?
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Join over 85,000 satisfied households across India. Book certified electricians, plumbers, carpenters, and appliance experts in under 2 minutes.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              href="/book"
              className="px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm transition-colors shadow-sm"
            >
              Post a Job Request
            </Link>
            <Link
              href="/workers"
              className="px-6 py-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm transition-colors"
            >
              Browse Workers Directory
            </Link>
            <Link
              href="/apps"
              className="px-6 py-3 rounded-lg border border-border bg-card hover:bg-muted text-foreground font-semibold text-sm transition-colors flex items-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-primary" />
              <span>Get Android App</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 13. PRODUCTION MULTI-COLUMN FOOTER */}
      <footer className="bg-card border-t border-border py-14 text-muted-foreground text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
          {/* Top Footer Strip: Brand + Status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-border">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo/horizontal-logo.png"
                alt="KaamDo Logo"
                width={140}
                height={42}
                className="h-7 w-auto object-contain dark:hidden"
              />
              <Image
                src="/logo-white.png"
                alt="KaamDo Logo"
                width={140}
                height={42}
                className="h-7 w-auto object-contain hidden dark:block"
              />
            </Link>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Operational
              </span>
              <p className="text-xs text-muted-foreground hidden md:inline">
                Har Kaam, Sahi Insaan
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            <div className="space-y-3">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Services by Trade
              </p>
              <ul className="space-y-2">
                <li><Link href="/services?category=electrical" className="hover:text-foreground transition-colors">Electricians</Link></li>
                <li><Link href="/services?category=plumbing" className="hover:text-foreground transition-colors">Plumbers</Link></li>
                <li><Link href="/services?category=appliances" className="hover:text-foreground transition-colors">AC & Appliances</Link></li>
                <li><Link href="/services?category=carpentry" className="hover:text-foreground transition-colors">Carpenters</Link></li>
                <li><Link href="/services?category=painting" className="hover:text-foreground transition-colors">Painters</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Marketplace
              </p>
              <ul className="space-y-2">
                <li><Link href="/workers" className="hover:text-foreground transition-colors">Find Workers Directory</Link></li>
                <li><Link href="/services" className="hover:text-foreground transition-colors">All Rate Cards</Link></li>
                <li><Link href="/book" className="hover:text-foreground transition-colors">Post a Service Job</Link></li>
                <li><Link href="/apps" className="hover:text-foreground text-primary font-semibold transition-colors">Mobile Apps (.APK)</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
                <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin Operations</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Service Partners
              </p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-foreground transition-colors">Join as Professional</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Worker Partner Login</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Aadhaar KYC Desk</Link></li>
                <li><Link href="/login" className="hover:text-foreground transition-colors">Weekly Payout Ledger</Link></li>
                <li><Link href="/apps" className="hover:text-foreground transition-colors">Partner Android App</Link></li>
              </ul>
            </div>

            <div className="space-y-3">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Trust & Safety
              </p>
              <ul className="space-y-2">
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">Biometric KYC Check</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">Dual-OTP Protection</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">7-Day Rework Warranty</Link></li>
                <li><Link href="/#faq" className="hover:text-foreground transition-colors">Dispute Resolution</Link></li>
                <li><Link href="/#faq" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            <div className="space-y-3 col-span-2 sm:col-span-1">
              <p className="font-bold text-foreground text-xs uppercase tracking-wider">
                Corporate Office
              </p>
              <div className="space-y-1.5 leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">KaamDo Technologies Pvt Ltd</p>
                <p>8th Block, Koramangala</p>
                <p>Bengaluru, Karnataka 560034</p>
                <p className="pt-2 text-foreground font-semibold">Support Helpline:</p>
                <p>+91 98765 43210</p>
                <p>support@kaamdo.in</p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
            <p>© 2026 KaamDo Technologies Pvt Ltd. All rights reserved.</p>
            <p className="text-muted-foreground/80">
              Crafted for India&apos;s Skilled Trades • <span className="text-primary font-semibold">Har Kaam, Sahi Insaan</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}