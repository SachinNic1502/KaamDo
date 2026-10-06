import Link from "next/link";
import { Sparkles, Smartphone } from "lucide-react";

export default function CtaBanner() {
  return (
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
  );
}
