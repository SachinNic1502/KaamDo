"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, AlertCircle, Eye, Check, X, ShieldAlert, ZoomIn, RefreshCw } from "lucide-react";

interface DisputeItem {
  _id: string;
  jobId: {
    _id: string;
    jobNumber: string;
    finalPrice?: number;
    estimatedPrice?: number;
  };
  raisedBy: {
    _id: string;
    name: string;
    phone: string;
  };
  reason: string;
  description: string;
  images: string[];
  status: "raised" | "under_review" | "evidence_submitted" | "support_review" | "resolved";
  resolution?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  raised: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  evidence_submitted: "bg-purple-100 text-purple-800",
  support_review: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
};

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDispute, setSelectedDispute] = useState<DisputeItem | null>(null);
  const [resolutionDecision, setResolutionDecision] = useState("full_refund");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [processing, setProcessing] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  async function fetchDisputes() {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: "50" });
      if (statusFilter !== "all") query.set("status", statusFilter);
      if (searchQuery) query.set("search", searchQuery);

      const token = getToken();
      const res = await fetch(`/api/disputes?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setDisputes(json.data || []);
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDisputes();
  }, [statusFilter]);

  async function handleResolveDispute() {
    if (!selectedDispute) return;
    try {
      setProcessing(true);
      const token = getToken();
      const decisionText =
        resolutionDecision === "full_refund"
          ? "Full refund approved for customer."
          : resolutionDecision === "partial_refund"
          ? "Partial 50% refund approved."
          : "Dispute dismissed in favor of service partner.";

      const fullResolution = `${decisionText} Notes: ${resolutionNotes || "Mediation concluded by admin."}`;

      const res = await fetch("/api/disputes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          disputeId: selectedDispute._id,
          status: "resolved",
          resolution: fullResolution,
        }),
      });

      if (res.ok) {
        setSelectedDispute(null);
        setResolutionNotes("");
        fetchDisputes();
      } else {
        alert("Failed to resolve dispute");
      }
    } catch {
      alert("Error resolving dispute");
    } finally {
      setProcessing(false);
    }
  }

  const totalDisputes = disputes.length;
  const pendingReview = disputes.filter((d) => d.status !== "resolved").length;
  const resolved = disputes.filter((d) => d.status === "resolved").length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dispute Mediation Desk</h1>
          <p className="text-sm text-gray-500">
            Review customer claim evidence, inspect photo attachments, and issue arbitration decisions.
          </p>
        </div>
        <Button onClick={fetchDisputes} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Desk
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDisputes}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{pendingReview}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Resolved Cases</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{resolved}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search reason or details..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchDisputes()}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              {["all", "raised", "under_review", "resolved"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                    statusFilter === st
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  }`}
                >
                  {st === "all" ? "All Cases" : st.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading dispute records...</div>
          ) : disputes.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No dispute records found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case ID</TableHead>
                  <TableHead>Job Number</TableHead>
                  <TableHead>Claimant</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date Filed</TableHead>
                  <TableHead className="text-right">Mediation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {disputes.map((d) => (
                  <TableRow key={d._id}>
                    <TableCell className="font-mono text-xs font-bold">{d._id.slice(-6).toUpperCase()}</TableCell>
                    <TableCell className="font-medium text-blue-600">#{d.jobId?.jobNumber || "JOB"}</TableCell>
                    <TableCell>{d.raisedBy?.name || "Customer"}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{d.reason}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[d.status] || "bg-gray-100 text-gray-800"}>
                        {d.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(d.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDispute(d)}
                        className="flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Arbitrate
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Mediation Arbitration Modal */}
      {selectedDispute && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Case #{selectedDispute._id.slice(-6).toUpperCase()} • Job #{selectedDispute.jobId?.jobNumber}
                </h2>
                <p className="text-xs text-gray-500">Filed by {selectedDispute.raisedBy?.name} ({selectedDispute.raisedBy?.phone})</p>
              </div>
              <button onClick={() => setSelectedDispute(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Dispute Claim</span>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedDispute.reason}</p>
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs text-gray-700 dark:text-gray-300">
                {selectedDispute.description || "No additional description provided."}
              </div>
            </div>

            {/* Evidence Photo Gallery */}
            {selectedDispute.images && selectedDispute.images.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Submitted Photo Evidence</span>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {selectedDispute.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Evidence ${idx + 1}`}
                      onClick={() => setPreviewImage(img)}
                      className="w-24 h-24 object-cover rounded-lg border cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Current Status / Resolution */}
            {selectedDispute.resolution && (
              <div className="p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg text-xs space-y-1">
                <p className="font-bold text-green-800 dark:text-green-300">Existing Resolution</p>
                <p className="text-green-700 dark:text-green-400">{selectedDispute.resolution}</p>
              </div>
            )}

            {/* Mediation Actions */}
            <div className="border-t pt-4 space-y-3">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Arbitration Decision
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { id: "full_refund", label: "Full Refund (100%)", color: "border-green-500 bg-green-50/50" },
                  { id: "partial_refund", label: "Partial Refund (50%)", color: "border-blue-500 bg-blue-50/50" },
                  { id: "favor_worker", label: "Dismiss (Favor Worker)", color: "border-amber-500 bg-amber-50/50" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setResolutionDecision(opt.id)}
                    className={`p-3 border rounded-xl text-left text-xs font-semibold transition ${
                      resolutionDecision === opt.id
                        ? `${opt.color} ring-2 ring-blue-600`
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                placeholder="Official mediation notes (visible in case record)..."
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full p-3 text-xs bg-gray-50 dark:bg-gray-800 border rounded-lg"
              />

              <div className="flex gap-2 pt-2">
                <Button variant="ghost" onClick={() => setSelectedDispute(null)} className="flex-1">
                  Cancel
                </Button>
                <Button
                  disabled={processing}
                  onClick={handleResolveDispute}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Check className="w-4 h-4 mr-1.5" /> Enforce Decision
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Preview */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 cursor-pointer"
        >
          <img src={previewImage} alt="Enlarged" className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
        </div>
      )}
    </div>
  );
}
