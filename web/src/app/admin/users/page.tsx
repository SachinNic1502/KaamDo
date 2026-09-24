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
import { Search, MoreHorizontal, Eye, Ban, CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Suspense, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useUsers } from "@/hooks/use-api";

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  verified: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  rejected: "bg-gray-100 text-gray-800",
};

const roleColors: Record<string, string> = {
  customer: "bg-purple-100 text-purple-800",
  worker: "bg-orange-100 text-orange-800",
  contractor: "bg-cyan-100 text-cyan-800",
  admin: "bg-gray-100 text-gray-800",
};

export default function UsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12 text-muted-foreground">Loading users...</div>}>
      <UsersContent />
    </Suspense>
  );
}

function UsersContent() {
  const searchParams = useSearchParams();
  const initialRole = searchParams.get("role");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState(
    initialRole && ["customer", "worker", "contractor"].includes(initialRole) ? initialRole : "all"
  );
  const [page, setPage] = useState(1);
  const limit = 10;

  const queryParams = useMemo(() => ({
    page,
    limit,
    search: searchQuery || undefined,
    role: roleFilter !== "all" ? roleFilter : undefined,
  }), [page, searchQuery, roleFilter]);

  const { data, isLoading, error } = useUsers(queryParams);

  const users = (data as { data?: Record<string, unknown>[] } | undefined)?.data ?? [];
  const pagination = (data as { pagination?: { page: number; limit: number; total: number; totalPages: number } } | undefined)?.pagination ?? { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setRoleFilter(value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage all users on the platform</p>
        </div>
        <Button>Add User</Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="worker">Workers</option>
              <option value="contractor">Contractors</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Loading users...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive font-medium">Failed to load users</p>
              <p className="text-muted-foreground text-sm mt-1">Please try again later.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user: Record<string, unknown>) => (
                    <TableRow key={user.id as string}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name as string}</p>
                          <p className="text-sm text-muted-foreground">{user.email as string}</p>
                          <p className="text-sm text-muted-foreground">{user.phone as string}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={roleColors[user.role as string] ?? ""}>{user.role as string}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[user.status as string] ?? ""}>{user.status as string}</Badge>
                      </TableCell>
                      <TableCell>{user.joined as string}</TableCell>
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
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Verify
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Ban className="mr-2 h-4 w-4" />
                              Suspend
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {pagination.page} of {pagination.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
