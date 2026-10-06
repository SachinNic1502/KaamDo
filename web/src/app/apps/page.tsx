"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/header/Header";
import {
  Smartphone,
  Download,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  QrCode,
  Users,
  Briefcase,
  HardHat,
  ChevronRight,
  ArrowLeft,
} from "lucide-react";

export default function AppsDownloadPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Header />

      {/* Breadcrumb Strip */}
      <div className="border-b border-border bg-muted/20 py-4">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span>/</span>
            <span className="text-foreground font-semibold">Mobile Apps</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-border bg-gradient-to-b from-muted/30 via-background to-background pt-12 pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Official Android APK Packages</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Download KaamDo for Android
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Experience real-time proximity dispatch, live GPS technician tracking, direct in-app messaging, and dual-OTP payment security on your mobile phone.
          </p>
        </div>
      </section>

      {/* Two Apps Showcase Cards */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          
          {/* 1. Customer App Card */}
          <div className="bg-card border border-border rounded-2xl p-7 flex flex-col justify-between hover:border-primary/60 transition-colors shadow-xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                  <Smartphone className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs border border-primary/20">
                  For Homeowners & Customers
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">
                  KaamDo Customer App
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Book verified electricians, plumbers, carpenters & AC technicians at fixed standardized rate cards.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Live GPS radar tracking of technicians en route</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Direct in-app messaging & media photo sharing</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Secure 4-digit start and completion OTP protection</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span>Itemized pricing with customer approval on extra parts</span>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-4 border border-border text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-semibold text-foreground">v1.0.0 Stable</span>
                </div>
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-mono text-foreground">com.kaamdo.customer</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-semibold text-foreground">Universal Android APK (.apk)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/downloads/kaamdo-customer.apk"
                download="kaamdo-customer.apk"
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download Customer APK</span>
              </a>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Compatible with Android 8.0 and above
              </p>
            </div>
          </div>

          {/* 2. Worker / Partner App Card */}
          <div className="bg-card border border-border rounded-2xl p-7 flex flex-col justify-between hover:border-amber-500/60 transition-colors shadow-xs">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-[#831843] text-amber-400 flex items-center justify-center shadow-xs">
                  <HardHat className="w-8 h-8" />
                </div>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-xs border border-amber-500/20">
                  For Workers & Contractors
                </span>
              </div>

              <div>
                <h2 className="text-xl font-bold text-foreground">
                  KaamDo Partner App
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1 leading-relaxed">
                  Regal Burgundy & Gold mobile workstation for certified tradesmen and contractors.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Instant proximity broadcast & lead claiming</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Background GPS location streaming & client navigation</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Itemize extra labor & hardware parts on site</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-foreground">
                  <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Aadhaar/PAN document KYC desk & instant payout tracking</span>
                </div>
              </div>

              <div className="bg-muted/40 rounded-xl p-4 border border-border text-xs text-muted-foreground space-y-1.5">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-semibold text-foreground">v1.0.0 Partner Stable</span>
                </div>
                <div className="flex justify-between">
                  <span>Package:</span>
                  <span className="font-mono text-foreground">com.kaamdo.partner</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-semibold text-foreground">Universal Android APK (.apk)</span>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <a
                href="/downloads/kaamdo-partner.apk"
                download="kaamdo-partner.apk"
                className="w-full py-3.5 px-4 rounded-xl bg-[#831843] hover:bg-[#701338] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Download Partner APK</span>
              </a>
              <p className="text-[11px] text-muted-foreground text-center mt-2">
                Compatible with Android 8.0 and above
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Sideload Installation Guide */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 mb-20 w-full">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xs">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              How to Install the APK on Your Android Device
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-muted-foreground">
            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-bold text-foreground text-sm">Download APK</h4>
              <p className="leading-relaxed">Tap the download button on your Android browser to save the installer file.</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-bold text-foreground text-sm">Allow Unknown Apps</h4>
              <p className="leading-relaxed">When prompted by Chrome or Files, toggle &quot;Allow from this source&quot; in Settings.</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/30 border border-border space-y-2">
              <span className="w-6 h-6 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-bold text-foreground text-sm">Tap Install</h4>
              <p className="leading-relaxed">Open the downloaded APK and tap Install. Log in with your mobile number to begin!</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-border py-8 text-center text-xs text-muted-foreground">
        © 2026 KaamDo Technologies Pvt Ltd • Har Kaam, Sahi Insaan
      </footer>
    </div>
  );
}
