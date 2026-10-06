"use client";

import { useState } from "react";
import { Star, Clock, ShieldCheck, CheckCircle2, Award } from "lucide-react";
import { WorkerRecord } from "./types";

interface HeroRadarSimulatorProps {
  heroWorker?: WorkerRecord;
}

export default function HeroRadarSimulator({ heroWorker }: HeroRadarSimulatorProps) {
  const [radarStep, setRadarStep] = useState<"en_route" | "at_doorstep" | "completed">("en_route");

  const heroWorkerName = heroWorker?.userId?.name || "Mohammad Riaz";
  const heroWorkerRate = heroWorker?.hourlyRate ? `₹${heroWorker.hourlyRate}/hr` : "₹299/hr";
  const heroWorkerTrade = heroWorker?.skills?.[0] || "Master Electrician";
  const heroWorkerExp = `${heroWorker?.experience || 8} yrs exp`;
  const heroWorkerRating = heroWorker?.rating ? heroWorker.rating.toFixed(1) : "4.9";
  const heroWorkerJobs = heroWorker?.totalJobs || 320;
  const heroWorkerAvatar =
    heroWorker?.userId?.avatar ||
    "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=160&auto=format&fit=crop&q=80";
  const heroWorkerLocality = heroWorker?.serviceAreas?.[0] || "Indiranagar";

  return (
    <div className="relative mx-auto max-w-md">
      {/* Visual Decorative Glow */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-primary/20 blur-xl opacity-60" />

      {/* Main Radar Simulation Card */}
      <div className="relative bg-card border border-border/80 rounded-2xl p-6 shadow-xl space-y-4">
        {/* Interactive Phase Toggle Tabs */}
        <div className="flex rounded-lg bg-muted p-1 gap-1 text-[11px] font-semibold">
          <button
            type="button"
            onClick={() => setRadarStep("en_route")}
            className={`flex-1 py-1 px-2 rounded-md transition-all cursor-pointer ${
              radarStep === "en_route"
                ? "bg-background text-primary shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            1. En Route
          </button>
          <button
            type="button"
            onClick={() => setRadarStep("at_doorstep")}
            className={`flex-1 py-1 px-2 rounded-md transition-all cursor-pointer ${
              radarStep === "at_doorstep"
                ? "bg-background text-primary shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            2. At Doorstep
          </button>
          <button
            type="button"
            onClick={() => setRadarStep("completed")}
            className={`flex-1 py-1 px-2 rounded-md transition-all cursor-pointer ${
              radarStep === "completed"
                ? "bg-background text-primary shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            3. Completed
          </button>
        </div>

        {/* Dispatch Header */}
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                radarStep === "completed" ? "bg-emerald-500" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span className="text-xs font-bold text-foreground">
              {radarStep === "en_route" && "LIVE RADAR DISPATCH"}
              {radarStep === "at_doorstep" && "DOORSTEP ARRIVAL VERIFIED"}
              {radarStep === "completed" && "JOB INSPECTED & ESCROW RELEASED"}
            </span>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            #KD-8921
          </span>
        </div>

        {/* Worker Card Snippet */}
        <div className="flex items-start gap-3.5">
          <img
            src={heroWorkerAvatar}
            alt={heroWorkerName}
            className="w-14 h-14 rounded-xl object-cover border border-border shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-foreground truncate">{heroWorkerName}</h4>
              <span className="text-xs font-bold text-primary">{heroWorkerRate}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {heroWorkerTrade} • {heroWorkerExp}
            </p>

            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <div className="flex items-center gap-0.5 text-amber-600 dark:text-amber-400 font-semibold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{heroWorkerRating}</span>
              </div>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-muted-foreground">{heroWorkerJobs} jobs</span>
              <span className="text-muted-foreground/40">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Police Cleared</span>
            </div>
          </div>
        </div>

        {/* Dynamic Status Tracker Based on Simulator State */}
        {radarStep === "en_route" && (
          <div className="p-3.5 rounded-xl bg-muted/50 border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                Technician En Route
              </span>
              <span className="font-bold text-primary">Arriving in 14 mins</span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-primary h-full rounded-full w-3/4 animate-pulse" />
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>1.4 km away • {heroWorkerLocality}</span>
              <span>GPS Radar Active</span>
            </div>
          </div>
        )}

        {radarStep === "at_doorstep" && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Doorstep Identity Authenticated
              </span>
              <span className="font-bold text-foreground">Timer: 00:32:15</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Arrival OTP matched. Digital ID photo confirmed. Work underway for Switchboard repair.
            </p>
          </div>
        )}

        {radarStep === "completed" && (
          <div className="p-3.5 rounded-xl bg-primary/10 border border-primary/20 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-primary flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-primary" />
                Payment Settled via Escrow
              </span>
              <span className="font-bold text-foreground">Total: ₹498</span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
              <span>Labor ₹299 + Itemized Parts ₹199</span>
              <span className="text-emerald-600 font-semibold">Warranty Active ✓</span>
            </div>
          </div>
        )}

        {/* Dual-OTP Security Banner */}
        <div className="grid grid-cols-2 gap-2 pt-1 text-center">
          <div
            className={`p-2.5 rounded-lg border ${
              radarStep === "en_route"
                ? "border-primary/30 bg-primary/5"
                : "border-emerald-500/30 bg-emerald-500/5"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-primary block">Arrival OTP</span>
            <span className="text-base font-mono font-bold tracking-widest text-foreground">
              {radarStep === "en_route" ? "4892" : "4892 ✓"}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {radarStep === "en_route" ? "Share at doorstep" : "Verified & Accepted"}
            </span>
          </div>

          <div
            className={`p-2.5 rounded-lg border ${
              radarStep === "completed" ? "border-primary/30 bg-primary/5" : "border-border bg-card"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Completion OTP
            </span>
            <span
              className={`text-base font-mono font-bold tracking-widest ${
                radarStep === "completed" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {radarStep === "completed" ? "8194 ✓" : "••••"}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              {radarStep === "completed" ? "Escrow Released" : "Share after inspection"}
            </span>
          </div>
        </div>

        {/* Guarantee Strip */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-3">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 7-Day Free Rework Warranty
          </span>
          <span className="font-medium text-foreground">Zero Surge Pricing</span>
        </div>
      </div>
    </div>
  );
}
