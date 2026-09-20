"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { useState } from "react";
import { useJobs } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
  searching: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
};

export default function QuotationsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useJobs({
    search: searchQuery || undefined,
    page,
    limit: 10,
  });

  const allJobs = data?.data ?? [];
  const pagination = data?.pagination;

  const quotations = allJobs.filter((job: any) => job.pricingModel === "quotation");

  const pendingCount = quotations.filter((job: any) => job.status === "searching" || job.status === "pending").length;
  const acceptedCount = quotations.filter((job: any) => job.status === "worker_assigned" || job.status === "in_progress" || job.status === "completed").length;
  const avgQuotation = quotations.length > 0
    ? Math.round(quotations.reduce((sum: number, job: any) => sum + (job.amount || 0), 0) / quotations.length)
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quotations</h1>
        <p className="text-muted-foreground">Manage worker quotations for jobs</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{pendingCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accepted</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{acceptedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quotation</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">Rs. {avgQuotation}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search quotations..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading quotations...</p>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-red-500">Failed to load quotations. Please try again.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {quotations.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <p className="text-muted-foreground">No quotations found.</p>
                </div>
              ) : (
                quotations.map((job: any) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.id}</span>
                        <Badge className={statusColors[job.status] ?? "bg-gray-100 text-gray-800"}>
                          {job.status?.replace("_", " ")}
                        </Badge>
                      </div>
                      <span className="text-sm text-muted-foreground">{job.date}</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm">
                        <span className="text-muted-foreground">Job:</span> {job.id} - {job.service}
                      </p>
                      <p className="text-sm">
                        <span className="text-muted-foreground">Customer:</span> {job.customer}
                      </p>
                      {job.location && (
                        <p className="text-sm">
                          <span className="text-muted-foreground">Location:</span> {job.location}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium">Worker Quotations:</p>
                      {job.workerBids && job.workerBids.length > 0 ? (
                        job.workerBids.map((bid: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <span className="text-sm font-medium">{bid.workerName ?? bid.name}</span>
                              {bid.rating && (
                                <span className="text-xs text-muted-foreground ml-2">Rating: {bid.rating}</span>
                              )}
                            </div>
                            <span className="font-medium">Rs. {bid.amount ?? bid.quotedPrice}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No worker bids yet.</p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} quotations)
              </p>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </button>
                <button
                  className="px-3 py-1 border rounded text-sm disabled:opacity-50"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
