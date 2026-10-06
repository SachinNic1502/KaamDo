export interface UserSession {
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "admin" | "customer" | "worker" | "contractor";
}

export interface RoleDashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "customer" | "worker" | "contractor")[];
  portalTitle: string;
  badgeLabel?: string;
}

export const roleDashboardMap: Record<string, string> = {
  admin: "/admin",
  customer: "/dashboard/customer",
  worker: "/dashboard/worker",
  contractor: "/dashboard/contractor",
};

export const roleDisplayNames: Record<string, string> = {
  admin: "Super Admin",
  customer: "Verified Customer",
  worker: "Service Professional",
  contractor: "Commercial Contractor",
};

export const roleBadgeColors: Record<string, string> = {
  admin: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  customer: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  worker: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  contractor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
};
