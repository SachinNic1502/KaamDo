"use client";

import { useState } from "react";
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
} from "lucide-react";

// Top Indian Metro & Tier 1 Cities
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

// Clean Service Categories for Discovery (Restrained, Marketplace Tiles)
const MARKETPLACE_CATEGORIES = [
  {
    name: "Electrician",
    slug: "electrical",
    icon: Zap,
    tagline: "Wiring, MCB, switches & appliances",
    startingRate: "₹199",
    count: "480+ Pros",
  },
  {
    name: "Plumber",
    slug: "plumbing",
    icon: Droplets,
    tagline: "Leakages, taps, tanks & fittings",
    startingRate: "₹249",
    count: "390+ Pros",
  },
  {
    name: "Carpenter",
    slug: "carpentry",
    icon: Hammer,
    tagline: "Furniture repair, doors, locks & wood work",
    startingRate: "₹299",
    count: "270+ Pros",
  },
  {
    name: "AC & Appliances",
    slug: "appliances",
    icon: Wrench,
    tagline: "AC service, gas refill, fridge & washing machine",
    startingRate: "₹399",
    count: "320+ Pros",
  },
  {
    name: "Painter",
    slug: "painting",
    icon: Paintbrush,
    tagline: "Interior, exterior, texture & waterproofing",
    startingRate: "₹899",
    count: "180+ Pros",
  },
  {
    name: "Deep Cleaning",
    slug: "cleaning",
    icon: Sparkles,
    tagline: "Bathroom, kitchen, sofa & full home sanitize",
    startingRate: "₹499",
    count: "210+ Pros",
  },
  {
    name: "Daily Wage Labour",
    slug: "construction",
    icon: HardHat,
    tagline: "Helpers, masonry, tile fixing & shifting",
    startingRate: "₹650/day",
    count: "540+ Pros",
  },
  {
    name: "General Handyman",
    slug: "handyman",
    icon: Wrench,
    tagline: "Drilling, TV mounting, curtains & fittings",
    startingRate: "₹149",
    count: "310+ Pros",
  },
];

// Verified Worker Spotlight
const VERIFIED_WORKERS = [
  {
    id: "67a1b2c3d4e5f60000000001",
    name: "Mohammad Riaz",
    trade: "Master Electrician",
    experience: "8 yrs exp",
    rating: 4.9,
    jobs: 320,
    rate: "₹299/hr",
    city: "Bengaluru",
    locality: "Indiranagar",
    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
    badges: ["Aadhaar Verified", "Police Cleared"],
  },
  {
    id: "67a1b2c3d4e5f60000000002",
    name: "Dinesh Sharma",
    trade: "Plumbing Specialist",
    experience: "6 yrs exp",
    rating: 4.8,
    jobs: 215,
    rate: "₹249/hr",
    city: "Pune",
    locality: "Kothrud",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
    badges: ["Skill Certified", "Fast Response"],
  },
  {
    id: "67a1b2c3d4e5f60000000003",
    name: "Vikram Chauhan",
    trade: "HVAC & AC Technician",
    experience: "10 yrs exp",
    rating: 4.9,
    jobs: 410,
    rate: "₹399/hr",
    city: "Delhi NCR",
    locality: "Sector 62, Noida",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    badges: ["Brand Authorized", "Aadhaar Verified"],
  },
];

const TRUST_METRICS = [
  { label: "Verified Professionals", value: "24,000+" },
  { label: "Completed Service Requests", value: "85,000+" },
  { label: "Average Response Time", value: "< 25 Mins" },
  { label: "Customer Satisfaction", value: "4.86 / 5.0" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <Header />

      {/* 1. HERO: Marketplace Utility (Search + Service + City Location) */}
      <section className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 text-[#0456D3] dark:text-blue-400 text-xs font-semibold mb-4">
              <ShieldCheck className="w-4 h-4 text-[#0456D3] dark:text-blue-400" />
              <span>Har Kaam, Sahi Insaan</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="font-normal text-slate-600 dark:text-slate-400">Verified Local Workforce</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.2]">
              Find verified tradesmen & skilled technicians near you.
            </h1>

            <p className="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
              Book police-verified electricians, plumbers, carpenters, and daily wage workers with upfront standardized rates and secure OTP delivery.
            </p>
          </div>

          {/* Unified Marketplace Search Engine Bar */}
          <div className="mt-8 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-lg p-2 shadow-sm max-w-4xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = `/workers?search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`;
              }}
              className="flex flex-col md:flex-row items-stretch md:items-center gap-2"
            >
              {/* Service Input */}
              <div className="flex-1 flex items-center gap-2.5 px-3 py-2 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder="What work do you need help with? (e.g. Electrician, AC Repair, Plumber)"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-sm bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
                />
              </div>

              {/* Location Selector */}
              <div className="flex items-center gap-2 px-3 py-2 border-b md:border-b-0 border-slate-200 dark:border-slate-800 min-w-[180px]">
                <MapPin className="w-4 h-4 text-[#0456D3] shrink-0" />
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full text-sm bg-transparent text-slate-900 dark:text-white font-medium focus:outline-none cursor-pointer"
                >
                  {POPULAR_CITIES.map((c) => (
                    <option key={c} value={c} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0456D3] hover:bg-blue-700 text-white text-sm font-semibold rounded-md transition flex items-center justify-center gap-2 shrink-0 shadow-xs"
              >
                <span>Find Workers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Quick Popular Keywords */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-medium text-slate-700 dark:text-slate-300">Popular right now:</span>
            {["Switchboard Installation", "Bathroom Leakage", "AC Filter Cleaning", "Door Lock Fitting", "Wall Painting"].map((kw) => (
              <Link
                key={kw}
                href={`/workers?search=${encodeURIComponent(kw)}&city=${encodeURIComponent(selectedCity)}`}
                className="px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-[#0456D3] hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/80 dark:border-slate-700/60 transition"
              >
                {kw}
              </Link>
            ))}
          </div>

          {/* Clean Metric Stats Strip */}
          <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-2 md:grid-cols-4 gap-6">
            {TRUST_METRICS.map((m) => (
              <div key={m.label} className="space-y-1">
                <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{m.value}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. SERVICE CATEGORIES (Compact, Scannable Discovery) */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 w-full" id="services">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#0456D3] dark:text-blue-400">
              Explore By Trade
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
              Select a service to view standard rate cards
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Standardized pricing with zero surprise charges. All parts billed separately with customer approval.
            </p>
          </div>
          <Link
            href="/services"
            className="text-xs font-semibold text-[#0456D3] dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
          >
            <span>Browse all categories</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Compact Marketplace Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MARKETPLACE_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <Link
                key={cat.slug}
                href={`/workers?skill=${encodeURIComponent(cat.name)}`}
                className="group p-4 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0456D3] dark:hover:border-blue-500 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-md bg-slate-100 dark:bg-slate-800 text-[#0456D3] dark:text-blue-400 flex items-center justify-center group-hover:bg-[#0456D3] group-hover:text-white transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      From {cat.startingRate}
                    </span>
                  </div>

                  <h3 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-[#0456D3] dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {cat.tagline}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                  <span>{cat.count}</span>
                  <span className="text-[#0456D3] dark:text-blue-400 font-medium group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                    View Pros <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. VERIFIED WORKERS SPOTLIGHT */}
      <section className="py-14 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800" id="workers">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#0456D3] dark:text-blue-400">
                Verified Local Professionals
              </span>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                Highest-rated technicians available for booking
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Aadhaar-authenticated, police record checked, and equipped with verified customer track records.
              </p>
            </div>
            <Link
              href="/workers"
              className="text-xs font-semibold text-[#0456D3] dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Explore all technicians</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {VERIFIED_WORKERS.map((w) => (
              <div
                key={w.id}
                className="rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start gap-3.5">
                    <img
                      src={w.avatar}
                      alt={w.name}
                      className="w-14 h-14 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                          {w.name}
                        </h3>
                        <CheckCircle2 className="w-4 h-4 text-[#0456D3] shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{w.trade}</p>
                      <div className="flex items-center gap-1.5 mt-1 text-xs">
                        <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{w.rating}</span>
                        </div>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500">{w.jobs} jobs</span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-slate-500">{w.experience}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{w.locality}, {w.city}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900 dark:text-white">{w.rate}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {w.badges.map((badge) => (
                      <span
                        key={badge}
                        className="px-2 py-0.5 text-[10px] font-medium rounded bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-200 dark:border-slate-800 flex gap-2">
                  <Link
                    href={`/workers/${w.id}`}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/book?workerId=${w.id}`}
                    className="flex-1 py-2 text-center text-xs font-semibold rounded-md bg-[#0456D3] hover:bg-blue-700 text-white transition shadow-xs"
                  >
                    Hire Worker
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. HOW KAAMDO WORKS (Transparent 3-Step Process) */}
      <section className="py-14 max-w-6xl mx-auto px-4 sm:px-6 w-full" id="how-it-works">
        <div className="max-w-2xl mb-10">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#0456D3] dark:text-blue-400">
            Transparent Workflow
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            How KaamDo connects you with the right person
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Three simple steps with full accountability, live tracking, and digital escrow protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              Choose Service & Time
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Select the trade needed, specify the issue, and pick a convenient date or request emergency arrival within 30 minutes.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              OTP-Secured Arrival
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              A verified local technician is dispatched. Check their digital photo ID and share your arrival OTP only when they arrive at your location.
            </p>
          </div>

          <div className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-8 h-8 rounded-md bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="font-semibold text-base text-slate-900 dark:text-white">
              Inspect & Approve
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Verify the finished repair. Share the completion OTP to release payment securely. Backed by KaamDo&apos;s 7-day rework guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* 5. TRUST & SAFETY PROMISE */}
      <section className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-blue-400">
                <ShieldCheck className="w-5 h-5" />
                <h4 className="font-semibold text-sm text-white">Aadhaar & Police Verified</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every worker passes mandatory biometric identity verification and judicial background check.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Award className="w-5 h-5" />
                <h4 className="font-semibold text-sm text-white">7-Day Free Rework</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                If the fix doesn&apos;t hold up, we send a technician to correct it at zero additional service charge.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400">
                <BadgePercent className="w-5 h-5" />
                <h4 className="font-semibold text-sm text-white">Standard Fixed Rates</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transparent itemized rate cards. No bargaining, no surprise surge pricing at checkout.
              </p>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-orange-400">
                <PhoneCall className="w-5 h-5" />
                <h4 className="font-semibold text-sm text-white">Dedicated Support Desk</h4>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Live customer helpline and dispute resolution desk available 7 days a week, 8 AM - 10 PM.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. PARTNER ONBOARDING BANNER */}
      <section className="bg-white dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Are you a skilled technician, contractor, or daily wage worker?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Join 24,000+ verified professionals getting steady local work, prompt weekly payouts, and insurance coverage.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-semibold transition"
            >
              Partner Sign In
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white text-xs font-semibold transition"
            >
              Join as a Professional
            </Link>
          </div>
        </div>
      </section>

      {/* 7. PRODUCTION FOOTER */}
      <footer className="bg-white dark:bg-slate-950 py-12 text-slate-500 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-8 mb-8 border-b border-slate-200 dark:border-slate-800">
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
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-right">
              India&apos;s Verified Trade & Technician Marketplace •{" "}
              <span className="text-[#0456D3] dark:text-blue-400 font-semibold">Har Kaam, Sahi Insaan</span>
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                Popular Services
              </p>
              <ul className="space-y-2">
                <li><Link href="/services?category=electrical" className="hover:text-[#0456D3]">Electrician in Bengaluru</Link></li>
                <li><Link href="/services?category=plumbing" className="hover:text-[#0456D3]">Plumber in Pune</Link></li>
                <li><Link href="/services?category=appliances" className="hover:text-[#0456D3]">AC Servicing in Delhi NCR</Link></li>
                <li><Link href="/services?category=carpentry" className="hover:text-[#0456D3]">Carpentry in Mumbai</Link></li>
                <li><Link href="/services?category=painting" className="hover:text-[#0456D3]">Painting in Hyderabad</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                Marketplace
              </p>
              <ul className="space-y-2">
                <li><Link href="/workers" className="hover:text-[#0456D3]">Find Workers Directory</Link></li>
                <li><Link href="/services" className="hover:text-[#0456D3]">All Services & Rate Cards</Link></li>
                <li><Link href="/book" className="hover:text-[#0456D3]">Post a Job Request</Link></li>
                <li><Link href="/#how-it-works" className="hover:text-[#0456D3]">How KaamDo Works</Link></li>
                <li><Link href="/admin" className="hover:text-[#0456D3]">Platform Administration</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                For Service Partners
              </p>
              <ul className="space-y-2">
                <li><Link href="/login" className="hover:text-[#0456D3]">Register as Professional</Link></li>
                <li><Link href="/login" className="hover:text-[#0456D3]">Worker Partner Login</Link></li>
                <li><Link href="/login" className="hover:text-[#0456D3]">KYC & Skill Verification</Link></li>
                <li><Link href="/login" className="hover:text-[#0456D3]">Weekly Payout System</Link></li>
              </ul>
            </div>

            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-xs uppercase tracking-wider mb-3">
                Corporate Office
              </p>
              <p className="leading-relaxed">
                KaamDo Technologies Pvt Ltd<br />
                8th Block, Koramangala<br />
                Bengaluru, Karnataka 560034<br />
                Helpline: +91 98765 43210<br />
                Email: support@kaamdo.in
              </p>
            </div>
          </div>

          <div className="pt-8 border-t border-slate-200 dark:border-slate-800 text-center">
            © 2026 KaamDo Technologies Pvt Ltd. All rights reserved. Har Kaam, Sahi Insaan.
          </div>
        </div>
      </footer>
    </div>
  );
}