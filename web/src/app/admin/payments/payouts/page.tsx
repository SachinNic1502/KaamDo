"use client";
import { useEffect, useState } from "react";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
interface Obligation { _id: string; workerId: string; amountMinor: number; status: string; bankReference?: string; }
export default function PayoutsPage() {
  const [rows, setRows] = useState<Obligation[]>([]);
  const [selected, setSelected] = useState<Obligation | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function load() { const res = await api.get<ApiResponse<Obligation[]>>("/api/payouts", getToken() ?? undefined); setRows(res.data ?? []); }
  useEffect(() => {
    let active = true;
    void api.get<ApiResponse<Obligation[]>>("/api/payouts", getToken() ?? undefined).then(res => { if (active) setRows(res.data ?? []); }).catch(() => { if (active) setMessage("Unable to load payouts. Sign in as an admin."); });
    return () => { active = false; };
  }, []);
  async function record(form: FormData) {
    if (!selected) return;
    setBusy(true); setMessage("");
    try {
      await api.post("/api/payouts", { obligationId: selected._id, amountMinor: Math.round(Number(form.get("amount")) * 100), bankReference: form.get("reference"), transferredAt: new Date(String(form.get("date"))).toISOString(), statementReference: form.get("statement"), transferVerified: form.get("verified") === "on" }, getToken() ?? undefined);
      setSelected(null); await load(); setMessage("Transfer reconciled.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to reconcile transfer"); }
    finally { setBusy(false); }
  }
  return <main className="p-6 space-y-6"><h1 className="text-2xl font-bold">Manual payout reconciliation</h1><p>Record a transfer after checking the bank statement and worker beneficiary. This form does not send money.</p><p role="status">{message}</p><div className="overflow-x-auto"><table className="w-full text-left"><thead><tr><th>Worker</th><th>Amount</th><th>Status</th><th>Bank reference</th><th>Action</th></tr></thead><tbody>{rows.map(row => <tr key={row._id}><td className="p-2">{row.workerId}</td><td>₹{(row.amountMinor / 100).toFixed(2)}</td><td>{row.status === "awaiting_settlement" ? "Awaiting manual transfer" : row.status}</td><td>{row.bankReference ?? "—"}</td><td>{row.status !== "paid" && <button className="underline" onClick={() => setSelected(row)}>Record transfer</button>}</td></tr>)}</tbody></table></div>{selected && <form action={record} className="max-w-lg space-y-4"><h2 className="font-bold">Transfer for {selected.workerId}</h2><label className="block">Amount transferred (₹)<input className="block border p-2" name="amount" type="number" step="0.01" min="0.01" defaultValue={selected.amountMinor / 100} required /></label><label className="block">Bank transaction reference<input className="block border p-2" name="reference" minLength={6} required /></label><label className="block">Transfer date and time<input className="block border p-2" name="date" type="datetime-local" required /></label><label className="block">Bank statement reference<input className="block border p-2" name="statement" minLength={6} required /></label><label className="block"><input name="verified" type="checkbox" required /> I verified the beneficiary, amount and transfer against the bank statement.</label><button disabled={busy} className="rounded bg-blue-600 p-3 text-white">{busy ? "Recording…" : "Record verified transfer"}</button><button type="button" onClick={() => setSelected(null)} className="ml-4">Cancel</button></form>}</main>;
}
