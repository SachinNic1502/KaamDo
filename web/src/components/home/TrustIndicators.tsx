import { ShieldCheck, Award, BadgePercent, PhoneCall } from "lucide-react";

export default function TrustIndicators() {
  return (
    <section className="py-8 bg-muted/20 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <p className="text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">
          Operating under India&apos;s most stringent workforce verification standards
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
          <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span className="text-xs font-semibold text-foreground">Aadhaar Biometric KYC</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
            <Award className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-semibold text-foreground">Police Background Checked</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
            <BadgePercent className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="text-xs font-semibold text-foreground">Standard Fixed Rate Cards</span>
          </div>
          <div className="p-3.5 rounded-xl border border-border bg-card/60 flex items-center justify-center gap-2.5">
            <PhoneCall className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-xs font-semibold text-foreground">7-Day Free Rework Warranty</span>
          </div>
        </div>
      </div>
    </section>
  );
}
