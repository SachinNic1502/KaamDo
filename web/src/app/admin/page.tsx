"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardStats } from "@/hooks/use-api";
import {
  Users,
  Briefcase,
  CreditCard,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  in_progress: "bg-blue-100 text-blue-800",
  pending: "bg-yellow-100 text-yellow-800",
  disputed: "bg-red-100 text-red-800",
  cancelled: "bg-gray-100 text-gray-800",
};

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  iconColor: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading, error } = useDashboardStats();

  const stats = data?.data as
    | {
        totalUsers?: number;
        totalWorkers?: number;
        verifiedWorkers?: number;
        activeWorkers?: number;
        totalCustomers?: number;
        totalContractors?: number;
        totalJobs?: number;
        activeJobs?: number;
        completedJobs?: number;
        cancelledJobs?: number;
        revenue?: number;
        commission?: number;
        pendingPayouts?: number;
        completedPayouts?: number;
        disputes?: number;
        recentJobs?: {
          id: string;
          customer?: string;
          worker?: string;
          service?: string;
          amount?: number;
          status?: string;
          date?: string;
        }[];
        pendingVerifications?: {
          name?: string;
          skill?: string;
          experience?: string;
          submitted?: string;
        }[];
      }
    | undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-lg font-medium">Failed to load dashboard data</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error ? error.message : "An unexpected error occurred"}
        </p>
      </div>
    );
  }

  const formatCurrency = (value?: number) =>
    value !== undefined ? `₹${value.toLocaleString("en-IN")}` : "₹0";

  const formatNumber = (value?: number) =>
    value !== undefined ? value.toLocaleString("en-IN") : "0";

  const topStats = [
    {
      title: "Total Users",
      value: formatNumber(stats?.totalUsers),
      icon: Users,
      iconColor: "text-muted-foreground",
    },
    {
      title: "Active Jobs",
      value: formatNumber(stats?.activeJobs),
      icon: Briefcase,
      iconColor: "text-muted-foreground",
    },
    {
      title: "Revenue",
      value: formatCurrency(stats?.revenue),
      icon: CreditCard,
      iconColor: "text-muted-foreground",
    },
    {
      title: "Disputes",
      value: formatNumber(stats?.disputes),
      icon: AlertCircle,
      iconColor: "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to KaamDo Admin Panel</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentJobs && stats.recentJobs.length > 0 ? (
                stats.recentJobs.map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{job.id}</span>
                        {job.status && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              statusColors[job.status] ?? "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {job.status.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {job.customer ?? "N/A"} → {job.worker ?? "N/A"}
                      </p>
                      <p className="text-sm">{job.service ?? "N/A"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(job.amount)}</p>
                      {job.date && (
                        <p className="text-xs text-muted-foreground">{job.date}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No recent jobs
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.pendingVerifications && stats.pendingVerifications.length > 0 ? (
                stats.pendingVerifications.map((worker, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{worker.name ?? "N/A"}</span>
                      {worker.submitted && (
                        <span className="text-xs text-muted-foreground">
                          {worker.submitted}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {worker.skill ?? "N/A"}
                    </p>
                    <p className="text-sm">{worker.experience ?? "N/A"}</p>
                    <div className="flex gap-2">
                      <button className="flex-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600">
                        Approve
                      </button>
                      <button className="flex-1 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No pending verifications
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Completed Jobs"
          value={formatNumber(stats?.completedJobs)}
          icon={CheckCircle}
          iconColor="text-green-500"
        />
        <StatCard
          title="Active Workers"
          value={formatNumber(stats?.activeWorkers)}
          icon={Clock}
          iconColor="text-blue-500"
        />
        <StatCard
          title="Cancelled Jobs"
          value={formatNumber(stats?.cancelledJobs)}
          icon={XCircle}
          iconColor="text-red-500"
        />
      </div>
    </div>
  );
}
