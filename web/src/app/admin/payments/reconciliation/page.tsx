"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
interface Order { _id: string; jobId: string; gateway: string; orderId?: string; amountMinor: number; status: string; }
export default function ReconciliationPage() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const { data, error, refetch } = useQuery({ queryKey: ["payment-reconciliation"], queryFn: () => api.get<ApiResponse<Order[]>>("/api/payments/reconcile", getToken() ?? undefined) });
  async function reconcile(form: FormData, jobId: string) {
    setBusy(true); setMessage("");
    try { await api.post("/api/payments/reconcile", { jobId, recoveryOrderId: form.get("orderId") || undefined }, getToken() ?? undefined); await refetch(); setMessage("Payment confirmed and recorded."); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Reconciliation failed"); }
    finally { setBusy(false); }
  }
  return <main className="space-y-5"><h1 className="text-2xl font-bold">Payment reconciliation</h1><p>Check unconfirmed payments against the gateway. For an interrupted Razorpay order, find the existing order using the receipt reference below.</p><p role="status">{message || error?.message}</p>{data?.data?.length === 0 && <p>No payments awaiting confirmation.</p>}{data?.data?.map(order => <form action={form => reconcile(form, order.jobId)} key={order._id} className="border rounded p-4 space-y-3"><p>{order.gateway} · ₹{(order.amountMinor / 100).toFixed(2)} · {order.status}</p><p>Receipt reference: kd_{order._id}</p><label className="block">Provider order ID<input name="orderId" className="block border p-2" defaultValue={order.orderId} required={order.gateway === "razorpay" && order.status === "creating"} /></label><button disabled={busy} className="rounded bg-blue-600 p-3 text-white">Check payment</button></form>)}</main>;
}
