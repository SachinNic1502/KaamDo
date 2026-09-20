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
import { Search, Eye, CheckCircle, XCircle, Building2 } from "lucide-react";
import { useState } from "react";

const contractors = [
  { id: "1", name: "BuildRight Constructions", owner: "Suresh Reddy", phone: "+91 98765 43216", email: "suresh@buildright.com", teamSize: 15, projects: 23, rating: 4.6, status: "verified", joined: "2023-12-28" },
  { id: "2", name: "HomeCare Services", owner: "Ramesh Gupta", phone: "+91 98765 43220", email: "ramesh@homecare.com", teamSize: 8, projects: 12, rating: 4.2, status: "verified", joined: "2024-01-05" },
  { id: "3", name: "QuickFix Solutions", owner: "Anil Sharma", phone: "+91 98765 43221", email: "anil@quickfix.com", teamSize: 5, projects: 7, rating: 4.0, status: "under_review", joined: "2024-01-10" },
  { id: "4", name: "ProPainters Inc", owner: "Deepak Patel", phone: "+91 98765 43222", email: "deepak@propainters.com", teamSize: 12, projects: 31, rating: 4.8, status: "verified", joined: "2023-11-15" },
  { id: "5", name: "ElectricPro Services", owner: "Manoj Kumar", phone: "+91 98765 43223", email: "manoj@electricpro.com", teamSize: 6, projects: 18, rating: 3.9, status: "suspended", joined: "2023-10-20" },
];

const statusColors: Record<string, string> = {
  verified: "bg-green-100 text-green-800",
  under_review: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-800",
};

export default function ContractorsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = contractors.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Contractors</h1>
          <p className="text-muted-foreground">Manage contractor accounts and businesses</p>
        </div>
        <Button>Add Contractor</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Contractors</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">45</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verified</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">38</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <XCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">5</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Building2 className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">28</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contractors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Team Size</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{c.owner}</p>
                      <p className="text-xs text-muted-foreground">{c.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell>{c.teamSize}</TableCell>
                  <TableCell>{c.projects}</TableCell>
                  <TableCell>⭐ {c.rating}</TableCell>
                  <TableCell><Badge className={statusColors[c.status]}>{c.status.replace(/_/g, " ")}</Badge></TableCell>
                  <TableCell>{c.joined}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
