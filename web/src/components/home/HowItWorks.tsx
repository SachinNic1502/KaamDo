export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 bg-muted/20 border-y border-border" id="how-it-works">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="max-w-2xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-primary">
            Transparent Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
            How KaamDo connects you with the right pro
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Three clear steps with full accountability, live tracking, and digital escrow protection.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              01
            </div>
            <h3 className="font-bold text-base text-foreground">
              Choose Service & Time
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Select your required trade, describe the issue, and pick a convenient date or request emergency arrival within 30 minutes.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              02
            </div>
            <h3 className="font-bold text-base text-foreground">
              OTP-Secured Arrival
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              A verified local technician is dispatched. Check their digital photo ID and share your arrival OTP only when they arrive at your location.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border space-y-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              03
            </div>
            <h3 className="font-bold text-base text-foreground">
              Inspect & Release
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Inspect the completed repair. Share the completion OTP to release payment securely. Backed by KaamDo&apos;s 7-day rework guarantee.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
