import Link from "next/link";
import {
  Smartphone,
  HardHat,
  Download,
  ChevronRight,
  Radio,
  Receipt,
  ShieldCheck,
  CreditCard,
  Zap,
  Navigation,
  Landmark,
  QrCode,
  CheckCircle2,
  Sparkles,
  ArrowDownToLine,
  Shield,
  FileCheck2,
} from "lucide-react";

export default function MobileAppsShowcase() {
  return (
    <section className="py-16 sm:py-20 bg-muted/20 border-y border-border" id="download-apps">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Native Android Ecosystem</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
              Install KaamDo Mobile Applications
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-xl leading-relaxed">
              Real-time proximity dispatch, live GPS radar navigation, in-app technician chat, and instant bank settlements. Scan the QR code or install the direct .APK.
            </p>
          </div>
          <Link
            href="/apps"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1.5 shrink-0 self-start md:self-auto bg-card border border-border px-3.5 py-2 rounded-lg hover:bg-muted transition-colors"
          >
            <span>Installation guide & release notes</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Dual App Showcase Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 1. CUSTOMER APP CARD */}
          <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-primary/60 transition-all shadow-sm hover:shadow-md group">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                      For Homeowners & Renters
                    </span>
                    <h3 className="text-xl font-bold text-foreground">KaamDo Customer App</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20 shrink-0">
                  v2.4.0 • Android 8.0+
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Book verified local tradesmen in 60 seconds, track technician arrival live on radar, chat in real time, and securely release payment via 4-digit OTP.
              </p>

              {/* Feature List with Proper Contextual Icons + QR Code Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-2 items-center">
                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                      <Radio className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Live GPS Radar Tracking</strong>
                      <span>Monitor technician transit with real-time ETA updates.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Doorstep Dual-OTP Safety</strong>
                      <span>Photo ID check at arrival & payment released only on inspection.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Receipt className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Standard Rate Cards</strong>
                      <span>Zero hidden fees with in-app digital parts quote approval.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <CreditCard className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Escrow UPI & Cards</strong>
                      <span>Seamless online payment held in escrow until job sign-off.</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="sm:col-span-5 p-3.5 rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center text-center">
                  <div className="relative p-2 bg-background rounded-lg border border-border shadow-2xs">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://kaam-do-mauve.vercel.app/downloads/kaamdo-customer.apk"
                      alt="Scan to download Customer APK"
                      className="w-24 h-24 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground mt-2">
                    <QrCode className="w-3.5 h-3.5 text-primary" />
                    <span>Scan to Install</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Direct APK download</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="/downloads/kaamdo-customer.apk"
                download="kaamdo-customer.apk"
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Download Customer APK</span>
                <span className="text-[11px] font-normal opacity-85 px-1.5 py-0.5 rounded bg-black/20">86 MB</span>
              </a>
              <Link
                href="/apps"
                className="py-3 px-4 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold text-center transition-colors"
              >
                App Details
              </Link>
            </div>
          </div>

          {/* 2. PARTNER / TECHNICIAN APP CARD */}
          <div className="relative bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col justify-between hover:border-amber-500/60 transition-all shadow-sm hover:shadow-md group">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <HardHat className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                      For Technicians & Tradesmen
                    </span>
                    <h3 className="text-xl font-bold text-foreground">KaamDo Partner App</h3>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                  v2.4.0 • Pro Edition
                </span>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                Receive instant local service requests within 10 km, navigate directly with GPS, add replacement hardware receipts on site, and enjoy guaranteed payouts.
              </p>

              {/* Feature List with Proper Contextual Icons + QR Code Box */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 pt-2 items-center">
                <div className="sm:col-span-7 space-y-3">
                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Zap className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Instant Proximity Dispatch</strong>
                      <span>Broadcast alerts within 10km radius with 1-tap acceptance.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Navigation className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Turn-by-Turn Navigation</strong>
                      <span>Built-in navigation map directly to customer&apos;s doorstep.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FileCheck2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Onsite Parts Receipt Billing</strong>
                      <span>Upload hardware store bills for digital customer approval.</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                    <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Landmark className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <strong className="text-foreground font-semibold block text-[13px]">Weekly Bank Payouts</strong>
                      <span>Direct bank transfer or UPI payments with full transparency.</span>
                    </div>
                  </div>
                </div>

                {/* QR Code Card */}
                <div className="sm:col-span-5 p-3.5 rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center text-center">
                  <div className="relative p-2 bg-background rounded-lg border border-border shadow-2xs">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=https://kaam-do-mauve.vercel.app/downloads/kaamdo-partner.apk"
                      alt="Scan to download Partner APK"
                      className="w-24 h-24 rounded"
                    />
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-foreground mt-2">
                    <QrCode className="w-3.5 h-3.5 text-amber-500" />
                    <span>Scan to Install</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground">Direct APK download</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-8 pt-5 border-t border-border flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <a
                href="/downloads/kaamdo-partner.apk"
                download="kaamdo-partner.apk"
                className="flex-1 py-3 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Download Partner APK</span>
                <span className="text-[11px] font-normal opacity-85 px-1.5 py-0.5 rounded bg-black/20">86 MB</span>
              </a>
              <Link
                href="/apps"
                className="py-3 px-4 rounded-xl border border-border hover:bg-muted text-foreground text-xs font-semibold text-center transition-colors"
              >
                App Details
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

