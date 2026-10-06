import { Home as HomeIcon, Users, Building2, Briefcase, Check } from "lucide-react";

const USE_CASES = [
  {
    title: "Homeowners & Families",
    icon: HomeIcon,
    tagline: "Zero safety compromises for your family",
    description: "Every technician entering your home is biometric Aadhaar verified with judicial background clearance. Receive arrival and completion OTPs with digital ID photo verification.",
    highlights: ["Photo ID check at doorstep", "Itemized parts billing approval", "Clean work area post completion"],
  },
  {
    title: "Tenants & Flat Renters",
    icon: Users,
    tagline: "Fast move-in and hand-over fixes",
    description: "Hang curtains, mount TVs, repair faulty switchboards, or fix bathroom fittings quickly with standardized hourly or fixed rates. No arbitrary roadside bargaining.",
    highlights: ["Same-day emergency arrival", "Digital receipt for landlord claims", "Transparent rate cards"],
  },
  {
    title: "Gated Societies & RWAs",
    icon: Building2,
    tagline: "Audited workforce for society gates",
    description: "Security gate-friendly records. Guards can verify job OTP and technician credentials directly through the app, ensuring peace of mind for the entire residential community.",
    highlights: ["Centralized contractor registry", "Scheduled maintenance batches", "Verified service logs"],
  },
  {
    title: "Retail & Commercial Spaces",
    icon: Briefcase,
    tagline: "Dedicated technicians on business SLAs",
    description: "Keep shops, clinics, cafes, and offices operating smoothly with swift HVAC repairs, commercial lighting fixes, and dependable daily wage assistance.",
    highlights: ["GST-compliant tax invoices", "Priority dispatch desk", "Multi-site coverage"],
  },
];

export default function UseCases() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Tailored Solutions
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Built for residences, societies, and businesses
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Whether you need a quick home switchboard fix or regular maintenance for a commercial complex.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {USE_CASES.map((uc) => {
          const Icon = uc.icon;
          return (
            <div
              key={uc.title}
              className="p-6 rounded-2xl bg-card border border-border hover:border-primary/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-base text-foreground">{uc.title}</h3>
                <p className="text-xs font-semibold text-primary mt-0.5">{uc.tagline}</p>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {uc.description}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-border space-y-1.5">
                {uc.highlights.map((h) => (
                  <div key={h} className="flex items-center gap-1.5 text-[11px] text-foreground">
                    <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
