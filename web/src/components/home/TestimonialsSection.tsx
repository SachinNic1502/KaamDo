"use client";

import { useEffect, useState } from "react";
import { Star, CheckCircle2, ShieldCheck } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  city: string;
  service: string;
  rating: number;
  quote: string;
  avatar: string;
  badge: string;
}

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadTestimonials() {
      try {
        const res = await fetch("/api/platform/social-proof");
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.data?.testimonials?.length > 0) {
            setTestimonials(json.data.testimonials);
          }
        }
      } catch {
        // Fallback
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadTestimonials();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!loading && testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Verified Reviews & Partner Stories
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Authentic Experiences from Verified KaamDo Members
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Real feedback from homeowners, renters, and verified service professionals on the network.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((t) => (
          <div
            key={t.id || t.name}
            className="p-6 rounded-2xl bg-card border border-border flex flex-col justify-between space-y-4 hover:border-primary/40 transition-colors"
          >
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500">
                {[...Array(Math.floor(t.rating || 5))].map((_, i) => (
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
                  className="w-10 h-10 rounded-full object-cover border border-border shrink-0 bg-primary/10"
                />
                <div>
                  <h4 className="text-xs font-bold text-foreground">{t.name}</h4>
                  <p className="text-[11px] text-muted-foreground">{t.role} • {t.city}</p>
                  <span className="text-[10px] text-primary font-semibold">{t.service}</span>
                </div>
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1 pt-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>{t.badge}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
