"use client";

import Link from "next/link";
import { api, getToken, removeToken } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
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
  ChevronDown,
  ChevronRight,
  LogOut,
  Calendar,
  Gift,
  Building2,
} from "lucide-react";
import { useState } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
    children: [
      { title: "Customers", href: "/admin/users?role=customer", icon: Users },
      { title: "Workers", href: "/admin/users?role=worker", icon: Users },
      { title: "Contractors", href: "/admin/users/contractors", icon: Building2 },
    ],
  },
  {
    title: "Services",
    href: "/admin/services",
    icon: Tag,
    children: [
      { title: "Categories", href: "/admin/services/categories", icon: Tag },
      { title: "KYC Approvals", href: "/admin/services/kyc", icon: ShieldCheck },
    ],
  },
  {
    title: "Jobs & Projects",
    href: "/admin/jobs",
    icon: Briefcase,
    children: [
      { title: "All Jobs", href: "/admin/jobs", icon: Briefcase },
      { title: "Projects", href: "/admin/jobs/projects", icon: FileText },
      { title: "Quotations", href: "/admin/jobs/quotations", icon: FileText },
      { title: "Attendance", href: "/admin/attendance", icon: Calendar },
    ],
  },
  {
    title: "Payments",
    href: "/admin/payments",
    icon: CreditCard,
    children: [
      { title: "Transactions", href: "/admin/payments", icon: CreditCard },
      { title: "Payouts", href: "/admin/payments/payouts", icon: CreditCard },
      { title: "Reconciliation", href: "/admin/payments/reconciliation", icon: CreditCard },
    ],
  },
  {
    title: "Disputes",
    href: "/admin/disputes",
    icon: AlertCircle,
  },
  {
    title: "Promotions",
    href: "/admin/promotions",
    icon: Gift,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function NavItemComponent({ item, depth = 0 }: { item: NavItem; depth?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const hasChildren = item.children && item.children.length > 0;

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        >
          <item.icon className="h-4 w-4" />
          <span>{item.title}</span>
          <span className="ml-auto">
            {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </span>
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children?.map((child) => (
              <NavItemComponent key={child.href} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <item.icon className="h-4 w-4" />
      <span>{item.title}</span>
    </Link>
  );
}

export function Sidebar() {
  const router = useRouter(), cache = useQueryClient();
  async function logout() {
    try { await api.post("/api/auth", { action: "logout" }, getToken() ?? undefined); }
    finally { removeToken(); await cache.cancelQueries(); cache.clear(); router.replace("/login"); }
  }
  return (
    <div className="flex flex-col h-full border-r bg-muted/30">
      <div className="p-6 border-b">
        <Link href="/admin" className="flex items-center gap-3">
          <svg width="36" height="36" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sBlue" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3B82F6"/>
                <stop offset="100%" stopColor="#2563EB"/>
              </linearGradient>
              <linearGradient id="sOrange" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FB923C"/>
                <stop offset="100%" stopColor="#F97316"/>
              </linearGradient>
            </defs>
            <rect x="20" y="30" width="36" height="140" rx="18" fill="url(#sBlue)"/>
            <circle cx="90" cy="42" r="20" fill="url(#sBlue)"/>
            <path d="M56 50 L90 50 L130 90 L110 110 L75 72 L56 90 Z" fill="url(#sOrange)"/>
            <path d="M56 120 L80 120 Q120 120 120 160 Q120 180 100 180 L56 180 Q38 180 38 162 Q38 144 56 144" fill="url(#sBlue)"/>
          </svg>
          <div>
            <span className="font-bold text-lg">
              <span className="text-slate-800">Kaam</span>
              <span className="text-orange-500">Do</span>
            </span>
            <span className="block text-xs text-muted-foreground font-medium">Admin Panel</span>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <NavItemComponent key={item.href} item={item} />
        ))}
      </nav>
      <div className="p-4 border-t">
        <button onClick={() => void logout().catch(() => {})} className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors">
          <LogOut className="h-4 w-4" />
          <span>Logout all devices</span>
        </button>
      </div>
    </div>
  );
}
