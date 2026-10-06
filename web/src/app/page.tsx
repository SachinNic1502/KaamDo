"use client";

import { useEffect, useState } from "react";
import Header from "@/components/header/Header";
import {
  Category,
  WorkerRecord,
  SocialProofTicker,
  HeroSection,
  EmergencyBanner,
  TrustIndicators,
  MainBenefits,
  ServiceCatalog,
  CostEstimator,
  VerifiedWorkersSpotlight,
  EscrowSecurityProtocol,
  HowItWorks,
  UseCases,
  ComparisonMatrix,
  TestimonialsSection,
  MobileAppsShowcase,
  FaqSection,
  CtaBanner,
  Footer,
} from "@/components/home";

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [workers, setWorkers] = useState<WorkerRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadData() {
      try {
        const [catRes, workerRes] = await Promise.allSettled([
          fetch("/api/categories?limit=50").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/workers?limit=6").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!active) return;

        if (catRes.status === "fulfilled" && catRes.value?.data) {
          setCategories(catRes.value.data);
        }
        if (workerRes.status === "fulfilled" && workerRes.value?.data) {
          setWorkers(workerRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load marketplace data:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadData();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans antialiased selection:bg-primary/20 selection:text-primary">
      <Header />
      <SocialProofTicker />
      <HeroSection categories={categories} workers={workers} />
      <EmergencyBanner />
      <TrustIndicators />
      <MainBenefits />
      <ServiceCatalog categories={categories} loading={loading} />
      <CostEstimator />
      <VerifiedWorkersSpotlight workers={workers} loading={loading} />
      <EscrowSecurityProtocol />
      <HowItWorks />
      <UseCases />
      <ComparisonMatrix />
      <TestimonialsSection />
      <MobileAppsShowcase />
      <FaqSection />
      <CtaBanner />
      <Footer />
    </div>
  );
}