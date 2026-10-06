export default function EscrowSecurityProtocol() {
  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full">
      <div className="max-w-2xl mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Escrow Security
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          How your money & home remain 100% safe
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Payment is never handed to a stranger upfront. Funds stay protected in digital escrow until you inspect and approve the repair.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            01
          </div>
          <h3 className="font-bold text-base text-foreground">Escrow Reservation</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            When booking, your service amount is safely reserved in digital escrow. The technician does NOT receive payment upfront.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            02
          </div>
          <h3 className="font-bold text-base text-foreground">Arrival OTP Verification</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Technician reaches your doorstep. You check their digital photo ID on your screen and share the Arrival OTP to initiate the timer.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            03
          </div>
          <h3 className="font-bold text-base text-foreground">Parts Approval in App</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            If spare parts are needed, the worker uploads the store receipt. You must review and digitally authorize the cost before purchase.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-card border border-border space-y-3 relative">
          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
            04
          </div>
          <h3 className="font-bold text-base text-foreground">Inspection & Release OTP</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Inspect the completed repair. Only when satisfied, share the Completion OTP to release funds. Backed by our 7-day rework guarantee.
          </p>
        </div>
      </div>
    </section>
  );
}
