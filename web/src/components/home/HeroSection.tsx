"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  LocateFixed,
  ArrowRight,
  Calculator,
  CheckCircle2,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wrench,
  Sparkles,
  HardHat,
  Layers,
} from "lucide-react";
import { Category, Subcategory, WorkerRecord } from "./types";
import HeroRadarSimulator from "./HeroRadarSimulator";

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

const TRUST_METRICS = [
  { label: "Verified Professionals", value: "24,000+" },
  { label: "Completed Service Requests", value: "85,000+" },
  { label: "Average Response Time", value: "< 25 Mins" },
  { label: "Customer Satisfaction", value: "4.86 / 5.0" },
];

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

interface HeroSectionProps {
  categories: Category[];
  workers: WorkerRecord[];
}

export default function HeroSection({ categories, workers }: HeroSectionProps) {
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("Bengaluru");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<string | null>(null);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtered search suggestions
  const searchSuggestions = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return { matchingCats: [], matchingSubcats: [] };

    const matchingCats = categories.filter(
      (c) => c.name.toLowerCase().includes(query) || c.slug.toLowerCase().includes(query)
    );

    const matchingSubcats: { catName: string; catSlug: string; sub: Subcategory }[] = [];
    categories.forEach((c) => {
      c.subcategories?.forEach((s) => {
        if (s.name.toLowerCase().includes(query)) {
          matchingSubcats.push({ catName: c.name, catSlug: c.slug, sub: s });
        }
      });
    });

    return {
      matchingCats: matchingCats.slice(0, 4),
      matchingSubcats: matchingSubcats.slice(0, 5),
    };
  }, [search, categories]);

  // Geolocation detector handler
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }
    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      () => {
        setIsDetectingLocation(false);
        setDetectedLocation("Detected: Local Area GPS Active");
      },
      () => {
        setIsDetectingLocation(false);
        alert("Location access denied or unavailable. Please choose from the city list.");
      },
      { timeout: 7000 }
    );
  };

  const heroWorker = workers[0];

  return (
    <section className="relative border-b border-border bg-gradient-to-b from-muted/30 via-background to-background pt-12 pb-16 sm:pt-16 sm:pb-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline, Value Proposition, Unified Search */}
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

            {/* Unified Search Engine with Live Autocomplete */}
            <div ref={searchContainerRef} className="relative max-w-2xl">
              <div className="bg-card border border-border rounded-xl p-2 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setShowSearchDropdown(false);
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
                      onFocus={() => setShowSearchDropdown(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setShowSearchDropdown(true);
                      }}
                      className="w-full text-xs sm:text-sm bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none"
                    />
                  </div>

                  {/* City Selector with Geolocation Auto-Detect */}
                  <div className="flex items-center gap-1.5 px-3 py-2 border-b sm:border-b-0 border-border min-w-[150px]">
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
                    <button
                      type="button"
                      onClick={handleDetectLocation}
                      title="Detect your current location"
                      className="p-1 text-muted-foreground hover:text-primary rounded hover:bg-muted transition-colors shrink-0 cursor-pointer"
                    >
                      <LocateFixed className={`w-3.5 h-3.5 ${isDetectingLocation ? "animate-spin text-primary" : ""}`} />
                    </button>
                  </div>

                  {/* Primary Submit */}
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs sm:text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
                  >
                    <span>Find Workers</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* Geolocation feedback badge */}
              {detectedLocation && (
                <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 px-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{detectedLocation} in {selectedCity}</span>
                </div>
              )}

              {/* Live Autocomplete Dropdown */}
              {showSearchDropdown && search.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-xl z-50 overflow-hidden divide-y divide-border">
                  {/* Matching Categories */}
                  {searchSuggestions.matchingCats.length > 0 && (
                    <div className="p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5 px-1">
                        Trade Categories
                      </span>
                      <div className="space-y-1">
                        {searchSuggestions.matchingCats.map((cat) => {
                          const Icon = getCategoryIcon(cat.slug, cat.name);
                          return (
                            <Link
                              key={cat._id || cat.slug}
                              href={`/workers?skill=${encodeURIComponent(cat.name)}&city=${encodeURIComponent(selectedCity)}`}
                              onClick={() => setShowSearchDropdown(false)}
                              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs font-medium text-foreground transition-colors"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-6 h-6 rounded bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <span>{cat.name}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">
                                {cat.subcategories?.length || 0} services
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Matching Subcategories / Specific Fixes */}
                  {searchSuggestions.matchingSubcats.length > 0 && (
                    <div className="p-3">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block mb-1.5 px-1">
                        Specific Repair Services
                      </span>
                      <div className="space-y-1">
                        {searchSuggestions.matchingSubcats.map(({ catName, sub }) => (
                          <Link
                            key={sub._id}
                            href={`/book?service=${encodeURIComponent(sub.name)}&city=${encodeURIComponent(selectedCity)}`}
                            onClick={() => setShowSearchDropdown(false)}
                            className="flex items-center justify-between p-2 rounded-lg hover:bg-muted text-xs text-foreground transition-colors"
                          >
                            <div>
                              <p className="font-semibold">{sub.name}</p>
                              <p className="text-[10px] text-muted-foreground">{catName}</p>
                            </div>
                            <span className="text-xs font-bold text-primary">
                              From ₹{sub.basePrice}
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchSuggestions.matchingCats.length === 0 && searchSuggestions.matchingSubcats.length === 0 && (
                    <div className="p-4 text-center text-xs text-muted-foreground">
                      No direct service matches for &quot;{search}&quot;. Press &quot;Find Workers&quot; to search all certified pros.
                    </div>
                  )}

                  {/* Footer query trigger */}
                  <div className="p-2.5 bg-muted/30 flex justify-between items-center text-xs px-3">
                    <span className="text-muted-foreground text-[11px]">
                      Press Enter to search all in <strong className="text-foreground">{selectedCity}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSearchDropdown(false);
                        window.location.href = `/workers?search=${encodeURIComponent(search)}&city=${encodeURIComponent(selectedCity)}`;
                      }}
                      className="text-primary font-semibold hover:underline text-[11px] cursor-pointer"
                    >
                      Search All &rarr;
                    </button>
                  </div>
                </div>
              )}
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
              <a
                href="#cost-estimator"
                className="px-5 py-2.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5"
              >
                <Calculator className="w-3.5 h-3.5 text-primary" />
                <span>Cost Calculator</span>
              </a>
            </div>
          </div>

          {/* Right Column: Hero Radar Simulator */}
          <div className="lg:col-span-5">
            <HeroRadarSimulator heroWorker={heroWorker} />
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
  );
}
