"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RoleDashboardLayout } from "@/components/dashboard/role-layout";
import {
  StatMetricCard,
  DashboardHeader,
  EmptyState,
  CanonicalStatusBadge,
} from "@/components/dashboard/dashboard-components";
import { useProjects, useAttendance } from "@/hooks/use-api";
import {
  Building2,
  Briefcase,
  CheckCircle2,
  Clock,
  DollarSign,
  Users,
  Calendar,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

function ContractorDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  const { data: projectsData, isLoading: projectsLoading } = useProjects({ limit: 50 });
  const { data: attendanceData, isLoading: attendanceLoading } = useAttendance({ limit: 20 });

  const projects = (projectsData?.data as any[]) || [];
  const attendance = (attendanceData?.data as any[]) || [];

  const activeProjects = projects.filter((p) => ["in_progress", "active", "approved"].includes(p.status));
  const completedProjects = projects.filter((p) => p.status === "completed");
  const totalContractValue = projects.reduce((sum, p) => sum + (p.budget || p.totalAmount || 0), 0);

  return (
    <RoleDashboardLayout
      allowedRoles={["contractor"]}
      portalTitle="Contractor Command"
      badgeLabel="Contractor"
    >
      <div className="space-y-6">
        {/* Header */}
        <DashboardHeader
          title="Contractor Projects Suite"
          description="Manage multi-stage commercial contracts, milestone billing, team crew attendance, and proposals."
        >
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => router.push("/admin/jobs/projects")}
              className="text-xs font-semibold gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project Proposal</span>
            </Button>
          </div>
        </DashboardHeader>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatMetricCard
            title="Active Contracts"
            value={projectsLoading ? "…" : activeProjects.length}
            icon={Building2}
            iconBg="bg-blue-500/10"
            iconColor="text-blue-600 dark:text-blue-400"
            description="Ongoing commercial sites"
          />
          <StatMetricCard
            title="Completed Sites"
            value={projectsLoading ? "…" : completedProjects.length}
            icon={CheckCircle2}
            iconBg="bg-emerald-500/10"
            iconColor="text-emerald-600 dark:text-emerald-400"
            description="Handed-over projects"
          />
          <StatMetricCard
            title="Total Contract Value"
            value={projectsLoading ? "…" : `₹${totalContractValue.toLocaleString("en-IN")}`}
            icon={DollarSign}
            iconBg="bg-indigo-500/10"
            iconColor="text-indigo-600 dark:text-indigo-400"
            description="Gross pipeline valuation"
          />
          <StatMetricCard
            title="Crew Punches"
            value={attendanceLoading ? "…" : attendance.length}
            icon={Users}
            iconBg="bg-amber-500/10"
            iconColor="text-amber-600 dark:text-amber-400"
            description="Worker attendance logs"
          />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(val) => router.push(`/dashboard/contractor?tab=${val}`)}>
          <TabsList className="grid w-full grid-cols-3 sm:w-auto sm:inline-flex">
            <TabsTrigger value="overview" className="text-xs">Active Projects ({activeProjects.length})</TabsTrigger>
            <TabsTrigger value="projects" className="text-xs">All Contracts ({projects.length})</TabsTrigger>
            <TabsTrigger value="crew" className="text-xs">Crew Attendance ({attendance.length})</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-2">
            {activeProjects.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="No active commercial contracts"
                description="Commercial infrastructure and renovation contracts assigned to your enterprise will be tracked here with milestone progress and payroll records."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeProjects.map((p) => {
                  const milestones = p.milestones || [];
                  const completedMilestones = milestones.filter((m: any) => m.status === "completed").length;
                  const progressPct = milestones.length > 0 ? Math.round((completedMilestones / milestones.length) * 100) : 0;

                  return (
                    <Card key={p._id} className="border border-border/80">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-muted-foreground">{p.projectNumber || "PRJ-001"}</span>
                          <CanonicalStatusBadge status={p.status} />
                        </div>
                        <CardTitle className="text-base font-bold text-foreground mt-1">{p.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
                        
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Milestones Progress</span>
                            <span className="font-bold text-foreground">{progressPct}% ({completedMilestones}/{milestones.length})</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                            <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                          <span className="text-muted-foreground">Client: {p.customerId?.name || "Corporate Client"}</span>
                          <span className="font-bold text-foreground">Budget: ₹{(p.budget || p.totalAmount || 0).toLocaleString("en-IN")}</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* All Contracts Tab */}
          <TabsContent value="projects" className="pt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">Commercial Contracts Registry</CardTitle>
              </CardHeader>
              <CardContent>
                {projects.length === 0 ? (
                  <EmptyState
                    icon={FileText}
                    title="No contracts registered"
                    description="Your commercial contracts will appear here."
                  />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-border bg-muted/40 text-muted-foreground font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="py-2.5 px-3">Project</th>
                          <th className="py-2.5 px-3">Client</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Value</th>
                          <th className="py-2.5 px-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {projects.map((p) => (
                          <tr key={p._id} className="hover:bg-muted/30">
                            <td className="py-3 px-3 font-semibold text-foreground">{p.title}</td>
                            <td className="py-3 px-3 text-muted-foreground">{p.customerId?.name || "Client"}</td>
                            <td className="py-3 px-3"><CanonicalStatusBadge status={p.status} /></td>
                            <td className="py-3 px-3 text-right font-bold text-foreground">₹{(p.budget || p.totalAmount || 0).toLocaleString("en-IN")}</td>
                            <td className="py-3 px-3 text-right text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crew Attendance Tab */}
          <TabsContent value="crew" className="pt-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold">On-Site Crew Roster & GPS Attendance</CardTitle>
              </CardHeader>
              <CardContent>
                {attendance.length === 0 ? (
                  <EmptyState
                    icon={Calendar}
                    title="No crew punches logged"
                    description="When your technicians and subcontractors log shifts, records will show here."
                  />
                ) : (
                  <div className="divide-y divide-border">
                    {attendance.map((att: any) => (
                      <div key={att._id} className="py-3 flex items-center justify-between text-xs">
                        <div>
                          <p className="font-semibold text-foreground">{att.workerId?.name || "Worker"} ({att.workerId?.phone})</p>
                          <p className="text-[11px] text-muted-foreground">{new Date(att.date).toLocaleDateString()}</p>
                        </div>
                        <CanonicalStatusBadge status={att.status} />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </RoleDashboardLayout>
  );
}

export default function ContractorDashboardPage() {
  return (
    <React.Suspense fallback={<div className="p-8 text-center text-sm text-slate-500">Loading contractor portal...</div>}>
      <ContractorDashboardContent />
    </React.Suspense>
  );
}
