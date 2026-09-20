"use client";

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
import { Search, AlertCircle, Eye } from "lucide-react";
import { useState } from "react";
import { useDisputes } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  raised: "bg-yellow-100 text-yellow-800",
  under_review: "bg-blue-100 text-blue-800",
  evidence_submitted: "bg-purple-100 text-purple-800",
  support_review: "bg-orange-100 text-orange-800",
  resolved: "bg-green-100 text-green-800",
};

export default function DisputesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, error } = useDisputes({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const disputes = (data?.data ?? []) as Record<string, unknown>[];

  const totalDisputes = disputes.length;
  const pendingReview = disputes.filter(
    (d) => d.status === "raised" || d.status === "under_review" || d.status === "evidence_submitted" || d.status === "support_review"
  ).length;
  const resolved = disputes.filter((d) => d.status === "resolved").length;
  const totalRefund = disputes
    .filter((d) => d.status === "resolved")
    .reduce((sum, d) => sum + ((d.amount as number) ?? 0), 0);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="text-muted-foreground">Manage customer and worker disputes</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading disputes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Disputes</h1>
          <p className="text-muted-foreground">Manage customer and worker disputes</p>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-red-500">Failed to load disputes. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Disputes</h1>
        <p className="text-muted-foreground">Manage customer and worker disputes</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalDisputes}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingReview}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <AlertCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{resolved}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refund Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{totalRefund.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search disputes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
              <option value="all">All Status</option>
              <option value="raised">Raised</option>
              <option value="under_review">Under Review</option>
              <option value="evidence_submitted">Evidence Submitted</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dispute ID</TableHead>
                <TableHead>Job ID</TableHead>
                <TableHead>Raised By</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No disputes found.
                  </TableCell>
                </TableRow>
              ) : (
                disputes.map((d) => (
                  <TableRow key={d._id as string}>
                    <TableCell className="font-medium">{(d._id as string)?.slice(-6)}</TableCell>
                    <TableCell>{(d.jobId as Record<string, unknown>)?.jobNumber as string || String(d.jobId)}</TableCell>
                    <TableCell>{(d.raisedBy as Record<string, unknown>)?.name as string || String(d.raisedBy)}</TableCell>
                    <TableCell>{d.reason as string}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell><Badge className={statusColors[d.status as string]}>{(d.status as string).replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell>{new Date(d.createdAt as string).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
