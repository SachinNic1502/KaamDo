import Link from "next/link";
import { Smartphone, HardHat, CheckCircle2, Download, ChevronRight } from "lucide-react";

export default function MobileAppsShowcase() {
  return (
    <section className="py-16 bg-muted/20 border-y border-border" id="download-apps">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Mobile Ecosystem
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
              Install KaamDo Android Mobile Apps
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl">
              Real-time proximity dispatch, live GPS navigation, in-app technician chat, and instant payouts. Download the .APK or scan with your phone.
            </p>
          </div>
          <Link
            href="/apps"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 shrink-0"
          >
            <span>View installation guide & details</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer App Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-primary/60 transition-colors shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
                  <Smartphone className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">
                  For Customers
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">KaamDo Customer App</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Book verified local technicians, track them in real time on GPS radar, chat in-app, and confirm completions with secure 4-digit OTP.
              </p>

              {/* QR Code and Feature list row */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Live GPS radar tracking of technicians</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Transparent rate cards & approval</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                    <span>Razorpay UPI & wallet payments</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="sm:col-span-4 p-2.5 rounded-xl border border-border bg-background flex flex-col items-center justify-center text-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://kaam-do-mauve.vercel.app/downloads/kaamdo-customer.apk"
                    alt="Scan to download Customer APK"
                    className="w-20 h-20 rounded"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium">Scan to Install</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
              <a
                href="/downloads/kaamdo-customer.apk"
                download="kaamdo-customer.apk"
                className="flex-1 py-2.5 px-4 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Customer APK (86 MB)</span>
              </a>
              <Link
                href="/apps"
                className="py-2.5 px-3 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
              >
                Details
              </Link>
            </div>
          </div>

          {/* Partner / Worker App Card */}
          <div className="bg-card border border-border rounded-2xl p-6 sm:p-7 flex flex-col justify-between hover:border-amber-500/60 transition-colors shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-[#831843] text-amber-400 flex items-center justify-center">
                  <HardHat className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  For Technicians & Partners
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground">KaamDo Partner App</h3>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Claim local job leads within 10km, stream live navigation, submit extra labor & hardware parts, and request instant bank payouts.
              </p>

              {/* QR Code and Feature list row */}
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                <div className="sm:col-span-8 space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Instant proximity broadcast & leads</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Digital KYC & weekly bank payouts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Onsite extra parts receipt submission</span>
                  </div>
                </div>

                {/* QR Code */}
                <div className="sm:col-span-4 p-2.5 rounded-xl border border-border bg-background flex flex-col items-center justify-center text-center">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://kaam-do-mauve.vercel.app/downloads/kaamdo-partner.apk"
                    alt="Scan to download Partner APK"
                    className="w-20 h-20 rounded"
                  />
                  <span className="text-[10px] text-muted-foreground mt-1 font-medium">Scan to Install</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
              <a
                href="/downloads/kaamdo-partner.apk"
                download="kaamdo-partner.apk"
                className="flex-1 py-2.5 px-4 rounded-lg bg-[#831843] hover:bg-[#701338] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Partner APK (86 MB)</span>
              </a>
              <Link
                href="/apps"
                className="py-2.5 px-3 rounded-lg border border-border hover:bg-muted text-foreground text-xs font-medium transition-colors"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
