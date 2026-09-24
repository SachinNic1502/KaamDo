"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle } from "lucide-react";
import { useState } from "react";
import { useWorkers, useUpdateWorker } from "@/hooks/use-api";

interface KycWorker {
  _id: string;
  id?: string;
  name?: string;
  skill?: string;
  skills?: string[];
  experience?: number;
  status?: string;
  documents?: { identity?: unknown; address?: unknown; certifications?: unknown };
  userId?: string | { _id?: string; name?: string; phone?: string };
}

export default function KYCPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data, isLoading, error, refetch } = useWorkers();
  const updateWorker = useUpdateWorker();

  const workers = (data?.data as KycWorker[]) || [];
  const getUserId = (w: KycWorker): string => {
    const u = w.userId;
    return (u && typeof u === "object" ? u._id : u) ?? w.id ?? "";
  };
  const getName = (w: KycWorker): string => {
    const u = w.userId;
    return (u && typeof u === "object" ? u.name : undefined) ?? w.name ?? "Unknown";
  };
  const getSkills = (w: KycWorker): string => {
    if (Array.isArray(w.skills)) return w.skills.join(", ");
    return w.skill ?? "";
  };
  const pendingKYC = workers.filter(
    (w: KycWorker) => w.status === "submitted" || w.status === "under_review"
  );
  const filtered = pendingKYC.filter((w: KycWorker) => {
    const q = searchQuery.toLowerCase();
    return getName(w).toLowerCase().includes(q) || getSkills(w).toLowerCase().includes(q);
  });

  const handleApprove = (worker: KycWorker) => {
    updateWorker.mutate(
      { workerId: getUserId(worker), status: "verified" },
      { onSuccess: () => refetch() }
    );
  };

  const handleReject = (worker: KycWorker) => {
    updateWorker.mutate(
      { workerId: getUserId(worker), status: "rejected" },
      { onSuccess: () => refetch() }
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading workers...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">Failed to load workers. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">KYC Approvals</h1>
        <p className="text-muted-foreground">Review and approve worker verification documents</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reviews</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingKYC.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingKYC.filter((w: KycWorker) => w.status === "submitted").length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingKYC.filter((w: KycWorker) => w.status === "under_review").length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search workers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {updateWorker.isError && (
              <div className="col-span-full text-center text-sm text-red-600" role="alert">
                {(updateWorker.error as Error)?.message || "Failed to update worker status. Please try again."}
              </div>
            )}
            {filtered.map((worker: KycWorker) => (
              <div key={worker._id ?? getUserId(worker)} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{getName(worker)}</h3>
                    <p className="text-sm text-muted-foreground">{getSkills(worker)} {worker.experience ? `• ${worker.experience} yrs` : ""}</p>
                  </div>
                  <Badge variant="outline">{worker.status}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Identity Proof</span>
                    {worker.documents?.identity ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Address Proof</span>
                    {worker.documents?.address ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Certifications</span>
                    {worker.documents?.certifications ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    size="sm"
                    onClick={() => handleApprove(worker)}
                    disabled={updateWorker.isPending}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleReject(worker)}
                    disabled={updateWorker.isPending}
                  >
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-8 text-muted-foreground">
                No pending KYC reviews found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
