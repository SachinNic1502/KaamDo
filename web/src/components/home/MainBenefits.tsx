import { BadgePercent, ShieldCheck, Award } from "lucide-react";

export default function MainBenefits() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Built For Trust
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Fixing what&apos;s broken with home service marketplaces
        </h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          No endless bargaining on street corners. No unverified strangers entering your family residence. KaamDo delivers full accountability from dispatch to payment release.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <BadgePercent className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Standardized Itemized Rates</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Every job begins with an official rate card. If extra parts are required, the worker itemizes each part in-app, requiring your digital approval before purchase.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">Biometric Photo ID Check</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Never wonder who is knocking. Check their digital photo ID and police clearance status on your phone, then verify using the 4-digit doorstep Arrival OTP.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-foreground">7-Day Free Rework Guarantee</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If an electrical switch fails or a plumbing fitting leaks again within 7 days, request a rework from your dashboard. A verified pro returns at zero extra charge.
          </p>
        </div>
      </div>
    </section>
  );
}
