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
import { Search, CheckCircle, XCircle, Clock } from "lucide-react";
import { useState } from "react";
import { useAttendance, useUpdateAttendance } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  present: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  absent: "bg-red-100 text-red-800",
  late: "bg-orange-100 text-orange-800",
  half_day: "bg-yellow-100 text-yellow-800",
  rejected: "bg-gray-100 text-gray-800",
};

interface AttendanceRecord {
  _id: string;
  workerId?: { name?: string; phone?: string } | string;
  jobId?: { jobNumber?: string } | string;
  customerId?: { name?: string; phone?: string } | string;
  date?: string;
  checkIn?: string | null;
  checkOut?: string | null;
  workingHours?: number;
  status?: string;
  approvedWage?: number;
}

export default function AttendancePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split("T")[0]);

  const { data, isLoading, error } = useAttendance();
  const updateAttendance = useUpdateAttendance();

  const records: AttendanceRecord[] = (data as unknown as { data?: AttendanceRecord[] })?.data ?? [];

  const filtered = records.filter((r) => {
    const workerName = (r.workerId && typeof r.workerId === "object" && r.workerId.name) || (typeof r.workerId === "string" && r.workerId) || "-";
    const jobNumber = (r.jobId && typeof r.jobId === "object" && r.jobId.jobNumber) || (typeof r.jobId === "string" && r.jobId) || "-";
    const customerName = (r.customerId && typeof r.customerId === "object" && r.customerId.name) || (typeof r.customerId === "string" && r.customerId) || "-";
    const matchSearch =
      workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customerName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchDate = r.date ? r.date.startsWith(dateFilter) : true;
    return matchSearch && matchDate;
  });

  const totalHours = filtered.reduce((sum, r) => sum + (r.workingHours || 0), 0);
  const totalWage = filtered.reduce((sum, r) => sum + (r.approvedWage || 0), 0);
  const presentCount = filtered.filter((r) => r.status !== "absent").length;

  const handleStatus = (id: string, status: string) => {
    updateAttendance.mutate({ attendanceId: id, status });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-muted-foreground">Track labor attendance and daily wages</p>
        </div>
        <Button>Export Report</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{presentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Today</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{filtered.length - presentCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{totalHours}h</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wages</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">₹{totalWage.toLocaleString()}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search workers..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <Input type="date" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="w-48" />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12 text-muted-foreground">Loading attendance...</div>
          ) : error ? (
            <div className="flex justify-center py-12 text-red-500">Failed to load attendance.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker</TableHead>
                  <TableHead>Job ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Wage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">No records found.</TableCell>
                  </TableRow>
                ) : (
                  filtered.map((record) => {
                    const workerName = (record.workerId && typeof record.workerId === "object" && record.workerId.name) || (typeof record.workerId === "string" ? record.workerId : "-");
                    const jobNumber = (record.jobId && typeof record.jobId === "object" && record.jobId.jobNumber) || (typeof record.jobId === "string" ? record.jobId : "-");
                    const customerName = (record.customerId && typeof record.customerId === "object" && record.customerId.name) || (typeof record.customerId === "string" ? record.customerId : "-");
                    return (
                    <TableRow key={record._id}>
                      <TableCell className="font-medium">{workerName}</TableCell>
                      <TableCell>{jobNumber}</TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>{record.checkIn || "-"}</TableCell>
                      <TableCell>{record.checkOut || "-"}</TableCell>
                      <TableCell>{record.workingHours || 0}h</TableCell>
                      <TableCell><Badge className={statusColors[record.status || ""]}>{record.status}</Badge></TableCell>
                      <TableCell>₹{record.approvedWage || 0}</TableCell>
                      <TableCell className="text-right">
                        {record.status === "present" && (
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatus(record._id, "approved")}
                              disabled={updateAttendance.isPending}
                            >
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStatus(record._id, "rejected")}
                              disabled={updateAttendance.isPending}
                            >
                              <XCircle className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
