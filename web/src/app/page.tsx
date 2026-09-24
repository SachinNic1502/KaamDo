"use client";

import Header from "@/components/header/Header";
import FeaturesSection from "@/components/features/FeaturesSection";

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="max-w-7xl mx-auto px-6 py-20">
          <FeaturesSection />
        </section>
      </main>

      <footer className="border-t border-slate-200 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
          © 2026 KaamDo. All rights reserved.
        </div>
      </footer>
    </div>
  );
}