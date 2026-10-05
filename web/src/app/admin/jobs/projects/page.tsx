"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, IndianRupee } from "lucide-react";
import { useState } from "react";
import { useProjects } from "@/hooks/use-api";
import { useToast } from "@/components/ui/toast";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  on_hold: "bg-orange-100 text-orange-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-gray-100 text-gray-800",
};

export default function ProjectsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    totalAmount: "",
    customerId: "",
    contractorId: "",
  });

  const { data, isLoading, error, refetch } = useProjects({
    search: searchQuery || undefined,
    status: statusFilter !== "all" ? statusFilter : undefined,
  });

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectForm.title || !projectForm.totalAmount) {
      toast({
        title: "Validation Error",
        description: "Please enter project title and total amount.",
        type: "error",
      });
      return;
    }
    try {
      setCreating(true);
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: projectForm.title.trim(),
          description: projectForm.description.trim(),
          totalAmount: Number(projectForm.totalAmount) || 10000,
          milestones: [
            { title: "Initial Advance", amount: (Number(projectForm.totalAmount) || 10000) * 0.3, status: "pending" },
            { title: "Mid-way Completion", amount: (Number(projectForm.totalAmount) || 10000) * 0.4, status: "pending" },
            { title: "Final Handover", amount: (Number(projectForm.totalAmount) || 10000) * 0.3, status: "pending" },
          ],
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setProjectForm({ title: "", description: "", totalAmount: "", customerId: "", contractorId: "" });
        refetch();
        toast({
          title: "Project Created",
          description: "Project created successfully.",
          type: "success",
        });
      } else {
        const json = await res.json();
        toast({
          title: "Failed",
          description: json.error || "Failed to create project.",
          type: "error",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Error creating project.",
        type: "error",
      });
    } finally {
      setCreating(false);
    }
  };

  const projects = data?.data ?? [];
  const pagination = data?.pagination;

  const totalProjects = pagination?.total ?? projects.length;
  const inProgress = projects.filter((p: any) => p.status === "in_progress").length;
  const completed = projects.filter((p: any) => p.status === "completed").length;
  const totalValue = projects.reduce((sum: number, p: any) => sum + (p.totalAmount ?? 0), 0);

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Projects</h1>
            <p className="text-muted-foreground">Manage contractor projects and milestones</p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>Create Project</Button>
        </div>
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            Failed to load projects. Please try again later.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-muted-foreground">Manage contractor projects and milestones</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>Create Project</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "—" : totalProjects}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "—" : inProgress}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "—" : completed}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{isLoading ? "—" : `₹${(totalValue / 100000).toFixed(1)}L`}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search projects..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 border rounded-md text-sm">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="on_hold">On Hold</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg p-4 animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-2">
                      <div className="h-5 w-48 bg-muted rounded" />
                      <div className="h-4 w-64 bg-muted rounded" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="space-y-1">
                        <div className="h-3 w-16 bg-muted rounded" />
                        <div className="h-4 w-24 bg-muted rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">No projects found.</div>
          ) : (
            <div className="space-y-4">
              {projects.map((project: any) => {
                const milestones = project.milestones ?? 0;
                const completedMilestones = project.completedMilestones ?? 0;
                const progress = milestones > 0 ? Math.round((completedMilestones / milestones) * 100) : 0;
                return (
                  <div key={project.id ?? project._id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{project.title}</h3>
                          <Badge className={statusColors[project.status] ?? ""}>{(project.status ?? "").replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{project.customer} → {project.contractor}</p>
                      </div>
                      <Button variant="ghost" size="icon"><Eye className="h-4 w-4" /></Button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Category</p>
                        <p className="font-medium">{project.category}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Amount</p>
                        <p className="font-medium">₹{(project.totalAmount ?? 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Milestones</p>
                        <p className="font-medium">{completedMilestones}/{milestones} completed</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Timeline</p>
                        <p className="font-medium">{project.startDate} → {project.endDate}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200 dark:border-gray-800">
            <h2 className="text-lg font-bold">Create New Contractor Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-500">Project Title</label>
                <Input
                  placeholder="e.g. Commercial Office Renovation"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Project Description</label>
                <Input
                  placeholder="Scope of work and requirements..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500">Total Project Value (₹)</label>
                <Input
                  placeholder="50000"
                  type="number"
                  value={projectForm.totalAmount}
                  onChange={(e) => setProjectForm({ ...projectForm, totalAmount: e.target.value })}
                  required
                />
              </div>
              <div className="flex gap-2 pt-3 justify-end">
                <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
