"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "How does KaamDo verify tradesmen and technicians?",
    answer: "Every professional undergoes mandatory 3-tier onboarding: Aadhaar biometric identity authentication, judicial police record clearance, and a practical trade skill assessment. Only workers with clean verification records receive active platform credentials.",
  },
  {
    question: "How does the Start and Completion OTP mechanism protect me?",
    answer: "When a technician arrives at your premises, you provide a 4-digit Arrival OTP only after checking their digital ID photo in the app. Once the repair is complete and inspected, you share a separate Completion OTP which securely releases payment from escrow.",
  },
  {
    question: "How are spare parts and replacement hardware billed?",
    answer: "Technicians do not mark up hardware. If replacement parts (e.g. MCB, valves, locks) are needed, the technician itemizes the part details and cost in the app. You must review and digitally approve the additional charge before they proceed.",
  },
  {
    question: "What if the repair has an issue after the technician leaves?",
    answer: "All services booked through KaamDo are backed by our 7-Day Free Rework Guarantee. If the fix fails within 7 days, request a rework from your dashboard and a senior verified pro will correct the issue at zero extra service charge.",
  },
  {
    question: "Can I book daily wage workers or masonry helpers?",
    answer: "Yes! KaamDo provides vetted daily wage workforce for construction support, tile fixing, debris clearing, wall painting, and heavy furniture shifting with standardized daily base rates.",
  },
  {
    question: "How can I install the KaamDo Android Mobile Apps?",
    answer: "You can download the standalone Universal Android APKs (.apk) directly from our website for both the Customer App and the Partner App, or scan the QR codes on this page with your smartphone camera.",
  },
];

export default function FaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="py-16 sm:py-20 max-w-4xl mx-auto px-4 sm:px-6 w-full" id="faq">
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">
          Got Questions?
        </span>
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Frequently Asked Questions
        </h2>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Everything you need to know about booking, rates, security OTPs, and rework warranties.
        </p>
      </div>

      <div className="space-y-3">
        {FAQS.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={faq.question}
              className="border border-border rounded-xl bg-card overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-sm text-foreground hover:bg-muted/40 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-primary" : ""
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed border-t border-border/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
