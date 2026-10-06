import { Check, X } from "lucide-react";

const COMPARISON_ROWS = [
  {
    feature: "Identity & Background Check",
    kaamdo: "100% Aadhaar Biometric & Police Cleared",
    local: "Unverified / Unknown background",
    aggregator: "Basic phone number OTP check only",
  },
  {
    feature: "Pricing Transparency",
    kaamdo: "Standardized itemized rate cards upfront",
    local: "Arbitrary verbal quotes & bargaining",
    aggregator: "High surge pricing during peak hours",
  },
  {
    feature: "Parts & Hardware Replacement",
    kaamdo: "Customer must approve quote before purchase",
    local: "Hidden margins added without receipts",
    aggregator: "Bundled into generic expensive packages",
  },
  {
    feature: "Security Protocols",
    kaamdo: "Dual-OTP (Start OTP + Completion OTP)",
    local: "None (Cash handovers with no record)",
    aggregator: "Single confirmation SMS only",
  },
  {
    feature: "Rework Warranty",
    kaamdo: "7-Day Free Corrective Rework Guarantee",
    local: "Zero warranty once worker leaves",
    aggregator: "Lengthy multi-day support ticket review",
  },
];

export default function ComparisonMatrix() {
  return (
    <section className="py-16 sm:py-20 bg-muted/20 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Objective Comparison
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            Why homeowners choose KaamDo
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            How our vetted, OTP-secured platform compares to roadside unverified workers and high-commission aggregator apps.
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-2xl border border-border bg-card shadow-xs">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-3.5 px-6 font-bold text-foreground">Key Feature</th>
                <th className="py-3.5 px-6 font-bold text-primary bg-primary/5">
                  KaamDo Platform
                </th>
                <th className="py-3.5 px-6 font-medium text-muted-foreground">Local Unverified Worker</th>
                <th className="py-3.5 px-6 font-medium text-muted-foreground">Generic Aggregators</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature} className="hover:bg-muted/30 transition-colors">
                  <td className="py-3.5 px-6 font-semibold text-foreground">
                    {row.feature}
                  </td>
                  <td className="py-3.5 px-6 font-medium text-foreground bg-primary/5">
                    <div className="flex items-center gap-1.5 text-primary font-bold">
                      <Check className="w-4 h-4 text-primary shrink-0" />
                      <span>{row.kaamdo}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <X className="w-4 h-4 text-destructive shrink-0" />
                      <span>{row.local}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-6 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[10px] shrink-0">•</span>
                      <span>{row.aggregator}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Accordion/Cards View */}
        <div className="md:hidden space-y-4">
          {COMPARISON_ROWS.map((row) => (
            <div key={row.feature} className="p-4 rounded-xl border border-border bg-card space-y-2.5">
              <p className="font-bold text-xs text-foreground">{row.feature}</p>
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2 text-xs text-primary font-semibold">
                <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary block">KaamDo</span>
                  <span>{row.kaamdo}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-1">
                <div className="p-2 rounded-lg bg-muted/40">
                  <span className="font-bold text-[10px] text-foreground block">Roadside Worker</span>
                  <span>{row.local}</span>
                </div>
                <div className="p-2 rounded-lg bg-muted/40">
                  <span className="font-bold text-[10px] text-foreground block">Aggregator Apps</span>
                  <span>{row.aggregator}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
