"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/header/Header";
import {
  Search,
  Sparkles,
  ShieldCheck,
  Clock,
  ArrowRight,
  Filter,
  CheckCircle2,
  Wrench,
  Zap,
  Droplet,
  Hammer,
  Paintbrush,
  Wind,
  Layers,
  ChevronRight,
} from "lucide-react";

interface Subcategory {
  _id: string;
  name: string;
  description?: string;
  basePrice: number;
  pricingModel: "fixed" | "hourly" | "visit";
  estimatedDuration?: number;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  subcategories: Subcategory[];
  isActive: boolean;
}

const categoryIcons: Record<string, any> = {
  electrician: Zap,
  electrical: Zap,
  plumbing: Droplet,
  plumber: Droplet,
  carpentry: Hammer,
  carpenter: Hammer,
  painting: Paintbrush,
  "ac-repair": Wind,
  appliances: Wind,
  ac: Wind,
  cleaning: Sparkles,
  construction: Layers,
};

export default function ServicesCatalogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [pricingFilter, setPricingFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true);
        const res = await fetch("/api/categories?limit=50");
        if (res.ok) {
          const json = await res.json();
          setCategories(json.data || []);
        }
      } catch (err) {
        console.error("Failed to load service categories:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Flattened and filtered list of all active subcategories
  const filteredServices = useMemo(() => {
    const list: {
      category: Category;
      subcategory: Subcategory;
    }[] = [];

    categories.forEach((cat) => {
      if (selectedCategory !== "all" && cat.slug !== selectedCategory && cat.name !== selectedCategory) {
        return;
      }
      (cat.subcategories || []).forEach((sub) => {
        if (!sub.isActive) return;

        if (pricingFilter !== "all" && sub.pricingModel !== pricingFilter) {
          return;
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSub =
            sub.name.toLowerCase().includes(q) ||
            (sub.description && sub.description.toLowerCase().includes(q));
          const matchCat = cat.name.toLowerCase().includes(q);
          if (!matchSub && !matchCat) return;
        }

        list.push({ category: cat, subcategory: sub });
      });
    });

    return list;
  }, [categories, selectedCategory, pricingFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased">
      <Header />

      {/* Catalog Header Strip */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                <Link href="/" className="hover:text-[#0456D3]">Home</Link>
                <span>/</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">Services & Rate Cards</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                Official Marketplace Rate Cards & Services
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                Standardized base rates for verified electricians, plumbers, carpenters, and technicians. Zero surprise surge pricing.
              </p>
            </div>

            {/* Quick Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by trade or task..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#0456D3]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Catalog Workspace */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Filter Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === "all"
                  ? "bg-[#0456D3] text-white"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              All Trades ({categories.length})
            </button>
            {categories.map((cat) => {
              const Icon = categoryIcons[cat.slug] || Wrench;
              return (
                <button
                  key={cat._id}
                  onClick={() => setSelectedCategory(cat.slug)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition ${
                    selectedCategory === cat.slug
                      ? "bg-[#0456D3] text-white"
                      : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Pricing Model Filter */}
          <div className="flex items-center gap-2 shrink-0 text-xs">
            <span className="text-slate-500 font-medium">Pricing:</span>
            <select
              value={pricingFilter}
              onChange={(e) => setPricingFilter(e.target.value)}
              className="py-1.5 px-2.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#0456D3]"
            >
              <option value="all">All Models</option>
              <option value="fixed">Fixed Rate</option>
              <option value="visit">Inspection / Visit</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-900 dark:text-white">{filteredServices.length}</strong> standardized service items
          </span>
          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Standard 7-Day Guarantee
          </span>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-44 rounded-lg bg-slate-100 dark:bg-slate-800/60 animate-pulse" />
            ))}
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="p-12 text-center rounded-lg border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
            <Search className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">No services matched your query</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms or selecting &quot;All Trades&quot; to see available service offerings.
            </p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setPricingFilter("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-[#0456D3] text-white text-xs font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {filteredServices.map(({ category, subcategory }, idx) => {
              const Icon = categoryIcons[category.slug] || Wrench;
              return (
                <div
                  key={`${category._id || category.slug}-${subcategory._id || subcategory.name}-${idx}`}
                  className="p-5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Category Badge & Pricing */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                        <Icon className="w-3 h-3 text-[#0456D3]" />
                        {category.name}
                      </span>
                      <div className="text-right">
                        <div className="text-base font-bold text-slate-900 dark:text-white">
                          ₹{subcategory.basePrice}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium uppercase">
                          {subcategory.pricingModel === "fixed"
                            ? "Fixed Quote"
                            : subcategory.pricingModel === "visit"
                            ? "Inspection Visit"
                            : "Per Hour"}
                        </div>
                      </div>
                    </div>

                    {/* Title & Description */}
                    <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1.5">
                      {subcategory.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {subcategory.description ||
                        `Standard ${category.name.toLowerCase()} service with verified tools, background check, and post-service warranty.`}
                    </p>

                    {/* Meta info: duration & guarantee */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-3 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {subcategory.estimatedDuration || 60} mins approx.
                      </span>
                      <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Covered
                      </span>
                    </div>
                  </div>

                  {/* Booking CTA Button */}
                  <Link
                    href={`/book?category=${category._id}&sub=${subcategory._id}`}
                    className="w-full py-2 px-3 rounded-md bg-[#0456D3] hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-xs"
                  >
                    <span>Book Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
