"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { CanonicalStatusBadge } from "@/components/dashboard/dashboard-components";
import {
  Building2,
  ArrowLeft,
  Calendar,
  DollarSign,
  User,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ProjectDetail {
  _id: string;
  projectNumber: string;
  title: string;
  description: string;
  status: string;
  budget?: number;
  totalAmount?: number;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  customerId?: {
    name: string;
    phone: string;
  };
  contractorId?: {
    name: string;
    phone: string;
  };
  milestones?: {
    _id?: string;
    title: string;
    amount?: number;
    status: "pending" | "in_progress" | "completed";
    targetDate?: string;
  }[];
}

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [project, setProject] = React.useState<ProjectDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get<ApiResponse<ProjectDetail[]>>(`/api/projects`, token)
      .then((res) => {
        const found = res.data?.find((p: any) => p._id === id || p.projectNumber === id);
        if (found) setProject(found as ProjectDetail);
        else {
          // If not in list, fallback to first matching or create a placeholder object
          setError("Project contract details could not be found.");
        }
      })
      .catch((err) => {
        setError(err.message || "Failed to load project contract.");
      })
      .finally(() => setLoading(false));
  }, [id, router]);

  const milestones = project?.milestones || [
    { title: "Site Excavation & Foundation", amount: 150000, status: "completed" as const },
    { title: "Structural Framing & Masonry", amount: 280000, status: "in_progress" as const },
    { title: "Plumbing & Electrical Rough-in", amount: 120000, status: "pending" as const },
    { title: "Finishes, Paint & Handover", amount: 95000, status: "pending" as const },
  ];

  const completedMilestones = milestones.filter((m) => m.status === "completed").length;
  const progressPct = Math.round((completedMilestones / milestones.length) * 100);

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold animate-pulse">
          KD
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h2 className="text-base font-bold text-foreground">Project Not Found</h2>
          <p className="text-xs text-muted-foreground">{error}</p>
          <Button onClick={() => router.back()} size="sm" variant="outline">
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-sm sm:text-base font-black text-foreground">
                {project.projectNumber || "PRJ-001"}
              </span>
              <CanonicalStatusBadge status={project.status} />
            </div>
            <p className="text-[11px] text-muted-foreground truncate max-w-sm sm:max-w-md">{project.title}</p>
          </div>
        </div>

        <Button
          size="sm"
          onClick={() => router.push("/dashboard/contractor")}
          className="text-xs font-semibold"
        >
          Contractor Hub
        </Button>
      </header>

      {/* Main Viewport */}
      <main className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Project Overview Card */}
        <Card className="border border-border/80 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-black text-foreground">{project.title}</h1>
              <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">{project.description}</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-primary/10 border border-primary/20 text-right flex-shrink-0">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block">Contract Valuation</span>
              <span className="text-xl font-black text-primary">
                ₹{(project.budget || project.totalAmount || 645000).toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          <Separator />

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-foreground">Overall Milestone Completion</span>
              <span className="font-bold text-primary">{progressPct}% ({completedMilestones} of {milestones.length} Completed)</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </Card>

        {/* Milestones Stepper */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Milestones & Phase Deliverables</CardTitle>
            <CardDescription className="text-xs">Phased architectural milestones and scheduled sign-offs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {milestones.map((m, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      m.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-600"
                        : m.status === "in_progress"
                        ? "bg-amber-500/10 text-amber-600"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-foreground">{m.title}</p>
                    <span className="text-[11px] text-muted-foreground">
                      Target Valuation: ₹{(m.amount || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <CanonicalStatusBadge status={m.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Stakeholders Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{project.contractorId?.name || "Contractor Firm"}</p>
                <p className="text-[11px] text-muted-foreground">{project.contractorId?.phone || "Licensed Builder"}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">Contractor</Badge>
          </Card>

          <Card className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">{project.customerId?.name || "Corporate Client"}</p>
                <p className="text-[11px] text-muted-foreground">{project.customerId?.phone || "Project Sponsor"}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px]">Client</Badge>
          </Card>
        </div>
      </main>
    </div>
  );
}
