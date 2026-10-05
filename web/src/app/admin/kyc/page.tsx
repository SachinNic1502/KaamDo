"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/api-client";
import { Check, X, ShieldAlert, Eye, RotateCw, ZoomIn, Search, RefreshCw, FileText, AlertTriangle } from "lucide-react";

interface WorkerKYCItem {
  _id: string;
  userId: {
    _id: string;
    name: string;
    phone: string;
    email?: string;
    avatar?: string;
  };
  skills: string[];
  status: "draft" | "submitted" | "under_review" | "verified" | "rejected" | "suspended";
  documents?: {
    identity?: string;
    address?: string;
    certifications?: string[];
  };
  kyc?: {
    aadhaarNumber?: string;
    panNumber?: string;
    aadhaarFrontUrl?: string;
    panCardUrl?: string;
    tradeCertificateUrl?: string;
    status: string;
    submittedAt?: string;
    rejectionReason?: string;
  };
  bankDetails?: {
    accountHolderName?: string;
    accountNumber?: string;
    ifsc?: string;
    ifscCode?: string;
    bankName?: string;
    upi?: string;
  };
  createdAt: string;
}

export default function AdminKYCPage() {
  const [workers, setWorkers] = useState<WorkerKYCItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("under_review");
  const [search, setSearch] = useState("");
  const [selectedWorker, setSelectedWorker] = useState<WorkerKYCItem | null>(null);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  async function fetchKYCWorkers() {
    try {
      setLoading(true);
      const query = new URLSearchParams({ limit: "50" });
      if (filterStatus && filterStatus !== "all") query.set("status", filterStatus);
      if (search) query.set("search", search);

      const token = getToken();
      const res = await fetch(`/api/workers?${query.toString()}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setWorkers(json.data || []);
      }
    } catch {
      // Failed to load
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchKYCWorkers();
  }, [filterStatus]);

  async function handleReviewWorker(workerId: string, targetStatus: "verified" | "rejected", reason?: string) {
    try {
      setProcessing(true);
      const token = getToken();
      const res = await fetch("/api/workers", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          workerId,
          status: targetStatus,
          ...(reason ? { rejectionReason: reason } : {}),
        }),
      });

      if (res.ok) {
        setSelectedWorker(null);
        setRejectModalOpen(false);
        setRejectionReason("");
        fetchKYCWorkers();
      } else {
        const err = await res.json().catch(() => ({}));
        alert(err.message || "Failed to update worker status.");
      }
    } catch {
      alert("Error processing KYC review.");
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Worker KYC Verifications</h1>
          <p className="text-sm text-gray-500">
            Review government identity credentials, PAN cards, trade certifications, and settlement bank accounts.
          </p>
        </div>
        <button
          onClick={() => fetchKYCWorkers()}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 rounded-lg transition"
        >
          <RefreshCw className="w-4 h-4" /> Refresh List
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="flex flex-wrap gap-2">
          {["all", "submitted", "under_review", "verified", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition ${
                filterStatus === st
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
              }`}
            >
              {st === "all" ? "All Workers" : st.replace("_", " ")}
            </button>
          ))}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search worker by name or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchKYCWorkers()}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-500">Loading worker applications...</div>
      ) : workers.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
          <ShieldAlert className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">No worker applications in "{filterStatus.replace("_", " ")}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers.map((worker) => (
            <div
              key={worker._id}
              className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 space-y-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                  {worker.userId?.name?.charAt(0) || "W"}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{worker.userId?.name || "Worker"}</h3>
                  <p className="text-xs text-gray-500">{worker.userId?.phone}</p>
                </div>
                <span
                  className={`px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                    worker.status === "verified"
                      ? "bg-green-100 text-green-700"
                      : worker.status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {worker.status.replace("_", " ")}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-gray-500 font-medium">Trade Specializations</p>
                <div className="flex flex-wrap gap-1">
                  {worker.skills?.map((sk) => (
                    <span key={sk} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              {/* KYC Identification Badges */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 dark:bg-gray-800/40 p-3 rounded-lg">
                <div>
                  <span className="text-gray-400 block text-[10px]">AADHAAR</span>
                  <span className="font-mono text-gray-700 dark:text-gray-200 font-semibold">
                    {worker.kyc?.aadhaarNumber ? `•••• •••• ${worker.kyc.aadhaarNumber.slice(-4)}` : "Not provided"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px]">PAN NUMBER</span>
                  <span className="font-mono text-gray-700 dark:text-gray-200 font-semibold">
                    {worker.kyc?.panNumber || "Not provided"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setSelectedWorker(worker)}
                className="w-full py-2 bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 text-blue-600 dark:text-blue-400 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Eye className="w-4 h-4" /> Review Documents & Banking
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Verification Desk Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-3xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">KYC Dossier: {selectedWorker.userId?.name}</h2>
                <p className="text-xs text-gray-500">Phone: {selectedWorker.userId?.phone} • Applied: {new Date(selectedWorker.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedWorker(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Gallery */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aadhaar Card */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Aadhaar Document</p>
                  <span className="text-[11px] font-mono text-gray-500">{selectedWorker.kyc?.aadhaarNumber || "N/A"}</span>
                </div>
                {selectedWorker.kyc?.aadhaarFrontUrl || selectedWorker.documents?.identity ? (
                  <div className="relative group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 p-2 text-center">
                    <img
                      src={selectedWorker.kyc?.aadhaarFrontUrl || selectedWorker.documents?.identity}
                      alt="Aadhaar Front"
                      className="w-full h-44 object-cover cursor-pointer rounded"
                      onClick={() => {
                        setPreviewDoc(selectedWorker.kyc?.aadhaarFrontUrl || selectedWorker.documents!.identity!);
                        setRotation(0);
                        setZoom(1);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      onClick={() => {
                        setPreviewDoc(selectedWorker.kyc?.aadhaarFrontUrl || selectedWorker.documents!.identity!);
                        setRotation(0);
                        setZoom(1);
                      }}
                    >
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <ZoomIn className="w-4 h-4" /> Click to Inspect
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-xs text-gray-400">
                    No Aadhaar scan uploaded
                  </div>
                )}
              </div>

              {/* PAN Card */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">PAN Card Document</p>
                  <span className="text-[11px] font-mono text-gray-500">{selectedWorker.kyc?.panNumber || "N/A"}</span>
                </div>
                {selectedWorker.kyc?.panCardUrl || selectedWorker.documents?.address ? (
                  <div className="relative group border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden bg-gray-50 p-2 text-center">
                    <img
                      src={selectedWorker.kyc?.panCardUrl || selectedWorker.documents?.address}
                      alt="PAN Card"
                      className="w-full h-44 object-cover cursor-pointer rounded"
                      onClick={() => {
                        setPreviewDoc(selectedWorker.kyc?.panCardUrl || selectedWorker.documents!.address!);
                        setRotation(0);
                        setZoom(1);
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition cursor-pointer"
                      onClick={() => {
                        setPreviewDoc(selectedWorker.kyc?.panCardUrl || selectedWorker.documents!.address!);
                        setRotation(0);
                        setZoom(1);
                      }}
                    >
                      <span className="text-white text-xs font-medium flex items-center gap-1">
                        <ZoomIn className="w-4 h-4" /> Click to Inspect
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center text-xs text-gray-400">
                    No PAN card scan uploaded
                  </div>
                )}
              </div>
            </div>

            {/* Bank Details */}
            <div className="bg-gray-50 dark:bg-gray-800/40 p-4 rounded-xl space-y-2 text-xs">
              <p className="font-semibold text-gray-800 dark:text-gray-200">Verified Settlement Bank Account</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-gray-600 dark:text-gray-400">
                <div>
                  <span className="text-[10px] text-gray-400 block">BENEFICIARY</span>
                  <span className="font-medium text-gray-800 dark:text-white">{selectedWorker.bankDetails?.accountHolderName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">BANK</span>
                  <span className="font-medium text-gray-800 dark:text-white">{selectedWorker.bankDetails?.bankName || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">ACCOUNT NUMBER</span>
                  <span className="font-mono text-gray-800 dark:text-white">{selectedWorker.bankDetails?.accountNumber || "N/A"}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 block">IFSC CODE</span>
                  <span className="font-mono text-gray-800 dark:text-white">{selectedWorker.bankDetails?.ifscCode || selectedWorker.bankDetails?.ifsc || "N/A"}</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-800">
              <button
                disabled={processing}
                onClick={() => setRejectModalOpen(true)}
                className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <X className="w-4 h-4" /> Reject With Reason
              </button>
              <button
                disabled={processing}
                onClick={() => handleReviewWorker(selectedWorker.userId._id || selectedWorker._id, "verified")}
                className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition"
              >
                <Check className="w-4 h-4" /> Approve & Grant Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Dialog */}
      {rejectModalOpen && selectedWorker && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-gray-900 dark:text-white">Reject KYC Application</h3>
            </div>
            <p className="text-xs text-gray-500">
              Please enter the specific reason so the worker knows what to correct (e.g., "Blurry Aadhaar image", "Bank account name mismatch").
            </p>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full p-3 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 text-sm font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={processing || !rejectionReason.trim()}
                onClick={() => handleReviewWorker(selectedWorker.userId._id || selectedWorker._id, "rejected", rejectionReason)}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg disabled:opacity-50"
              >
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Lightbox */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setRotation((r) => (r + 90) % 360)}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => setZoom((z) => (z >= 2 ? 1 : z + 0.5))}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-full transition"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPreviewDoc(null)}
              className="p-2 bg-red-600 text-white rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <img
            src={previewDoc}
            alt="Preview"
            style={{ transform: `rotate(${rotation}deg) scale(${zoom})` }}
            className="max-w-full max-h-[75vh] object-contain transition-transform"
          />
        </div>
      )}
    </div>
  );
}
