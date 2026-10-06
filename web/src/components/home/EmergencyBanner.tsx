import Link from "next/link";
import { AlertTriangle, PhoneCall } from "lucide-react";

export default function EmergencyBanner() {
  return (
    <section className="bg-gradient-to-r from-amber-500/10 via-red-500/10 to-amber-500/10 border-b border-amber-500/20 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-foreground flex items-center gap-2">
              <span>⚡ Urgent Home Emergency? Power blackout, burst water pipe, or short circuit?</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Priority SOS dispatch arrives in &lt;25 minutes with verified rapid-response technicians.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/book?urgency=emergency"
            className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            Emergency SOS Booking
          </Link>
          <a
            href="tel:9876543210"
            className="px-3 py-2 rounded-lg border border-border bg-card hover:bg-muted text-foreground text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-primary" />
            <span>+91 98765 43210</span>
          </a>
        </div>
      </div>
    </section>
  );
}
