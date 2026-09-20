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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  Download,
  CreditCard,
  TrendingUp,
  Wallet,
  AlertCircle,
} from "lucide-react";
import { useState } from "react";
import { usePayments } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
  refunded: "bg-gray-100 text-gray-800",
  paid: "bg-green-100 text-green-800",
  eligible: "bg-purple-100 text-purple-800",
};

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("transactions");

  const { data, isLoading, error } = usePayments({
    search: searchQuery || undefined,
  });

  const payments = data?.data ?? [];
  const pagination = data?.pagination;

  const stats = {
    totalRevenue: payments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    platformFees: payments
      .filter((p: any) => p.status === "completed")
      .reduce((sum: number, p: any) => sum + (p.platformFee || 0), 0),
    pendingPayouts: payments
      .filter((p: any) => p.status === "pending")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
    refunds: payments
      .filter((p: any) => p.status === "refunded")
      .reduce((sum: number, p: any) => sum + (p.amount || 0), 0),
  };

  const transactions = payments.filter(
    (p: any) => p.type === "transaction" || !p.type
  );
  const payouts = payments.filter((p: any) => p.type === "payout");

  const displayData = activeTab === "transactions" ? transactions : payouts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="text-muted-foreground">Manage transactions and payouts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From completed transactions
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Fees</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.platformFees.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Total platform earnings
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.pendingPayouts.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p: any) => p.status === "pending").length} pending
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refunds</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.refunds.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {payments.filter((p: any) => p.status === "refunded").length} refunds processed
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`pb-2 px-4 text-sm font-medium ${
            activeTab === "transactions"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`pb-2 px-4 text-sm font-medium ${
            activeTab === "payouts"
              ? "border-b-2 border-primary text-primary"
              : "text-muted-foreground"
          }`}
        >
          Payouts
        </button>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-muted-foreground">Loading payments...</div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-destructive">Failed to load payments. Please try again.</div>
            </div>
          ) : activeTab === "transactions" ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Job</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Worker Earning</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.map((txn: any) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-medium">{txn.id}</TableCell>
                      <TableCell>{txn.jobId}</TableCell>
                      <TableCell>{txn.customer}</TableCell>
                      <TableCell>{txn.worker}</TableCell>
                      <TableCell className="font-medium">₹{txn.amount}</TableCell>
                      <TableCell className="text-red-600">₹{txn.platformFee}</TableCell>
                      <TableCell className="text-green-600">
                        ₹{txn.workerEarning}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[txn.status] ?? "bg-gray-100 text-gray-800"}>
                          {txn.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{txn.date}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="mr-2 h-4 w-4" />
                              Download Invoice
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Payout ID</TableHead>
                  <TableHead>Worker</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No payouts found.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayData.map((payout: any) => (
                    <TableRow key={payout.id}>
                      <TableCell className="font-medium">{payout.id}</TableCell>
                      <TableCell>{payout.worker}</TableCell>
                      <TableCell className="font-medium">₹{payout.amount}</TableCell>
                      <TableCell>{payout.account}</TableCell>
                      <TableCell>
                        <Badge className={statusColors[payout.status] ?? "bg-gray-100 text-gray-800"}>
                          {payout.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{payout.date}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          Process
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
          {pagination && (
            <div className="flex items-center justify-between mt-4 text-sm text-muted-foreground">
              <span>
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
