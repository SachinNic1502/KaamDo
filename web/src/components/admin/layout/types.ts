export interface AdminUser {
  userId?: string;
  name?: string;
  email?: string;
  phone?: string;
  role: string;
}

export interface SystemHealthData {
  status: "healthy" | "degraded" | "unreachable" | "loading";
  responseTimeMs?: number;
  databaseStatus?: string;
  uptimeSeconds?: number;
  environment?: string;
}

export interface AdminAlert {
  id: string;
  title: string;
  description: string;
  href: string;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  type: "kyc" | "dispute" | "payout" | "system";
}

export interface BreadcrumbCrumb {
  href: string;
  label: string;
  isLast: boolean;
}
