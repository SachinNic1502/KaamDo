import Link from "next/link";
import { Star, CheckCircle2, ChevronRight, MapPin } from "lucide-react";
import { WorkerRecord } from "./types";

interface VerifiedWorkersSpotlightProps {
  workers: WorkerRecord[];
  loading: boolean;
}

export default function VerifiedWorkersSpotlight({ workers, loading }: VerifiedWorkersSpotlightProps) {
  return (
    <section className="py-16 sm:py-20 bg-muted/20 border-y border-border" id="workers">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
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
                  </div>
                </div>
                <div className="pt-3 border-t border-border flex justify-between">
                  <div className="w-20 h-3 rounded bg-muted" />
                  <div className="w-14 h-4 rounded bg-muted" />
                </div>
              </div>
            ))
          ) : (
            workers.map((w, idx) => {
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
                  key={w._id || `worker-${idx}`}
                  className="rounded-2xl bg-card border border-border p-6 flex flex-col justify-between hover:border-primary/40 transition-colors"
                >
                  <div>
                    <div className="flex items-start gap-4">
                      <div className="relative shrink-0">
                        <img
                          src={workerAvatar}
                          alt={workerName}
                          className="w-14 h-14 rounded-full object-cover border border-border"
                        />
                        {w.isOnline && (
                          <span
                            className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-background rounded-full"
                            title="Available Online Now"
                          />
                        )}
                      </div>

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
                      <span className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-muted text-muted-foreground border border-border">
                        ⚡ Responds &lt; 15 mins
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
      </div>
    </section>
  );
}
