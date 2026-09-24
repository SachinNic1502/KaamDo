"use client";
import Script from "next/script";
import { useState } from "react";

declare global {
  interface Window { Cashfree?: (options: { mode: "sandbox" | "production" }) => { checkout: (options: { paymentSessionId: string; redirectTarget: "_modal" }) => Promise<{ error?: { message?: string } }> }; }
}
export default function CashfreeCheckout() {
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Complete your payment, then return to KaamDo to check its status.");
  const [busy, setBusy] = useState(false);
  async function pay() {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const session = params.get("session");
    if (!session || !window.Cashfree) { setMessage("Payment session unavailable. Return to the app."); return; }
    setBusy(true);
    try {
      const result = await window.Cashfree({ mode: params.get("mode") === "production" ? "production" : "sandbox" }).checkout({ paymentSessionId: session, redirectTarget: "_modal" });
      setMessage(result.error?.message || "Return to KaamDo and check payment status. Your server will confirm the payment.");
    } catch { setMessage("Could not complete checkout. Return to the app to check payment status before retrying."); }
    finally { setBusy(false); }
  }
  return <main className="mx-auto max-w-lg p-8 space-y-6"><Script src="https://sdk.cashfree.com/js/v3/cashfree.js" onLoad={() => setReady(true)} onError={() => setMessage("Unable to load checkout. Please retry later.")} /><h1 className="text-2xl font-bold">KaamDo payment</h1><p role="status">{message}</p><button disabled={!ready || busy} onClick={pay} className="rounded bg-blue-600 p-4 text-white disabled:opacity-50">{busy ? "Payment in progress…" : "Pay with Cashfree"}</button></main>;
}
