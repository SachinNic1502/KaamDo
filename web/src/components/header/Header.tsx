"use client";

import Link from "next/link";

export default function Header() {

  return (
    <header className="border-b border-border bg-white/90 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg
            width="40"
            height="40"
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="hBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6" />
                <stop offset="100%" stopColor="#2563EB" />
              </linearGradient>
              <linearGradient id="hOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#F97316" />
              </linearGradient>
            </defs>
            <rect x="20" y="30" width="36" height="140" rx="18" fill="url(#hBlue)" />
            <circle cx="90" cy="42" r="20" fill="url(#hBlue)" />
            <path
              d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z"
              fill="url(#hOrange)"
            />
            <path d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144" fill="url(#hBlue)" />
          </svg>
          <div>
            <span className="text-2xl font-black">
              <span className="text-slate-800">Kaam</span>
              <span className="text-orange-500">Do</span>
            </span>
            <span className="block text-xs text-slate-500 font-medium -mt-1">
              Har Kaam, Sahi Insaan
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
      </div>
    </header>
  );
}