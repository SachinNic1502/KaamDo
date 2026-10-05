import React from "react";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileText,
  CreditCard,
  Settings,
  ShieldCheck,
  BarChart3,
  Tag,
  AlertCircle,
  Calendar,
  Gift,
  Building2,
  Sparkles,
  UserCheck,
  HardHat,
  Receipt,
  Clock,
  CheckCircle2,
  Wallet,
  Star,
  MapPin,
  Search,
  PlusCircle,
  User,
} from "lucide-react";

export interface RoleNavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: {
    title: string;
    href: string;
    icon?: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export interface RoleNavSection {
  section: string;
  items: RoleNavItem[];
}

export const ROLE_NAVIGATION: Record<string, RoleNavSection[]> = {
  admin: [
    {
      section: "Overview",
      items: [
        { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { title: "Analytics", href: "/admin/analytics", icon: BarChart3, badge: "Live", badgeVariant: "secondary" },
      ],
    },
    {
      section: "Workforce & Users",
      items: [
        {
          title: "Users Directory",
          href: "/admin/users",
          icon: Users,
          children: [
            { title: "All Users", href: "/admin/users", icon: Users },
            { title: "Customers", href: "/admin/users?role=customer", icon: UserCheck },
            { title: "Technicians & Workers", href: "/admin/users?role=worker", icon: HardHat },
            { title: "Contractors", href: "/admin/users/contractors", icon: Building2 },
          ],
        },
        { title: "KYC Verifications", href: "/admin/kyc", icon: ShieldCheck, badge: "Audit", badgeVariant: "default" },
        { title: "Services Catalog", href: "/admin/services/categories", icon: Tag },
      ],
    },
    {
      section: "Operations & Fulfillment",
      items: [
        {
          title: "Jobs & Projects",
          href: "/admin/jobs",
          icon: Briefcase,
          children: [
            { title: "All Jobs", href: "/admin/jobs", icon: Briefcase },
            { title: "Commercial Projects", href: "/admin/jobs/projects", icon: FileText },
            { title: "Quotations & Bids", href: "/admin/jobs/quotations", icon: FileText },
            { title: "Attendance & GPS", href: "/admin/attendance", icon: Calendar },
          ],
        },
        { title: "Disputes & Support", href: "/admin/disputes", icon: AlertCircle, badgeVariant: "destructive" },
      ],
    },
    {
      section: "Finance & Platform",
      items: [
        {
          title: "Financials",
          href: "/admin/payments",
          icon: CreditCard,
          children: [
            { title: "Transactions", href: "/admin/payments", icon: CreditCard },
            { title: "Worker Payouts", href: "/admin/payments/payouts", icon: CreditCard },
            { title: "Reconciliation", href: "/admin/payments/reconciliation", icon: CreditCard },
          ],
        },
        { title: "Promotions", href: "/admin/promotions", icon: Gift },
        { title: "Platform Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ],

  customer: [
    {
      section: "Services & Hiring",
      items: [
        { title: "Overview", href: "/dashboard/customer", icon: LayoutDashboard },
        { title: "Find Workers", href: "/workers", icon: Search },
        { title: "Post a Job", href: "/book", icon: PlusCircle },
        { title: "My Jobs", href: "/dashboard/customer?tab=bookings", icon: Briefcase },
      ],
    },
    {
      section: "Account & Support",
      items: [
        { title: "Invoices & Payments", href: "/dashboard/customer?tab=payments", icon: Receipt },
        { title: "Customer Protection", href: "/dashboard/customer?tab=support", icon: AlertCircle },
        { title: "Profile & Settings", href: "/profile", icon: User },
      ],
    },
  ],

  worker: [
    {
      section: "Job Operations",
      items: [
        { title: "Overview", href: "/dashboard/worker", icon: LayoutDashboard },
        { title: "Active Queue", href: "/dashboard/worker?tab=overview", icon: Briefcase, badge: "Live" },
        { title: "Job History", href: "/dashboard/worker?tab=jobs", icon: CheckCircle2 },
        { title: "GPS Schedule", href: "/dashboard/worker?tab=attendance", icon: MapPin },
      ],
    },
    {
      section: "Wallet & Reputation",
      items: [
        { title: "Earnings & Payouts", href: "/dashboard/worker?tab=earnings", icon: Wallet },
        { title: "Reviews & Ratings", href: "/dashboard/worker?tab=reviews", icon: Star },
        { title: "Profile & KYC", href: "/profile", icon: User },
      ],
    },
  ],

  contractor: [
    {
      section: "Contractor Command",
      items: [
        { title: "Projects Dashboard", href: "/dashboard/contractor", icon: LayoutDashboard },
        { title: "Commercial Projects", href: "/dashboard/contractor?tab=projects", icon: Building2, badge: "Active" },
        { title: "Quotations & Bids", href: "/dashboard/contractor?tab=quotations", icon: FileText },
      ],
    },
    {
      section: "Operations & Billing",
      items: [
        { title: "Crew Attendance", href: "/dashboard/contractor?tab=crew", icon: Calendar },
        { title: "Milestone Billing", href: "/dashboard/contractor?tab=billing", icon: CreditCard },
      ],
    },
  ],
};
