import Link from "next/link";
import {
  ChevronRight,
  Zap,
  Droplets,
  Hammer,
  Paintbrush,
  Wrench,
  Sparkles,
  HardHat,
  Layers,
} from "lucide-react";
import { Category } from "./types";

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

interface ServiceCatalogProps {
  categories: Category[];
  loading: boolean;
}

export default function ServiceCatalog({ categories, loading }: ServiceCatalogProps) {
  return (
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
              Transparent base pricing. Zero surge multipliers. Click any service chip to instantly start booking.
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading && categories.length === 0 ? (
            [...Array(6)].map((_, i) => (
              <div key={i} className="p-5 rounded-xl bg-card border border-border animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-lg bg-muted" />
                  <div className="w-16 h-4 rounded bg-muted" />
                </div>
                <div className="space-y-2">
                  <div className="w-24 h-4 rounded bg-muted" />
                  <div className="w-full h-3 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : (
            categories.map((cat, catIdx) => {
              const Icon = getCategoryIcon(cat.slug, cat.name);
              const minPrice = cat.subcategories?.length
                ? Math.min(...cat.subcategories.map((s) => s.basePrice || 199))
                : 199;

              return (
                <div
                  key={cat._id || cat.slug || `cat-${catIdx}`}
                  className="p-5 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-bold text-foreground bg-muted px-2.5 py-1 rounded-md">
                        From ₹{minPrice}
                      </span>
                    </div>

                    <h3 className="font-bold text-base text-foreground">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {cat.description || "Standard verified trade service."}
                    </p>

                    {/* Quick-Action Subcategory Chips */}
                    {cat.subcategories && cat.subcategories.length > 0 && (
                      <div className="mt-4 pt-3 border-t border-border space-y-2">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                          Popular Quick Fixes:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cat.subcategories.slice(0, 3).map((sub, subIdx) => (
                            <Link
                              key={sub._id || `${cat.slug || catIdx}-${sub.name || subIdx}`}
                              href={`/book?category=${cat.slug}&service=${encodeURIComponent(sub.name)}`}
                              className="px-2 py-1 rounded-md bg-muted/60 hover:bg-primary hover:text-primary-foreground text-[11px] font-medium text-foreground transition-colors border border-border/70"
                            >
                              {sub.name} • ₹{sub.basePrice}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mt-5 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                    <span>{cat.subcategories?.length || 0} Standard Services</span>
                    <Link
                      href={`/workers?skill=${encodeURIComponent(cat.name)}`}
                      className="text-primary font-medium hover:underline flex items-center gap-0.5"
                    >
                      <span>View Pros</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
