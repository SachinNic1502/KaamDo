"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const RECENT_BOOKINGS = [
  { user: "Vikram S.", city: "Indiranagar, Bengaluru", service: "Switchboard Overhaul", time: "3 mins ago" },
  { user: "Pooja V.", city: "Kothrud, Pune", service: "AC Deep Servicing", time: "8 mins ago" },
  { user: "Naveen R.", city: "Sector 62, Noida", service: "Water Pipe Leakage", time: "14 mins ago" },
  { user: "Ananya M.", city: "Andheri West, Mumbai", service: "Door Lock Fitting", time: "19 mins ago" },
  { user: "Girish K.", city: "Madhapur, Hyderabad", service: "Wall Texture Paint", time: "26 mins ago" },
];

export default function SocialProofTicker() {
  const [tickerIndex, setTickerIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTickerIndex((prev) => (prev + 1) % RECENT_BOOKINGS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const current = RECENT_BOOKINGS[tickerIndex];

  return (
    <div className="bg-primary/10 border-b border-primary/20 py-1.5 px-4 text-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-primary shrink-0 hidden sm:inline">LIVE DISPATCH STREAM:</span>
          <span className="text-foreground font-medium truncate">
            {current.user} booked {current.service} in {current.city}
          </span>
          <span className="text-muted-foreground shrink-0 text-[11px]">({current.time})</span>
        </div>

        <div className="flex items-center gap-3 shrink-0 text-muted-foreground text-[11px] hidden md:flex">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> 100% Aadhaar Verified
          </span>
          <span>•</span>
          <span>Escrow Protected</span>
        </div>
      </div>
    </div>
  );
}
