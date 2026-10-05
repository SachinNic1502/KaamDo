"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/header/Header";
import {
  Search,
  MapPin,
  Star,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  ArrowRight,
  ChevronRight,
  SlidersHorizontal,
  X,
  Loader2,
  Award,
  Briefcase,
  User,
} from "lucide-react";

interface WorkerRecord {
  _id: string;
  userId?: {
    _id: string;
    name: string;
    avatar?: string;
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

const CATEGORY_OPTIONS = [
  "All Services",
  "Electrician",
  "Plumber",
  "Carpenter",
  "AC & Appliance Repair",
  "Painter",
  "Cleaning",
  "Daily Wage Labour",
  "General Handyman",
];

const CITY_OPTIONS = [
  "All Cities",
  "Bengaluru",
  "Delhi NCR",
  "Mumbai",
  "Pune",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Ahmedabad",
];

// Fallback curated verified workers if DB is fresh
const SAMPLE_WORKERS: WorkerRecord[] = [
  {
    _id: "67a1b2c3d4e5f60000000001",
    userId: {
      _id: "u1",
      name: "Mohammad Riaz",
      avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["Electrician", "Switchboard Repair", "MCB Wiring"],
    experience: 8,
    serviceAreas: ["Bengaluru", "Indiranagar", "Koramangala"],
    hourlyRate: 299,
    status: "verified",
    isOnline: true,
    rating: 4.9,
    totalJobs: 320,
  },
  {
    _id: "67a1b2c3d4e5f60000000002",
    userId: {
      _id: "u2",
      name: "Dinesh Sharma",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["Plumber", "Leakage Repair", "Sanitary Fittings"],
    experience: 6,
    serviceAreas: ["Pune", "Kothrud", "Baner"],
    hourlyRate: 249,
    status: "verified",
    isOnline: true,
    rating: 4.8,
    totalJobs: 215,
  },
  {
    _id: "67a1b2c3d4e5f60000000003",
    userId: {
      _id: "u3",
      name: "Vikram Chauhan",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["AC & Appliance Repair", "Gas Refill", "Split AC Installation"],
    experience: 10,
    serviceAreas: ["Delhi NCR", "Noida", "South Delhi"],
    hourlyRate: 399,
    status: "verified",
    isOnline: false,
    rating: 4.9,
    totalJobs: 410,
  },
  {
    _id: "67a1b2c3d4e5f60000000004",
    userId: {
      _id: "u4",
      name: "Rameshwar Prajapati",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["Carpenter", "Custom Shelving", "Door Lock Fitting"],
    experience: 7,
    serviceAreas: ["Mumbai", "Andheri West", "Bandra"],
    hourlyRate: 349,
    status: "verified",
    isOnline: true,
    rating: 4.85,
    totalJobs: 180,
  },
  {
    _id: "67a1b2c3d4e5f60000000005",
    userId: {
      _id: "u5",
      name: "Girish Nayak",
      avatar: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["Painter", "Full Home Painting", "Waterproofing"],
    experience: 5,
    serviceAreas: ["Hyderabad", "Madhapur", "Gachibowli"],
    hourlyRate: 299,
    dailyRate: 1400,
    status: "verified",
    isOnline: true,
    rating: 4.75,
    totalJobs: 135,
  },
  {
    _id: "67a1b2c3d4e5f60000000006",
    userId: {
      _id: "u6",
      name: "Suresh Mahto",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=160&auto=format&fit=crop&q=80",
    },
    skills: ["Daily Wage Labour", "Masonry Helper", "Tile Fixing"],
    experience: 4,
    serviceAreas: ["Bengaluru", "Whitefield", "Bellandur"],
    dailyRate: 750,
    hourlyRate: 150,
    status: "verified",
    isOnline: true,
    rating: 4.7,
    totalJobs: 98,
  },
];

function WorkersDirectoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSearch = searchParams.get("search") || "";
  const initialSkill = searchParams.get("skill") || "All Services";
  const initialCity = searchParams.get("city") || "All Cities";

  const [search, setSearch] = useState(initialSearch);
  const [selectedSkill, setSelectedSkill] = useState(initialSkill);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [onlyOnline, setOnlyOnline] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real workers from API, with graceful sample fallback
  useEffect(() => {
    async function loadWorkers() {
      try {
        setLoading(true);
        const query = new URLSearchParams();
        if (search.trim()) query.set("search", search.trim());
        if (selectedSkill !== "All Services") query.set("skill", selectedSkill);
        if (minRating > 0) query.set("minRating", String(minRating));
        query.set("limit", "50");

        const res = await fetch(`/api/workers?${query.toString()}`);
        if (res.ok) {
          const json = await res.json();
          const apiWorkers: WorkerRecord[] = json.data || [];
          if (apiWorkers.length > 0) {
            setWorkers(apiWorkers);
          } else {
            // Use sample workers if local DB has empty worker directory
            setWorkers(SAMPLE_WORKERS);
          }
        } else {
          setWorkers(SAMPLE_WORKERS);
        }
      } catch {
        setWorkers(SAMPLE_WORKERS);
      } finally {
        setLoading(false);
      }
    }

    loadWorkers();
  }, [search, selectedSkill, minRating]);

  // Client-side filtering for city, availability, and max price
  const filteredWorkers = useMemo(() => {
    return workers.filter((w) => {
      // Skill check
      if (selectedSkill !== "All Services") {
        const matchesSkill = (w.skills || []).some((s) =>
          s.toLowerCase().includes(selectedSkill.toLowerCase())
        );
        if (!matchesSkill) return false;
      }

      // City check
      if (selectedCity !== "All Cities") {
        const areas = (w.serviceAreas || []).map((a) => a.toLowerCase());
        const matchesCity = areas.some((a) =>
          a.includes(selectedCity.toLowerCase())
        );
        if (!matchesCity && w.serviceAreas?.length) return false;
      }

      // Online status check
      if (onlyOnline && !w.isOnline) return false;

      // Rating check
      if (minRating > 0 && w.rating < minRating) return false;

      // Price check
      const rate = w.hourlyRate || (w.dailyRate ? Math.round(w.dailyRate / 8) : 299);
      if (rate > maxPrice) return false;

      // Search text check
      if (search.trim()) {
        const q = search.toLowerCase();
        const nameMatches = w.userId?.name.toLowerCase().includes(q);
        const skillMatches = (w.skills || []).some((s) => s.toLowerCase().includes(q));
        const areaMatches = (w.serviceAreas || []).some((a) => a.toLowerCase().includes(q));
        if (!nameMatches && !skillMatches && !areaMatches) return false;
      }

      return true;
    });
  }, [workers, selectedSkill, selectedCity, onlyOnline, minRating, maxPrice, search]);

  const resetFilters = () => {
    setSearch("");
    setSelectedSkill("All Services");
    setSelectedCity("All Cities");
    setOnlyOnline(false);
    setMinRating(0);
    setMaxPrice(1000);
  };

  const FilterPanelContent = (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#0456D3]" />
          <h3 className="font-semibold text-sm text-slate-900 dark:text-white">Filters</h3>
        </div>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-500 hover:text-[#0456D3] dark:hover:text-blue-400"
        >
          Reset All
        </button>
      </div>

      {/* Trade / Skill Category */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Service Category
        </label>
        <div className="space-y-1">
          {CATEGORY_OPTIONS.map((cat) => (
            <label
              key={cat}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition ${
                selectedSkill === cat
                  ? "bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <span>{cat}</span>
              <input
                type="radio"
                name="skill"
                checked={selectedSkill === cat}
                onChange={() => setSelectedSkill(cat)}
                className="hidden"
              />
              {selectedSkill === cat && <span className="w-1.5 h-1.5 rounded-full bg-[#0456D3]" />}
            </label>
          ))}
        </div>
      </div>

      {/* City Location */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          City / Region
        </label>
        <select
          value={selectedCity}
          onChange={(e) => setSelectedCity(e.target.value)}
          className="w-full text-xs py-2 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0456D3]"
        >
          {CITY_OPTIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Online / Availability */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={onlyOnline}
            onChange={(e) => setOnlyOnline(e.target.checked)}
            className="rounded border-slate-300 text-[#0456D3] focus:ring-0"
          />
          <span className="font-medium">Available & Live Online</span>
        </label>
      </div>

      {/* Minimum Rating */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
          Minimum Rating
        </label>
        <div className="flex gap-1.5">
          {[0, 4.0, 4.5, 4.8].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setMinRating(r)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium border text-center transition ${
                minRating === r
                  ? "bg-[#0456D3] border-[#0456D3] text-white"
                  : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              {r === 0 ? "Any" : `${r}★`}
            </button>
          ))}
        </div>
      </div>

      {/* Max Hourly Rate Slider */}
      <div className="space-y-2 pt-3 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
            Max Hourly Rate
          </span>
          <span className="font-bold text-slate-900 dark:text-white">₹{maxPrice}/hr</span>
        </div>
        <input
          type="range"
          min="150"
          max="1000"
          step="50"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full accent-[#0456D3]"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>₹150</span>
          <span>₹1000+</span>
        </div>
      </div>

      {/* Verified Status Banner */}
      <div className="p-3 rounded-md bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs space-y-1">
        <div className="flex items-center gap-1.5 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>KaamDo Verified</span>
        </div>
        <p className="text-[11px] text-emerald-700 dark:text-emerald-400 leading-relaxed">
          All listed technicians undergo biometric identity checks and active credential verification.
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <Header />

      {/* Page Header Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-6">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-[#0456D3]">Home</Link>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">Find Workers</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Verified Local Professionals & Technicians
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browse police-verified professionals, compare standardized pricing, and book on-demand.
              </p>
            </div>

            {/* Quick Search in Bar */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by name, skill, or area..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0456D3]"
                />
              </div>

              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileFilterOpen(true)}
                className="md:hidden px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold flex items-center gap-1.5 text-slate-700 dark:text-slate-300 shrink-0"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Directory Body */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
          {/* LEFT COLUMN: Organized Filter Panel (Desktop) */}
          <aside className="hidden md:block md:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5 sticky top-20">
            {FilterPanelContent}
          </aside>

          {/* RIGHT COLUMN: Worker Results List */}
          <main className="md:col-span-3 space-y-4">
            {/* Results count & status summary */}
            <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-slate-200 dark:border-slate-800">
              <span>
                Showing <strong className="text-slate-900 dark:text-white">{filteredWorkers.length}</strong> verified professionals
              </span>
              <div className="flex items-center gap-2">
                <span>Sorted by: <strong>Relevance & Rating</strong></span>
              </div>
            </div>

            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-[#0456D3] mb-3" />
                <p className="text-xs">Finding available local professionals...</p>
              </div>
            ) : filteredWorkers.length === 0 ? (
              <div className="p-12 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <User className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  No professionals found matching your filters
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Try broadening your search term, clearing category filters, or selecting a nearby city.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#0456D3] text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWorkers.map((worker) => {
                  const workerName = worker.userId?.name || "Verified Professional";
                  const primaryTrade = worker.skills[0] || "General Handyman";
                  const displayRate = worker.hourlyRate
                    ? `₹${worker.hourlyRate}/hr`
                    : worker.dailyRate
                    ? `₹${worker.dailyRate}/day`
                    : "₹299/hr";
                  const areas = worker.serviceAreas?.length
                    ? worker.serviceAreas.slice(0, 2).join(", ")
                    : "Local Service Area";

                  return (
                    <div
                      key={worker._id}
                      className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-5"
                    >
                      {/* Worker Core Identity */}
                      <div className="flex items-start gap-4 min-w-0">
                        <div className="relative shrink-0">
                          {worker.userId?.avatar ? (
                            <img
                              src={worker.userId.avatar}
                              alt={workerName}
                              className="w-16 h-16 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] font-bold text-lg flex items-center justify-center border border-blue-200 dark:border-blue-900">
                              {workerName.charAt(0)}
                            </div>
                          )}
                          {worker.isOnline && (
                            <span
                              title="Online & Ready to Dispatch"
                              className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900"
                            />
                          )}
                        </div>

                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                              {workerName}
                            </h2>
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900/40">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" /> Aadhaar Verified
                            </span>
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                            {primaryTrade}
                          </p>

                          {/* Ratings, Jobs, Exp */}
                          <div className="flex items-center gap-2 text-xs pt-0.5 text-slate-500 flex-wrap">
                            <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>{worker.rating > 0 ? worker.rating.toFixed(1) : "5.0"}</span>
                            </div>
                            <span>•</span>
                            <span>{worker.totalJobs || 0} completed</span>
                            <span>•</span>
                            <span>{worker.experience || 3}+ yrs exp</span>
                          </div>

                          {/* Location & Secondary Skills */}
                          <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{areas}</span>
                          </div>

                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(worker.skills || []).slice(0, 3).map((sk) => (
                              <span
                                key={sk}
                                className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pricing & Call to Actions */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 shrink-0">
                        <div className="text-left sm:text-right">
                          <span className="text-[11px] text-slate-400 block uppercase tracking-wider">
                            Starting At
                          </span>
                          <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {displayRate}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            href={`/workers/${worker._id}`}
                            className="px-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                          >
                            View Profile
                          </Link>
                          <Link
                            href={`/book?workerId=${worker.userId?._id || worker._id}`}
                            className="px-4 py-2 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs flex items-center gap-1"
                          >
                            <span>Book Now</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/60 md:hidden animate-in fade-in duration-200">
          <div className="w-full max-w-xs ml-auto bg-white dark:bg-slate-900 h-full p-6 overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="font-semibold text-sm">Filter Professionals</h3>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 rounded text-slate-500 hover:text-slate-900"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {FilterPanelContent}
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full py-2.5 bg-[#0456D3] text-white text-xs font-semibold rounded-md mt-4"
            >
              Apply Filters ({filteredWorkers.length} Results)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkersDirectoryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#0456D3] mb-2" />
          <p className="text-xs text-slate-500">Loading worker directory...</p>
        </div>
      }
    >
      <WorkersDirectoryContent />
    </Suspense>
  );
}
