import { Star, CheckCircle2 } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Priya Deshmukh",
    role: "Homeowner",
    city: "Indiranagar, Bengaluru",
    service: "AC Servicing & Gas Refill",
    rating: 5,
    quote: "The AC technician arrived in 22 minutes, showed his digital ID on the app, and walked me through the filter inspection before touching anything. The OTP payment meant I only approved once cooling was verified.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80",
    verifiedBadge: "Verified Customer • Completed Oct 2026",
  },
  {
    name: "Rajesh Kulkarni",
    role: "Apartment Resident",
    city: "Kothrud, Pune",
    service: "Plumbing Pipe Replacement",
    rating: 5,
    quote: "Our bathroom main inlet burst on a Sunday morning. The KaamDo plumber brought standard PVC fittings, added the exact hardware cost with the bill attached, and charged the standard rate. Truly reliable.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80",
    verifiedBadge: "Verified Customer • Completed Oct 2026",
  },
  {
    name: "Amit Sen",
    role: "Property Manager",
    city: "Sector 62, Noida",
    service: "Switchboard & Wiring Overhaul",
    rating: 5,
    quote: "We use KaamDo for our rented studio apartments. The technicians are prompt, courteous, and the rate card eliminates any disputes with tenants. Best service platform we have used in NCR.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80",
    verifiedBadge: "Verified Customer • Completed Oct 2026",
  },
];

export default function TestimonialsSection() {
  return (
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

            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex items-center gap-3">
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
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.verifiedBadge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
