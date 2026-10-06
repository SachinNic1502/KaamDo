import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-card border-t border-border py-14 text-muted-foreground text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-12">
        {/* Top Footer Strip: Brand + Status */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-border">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/logo/horizontal-logo.png"
              alt="KaamDo Logo"
              width={140}
              height={42}
              className="h-7 w-auto object-contain dark:hidden"
            />
            <Image
              src="/logo-white.png"
              alt="KaamDo Logo"
              width={140}
              height={42}
              className="h-7 w-auto object-contain hidden dark:block"
            />
          </Link>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-xs border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational
            </span>
            <p className="text-xs text-muted-foreground hidden md:inline">
              Har Kaam, Sahi Insaan
            </p>
          </div>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="space-y-3">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Services by Trade
            </p>
            <ul className="space-y-2">
              <li><Link href="/services?category=electrical" className="hover:text-foreground transition-colors">Electricians</Link></li>
              <li><Link href="/services?category=plumbing" className="hover:text-foreground transition-colors">Plumbers</Link></li>
              <li><Link href="/services?category=appliances" className="hover:text-foreground transition-colors">AC & Appliances</Link></li>
              <li><Link href="/services?category=carpentry" className="hover:text-foreground transition-colors">Carpenters</Link></li>
              <li><Link href="/services?category=painting" className="hover:text-foreground transition-colors">Painters</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Marketplace
            </p>
            <ul className="space-y-2">
              <li><Link href="/workers" className="hover:text-foreground transition-colors">Find Workers Directory</Link></li>
              <li><Link href="/services" className="hover:text-foreground transition-colors">All Rate Cards</Link></li>
              <li><Link href="/book" className="hover:text-foreground transition-colors">Post a Service Job</Link></li>
              <li><Link href="/apps" className="hover:text-foreground text-primary font-semibold transition-colors">Mobile Apps (.APK)</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">How It Works</Link></li>
              <li><Link href="/admin" className="hover:text-foreground transition-colors">Admin Operations</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Service Partners
            </p>
            <ul className="space-y-2">
              <li><Link href="/login" className="hover:text-foreground transition-colors">Join as Professional</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Worker Partner Login</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Aadhaar KYC Desk</Link></li>
              <li><Link href="/login" className="hover:text-foreground transition-colors">Weekly Payout Ledger</Link></li>
              <li><Link href="/apps" className="hover:text-foreground transition-colors">Partner Android App</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Trust & Safety
            </p>
            <ul className="space-y-2">
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">Biometric KYC Check</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">Dual-OTP Protection</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-foreground transition-colors">7-Day Rework Warranty</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">Dispute Resolution</Link></li>
              <li><Link href="/#faq" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div className="space-y-3 col-span-2 sm:col-span-1">
            <p className="font-bold text-foreground text-xs uppercase tracking-wider">
              Corporate Office
            </p>
            <div className="space-y-1.5 leading-relaxed text-muted-foreground">
              <p className="font-medium text-foreground">KaamDo Technologies Pvt Ltd</p>
              <p>8th Block, Koramangala</p>
              <p>Bengaluru, Karnataka 560034</p>
              <p className="pt-2 text-foreground font-semibold">Support Helpline:</p>
              <p>+91 98765 43210</p>
              <p>support@kaamdo.in</p>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs">
          <p>© 2026 KaamDo Technologies Pvt Ltd. All rights reserved.</p>
          <p className="text-muted-foreground/80">
            Crafted for India&apos;s Skilled Trades • <span className="text-primary font-semibold">Har Kaam, Sahi Insaan</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
