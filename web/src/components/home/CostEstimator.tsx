"use client";

import { useState } from "react";
import Link from "next/link";
import { Zap, Droplets, Wrench, Hammer, Paintbrush, Clock, CheckCircle2, Lock, Check } from "lucide-react";

const ESTIMATOR_DATA = [
  {
    trade: "Electrician",
    icon: Zap,
    issues: [
      { name: "Switch / Socket Sparking or Replacement", labor: "₹199 – ₹249", duration: "20–30 mins", partsPolicy: "Standard anchor/havells parts billed on store receipt." },
      { name: "Ceiling Fan Installation / Regulator Repair", labor: "₹249 – ₹349", duration: "30–45 mins", partsPolicy: "Customer provides fan or purchased at retail bill." },
      { name: "MCB Tripping / Main Distribution Box Fix", labor: "₹349 – ₹499", duration: "45–60 mins", partsPolicy: "MCB parts approved prior to installation." },
      { name: "Full Room Concealed Wiring Overhaul", labor: "₹899 – ₹1,499", duration: "2–4 hours", partsPolicy: "Wires & conduit pipe billed with GST invoice." },
    ],
  },
  {
    trade: "Plumbing",
    icon: Droplets,
    issues: [
      { name: "Leaking Tap, Mixer or Angle Valve Replacement", labor: "₹199 – ₹299", duration: "20–30 mins", partsPolicy: "Standard Teflon tape & washers included in service." },
      { name: "Toilet Flush Cistern & Jet Spray Repair", labor: "₹249 – ₹399", duration: "30–40 mins", partsPolicy: "Replacement valves itemized with customer approval." },
      { name: "Severe Drain Blockage & Pipe Descaling", labor: "₹399 – ₹599", duration: "45–60 mins", partsPolicy: "Heavy duty rotary spring machine included." },
      { name: "Overhead Water Tank Deep Cleaning (500L–1000L)", labor: "₹699 – ₹1,199", duration: "1–2 hours", partsPolicy: "UV antibacterial sanitization spray included." },
    ],
  },
  {
    trade: "AC & Appliances",
    icon: Wrench,
    issues: [
      { name: "Split AC Deep Foam Jet Servicing", labor: "₹499 – ₹699", duration: "45–60 mins", partsPolicy: "Complete indoor foam wash + outdoor condenser rinse." },
      { name: "AC Gas Leak Detection & Full Gas Refill (R32/R410)", labor: "₹1,899 – ₹2,499", duration: "60–90 mins", partsPolicy: "Nitrogen pressure test + 100% pure refrigerant cylinder." },
      { name: "Washing Machine Drum / Water Drain Failure", labor: "₹349 – ₹499", duration: "30–60 mins", partsPolicy: "Inlet valve/drain pump quote approved digitally." },
      { name: "Refrigerator Cooling Coil / Thermostat Repair", labor: "₹399 – ₹599", duration: "45–60 mins", partsPolicy: "Capillary tube & relay switch billed on exact MRP." },
    ],
  },
  {
    trade: "Carpentry",
    icon: Hammer,
    issues: [
      { name: "Main Door Lock / Handle / Mortise Installation", labor: "₹299 – ₹449", duration: "30–45 mins", partsPolicy: "Lock set provided by customer or bought on bill." },
      { name: "Modular Bed / Wardrobe Assembly", labor: "₹599 – ₹999", duration: "60–120 mins", partsPolicy: "All hardware bolts and fasteners checked." },
      { name: "Kitchen Cabinet Hydraulic Hinge Realignment", labor: "₹249 – ₹399", duration: "30–40 mins", partsPolicy: "Soft-close hinges billed at direct distributor price." },
      { name: "Custom Wooden Wall Shelf Mounting (Per Shelf)", labor: "₹199 – ₹299", duration: "20–30 mins", partsPolicy: "Heavy-duty wall anchors and studs included." },
    ],
  },
  {
    trade: "Painting & Moisture",
    icon: Paintbrush,
    issues: [
      { name: "Single Accent Wall Texture Finish", labor: "₹899 – ₹1,499", duration: "2–4 hours", partsPolicy: "Premium washable emulsion included in estimate." },
      { name: "Bathroom Ceiling Moisture Waterproofing", labor: "₹1,199 – ₹1,799", duration: "3–5 hours", partsPolicy: "Dr. Fixit / Asian Paints dampproof coat applied." },
      { name: "1 BHK Full Interior Repainting", labor: "₹5,999 – ₹8,999", duration: "1–2 days", partsPolicy: "Primer + 2 coats of premium acrylic emulsion." },
    ],
  },
];

export default function CostEstimator() {
  const [selectedTradeIndex, setSelectedTradeIndex] = useState(0);
  const [selectedIssueIndex, setSelectedIssueIndex] = useState(0);

  const currentEstimator = ESTIMATOR_DATA[selectedTradeIndex] || ESTIMATOR_DATA[0];
  const currentIssue = currentEstimator.issues[selectedIssueIndex] || currentEstimator.issues[0];

  return (
    <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 w-full" id="cost-estimator">
      <div className="max-w-2xl mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Upfront Transparency
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mt-1">
          Instant Repair Cost Estimator
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Know what you pay before booking. Standard labor rates, estimated duration, and zero hidden parts markups.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Trade Selector & Issue Selector */}
        <div className="lg:col-span-7 space-y-5">
          {/* Trade Pills */}
          <div className="flex flex-wrap gap-2">
            {ESTIMATOR_DATA.map((t, idx) => {
              const Icon = t.icon;
              const isSelected = selectedTradeIndex === idx;
              return (
                <button
                  key={t.trade}
                  type="button"
                  onClick={() => {
                    setSelectedTradeIndex(idx);
                    setSelectedIssueIndex(0);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-card border border-border text-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.trade}</span>
                </button>
              );
            })}
          </div>

          {/* Issues List for Selected Trade */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-foreground block">
              Select Specific Issue or Requirement:
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {currentEstimator.issues.map((iss, iIdx) => {
                const isChosen = selectedIssueIndex === iIdx;
                return (
                  <button
                    key={iss.name}
                    type="button"
                    onClick={() => setSelectedIssueIndex(iIdx)}
                    className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-4 cursor-pointer ${
                      isChosen
                        ? "border-primary bg-primary/5 text-foreground font-semibold shadow-xs"
                        : "border-border bg-card text-muted-foreground hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isChosen ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground"
                        }`}
                      >
                        {isChosen && <Check className="w-2.5 h-2.5" />}
                      </div>
                      <span>{iss.name}</span>
                    </div>
                    <span className="font-bold text-primary shrink-0">{iss.labor}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Breakdown & Live Calculation Card */}
        <div className="lg:col-span-5">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-md space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Official Rate Card Breakdown
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">Standard Tier</span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-foreground">{currentIssue.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{currentEstimator.trade} Department</p>
            </div>

            <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Estimated Base Labor Rate:</span>
                <span className="font-bold text-base text-foreground">{currentIssue.labor}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">Typical Job Duration:</span>
                <span className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-primary" /> {currentIssue.duration}
                </span>
              </div>
              <div className="pt-2 border-t border-border/80 text-[11px] text-muted-foreground">
                <strong className="text-foreground">Spare Parts Policy:</strong> {currentIssue.partsPolicy}
              </div>
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>7-Day Free Corrective Warranty Included</span>
              </div>
              <div className="flex items-center gap-2 text-primary font-medium text-[11px]">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Payment held in Escrow until completion OTP</span>
              </div>
            </div>

            <div className="pt-3 border-t border-border flex gap-3">
              <Link
                href={`/book?category=${encodeURIComponent(currentEstimator.trade)}&service=${encodeURIComponent(
                  currentIssue.name
                )}`}
                className="flex-1 py-3 text-center bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl transition-colors shadow-xs"
              >
                Book This Service
              </Link>
              <Link
                href={`/workers?skill=${encodeURIComponent(currentEstimator.trade)}`}
                className="py-3 px-4 text-center border border-border hover:bg-muted text-foreground font-semibold text-xs rounded-xl transition-colors"
              >
                View Pros
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
