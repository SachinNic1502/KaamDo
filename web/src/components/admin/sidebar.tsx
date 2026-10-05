"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
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
  ChevronRight,
  LogOut,
  Calendar,
  Gift,
  Building2,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Sparkles,
  ExternalLink,
  UserCheck,
  HardHat,
  ArrowUpRight,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarBadge,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export interface NavChildItem {
  title: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
}

export interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  children?: NavChildItem[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    group: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        badge: "Live",
        badgeVariant: "secondary",
      },
    ],
  },
  {
    group: "Workforce & Users",
    items: [
      {
        title: "User Directory",
        href: "/admin/users",
        icon: Users,
        children: [
          { title: "All Users", href: "/admin/users", icon: Users },
          { title: "Customers", href: "/admin/users?role=customer", icon: UserCheck },
          { title: "Technicians & Workers", href: "/admin/users?role=worker", icon: HardHat },
          { title: "Contractors", href: "/admin/users/contractors", icon: Building2 },
        ],
      },
      {
        title: "KYC & Verification",
        href: "/admin/kyc",
        icon: ShieldCheck,
        badge: "Audit",
        badgeVariant: "default",
      },
      {
        title: "Services Catalog",
        href: "/admin/services/categories",
        icon: Tag,
        children: [
          { title: "Categories & Skills", href: "/admin/services/categories", icon: Tag },
        ],
      },
    ],
  },
  {
    group: "Operations & Fulfillment",
    items: [
      {
        title: "Jobs & Projects",
        href: "/admin/jobs",
        icon: Briefcase,
        children: [
          { title: "Marketplace Jobs", href: "/admin/jobs", icon: Briefcase },
          { title: "Contractor Projects", href: "/admin/jobs/projects", icon: FileText },
          { title: "Quotations & Bids", href: "/admin/jobs/quotations", icon: FileText },
          { title: "Worker Attendance", href: "/admin/attendance", icon: Calendar, badge: "GPS", badgeVariant: "outline" },
        ],
      },
      {
        title: "Disputes & Support",
        href: "/admin/disputes",
        icon: AlertCircle,
        badgeVariant: "destructive",
      },
    ],
  },
  {
    group: "Finance & Platform",
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
      {
        title: "Promotions & Codes",
        href: "/admin/promotions",
        icon: Gift,
      },
      {
        title: "System Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

interface SidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate?: () => void;
}

export function Sidebar({
  className,
  isCollapsed = false,
  onToggleCollapse,
  onNavigate,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const cache = useQueryClient();
  const [searchQuery, setSearchQuery] = React.useState("");

  // Submenu open states
  const [openMenus, setOpenMenus] = React.useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    navigationGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children) {
          initialState[item.title] = pathname.startsWith(item.href);
        }
      });
    });
    return initialState;
  });

  // Auto-expand menu when active path changes
  React.useEffect(() => {
    navigationGroups.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children && pathname.startsWith(item.href)) {
          setOpenMenus((prev) => ({ ...prev, [item.title]: true }));
        }
      });
    });
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  async function handleLogout() {
    try {
      await api.post("/api/auth", { action: "logout" }, getToken() ?? undefined);
    } catch {
      // Ignore network errors
    } finally {
      removeToken();
      await cache.cancelQueries();
      cache.clear();
      router.replace("/login");
    }
  }

  // Filter groups if search is active
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return navigationGroups;
    const q = searchQuery.toLowerCase();
    return navigationGroups
      .map((g) => ({
        ...g,
        items: g.items.filter(
          (item) =>
            item.title.toLowerCase().includes(q) ||
            item.children?.some((child) => child.title.toLowerCase().includes(q))
        ),
      }))
      .filter((g) => g.items.length > 0);
  }, [searchQuery]);

  return (
    <TooltipProvider>
      <aside
        data-slot="admin-sidebar"
        className={cn(
          "relative flex flex-col h-full bg-card border-r border-border transition-all duration-300 select-none z-20",
          isCollapsed ? "w-20" : "w-72",
          className
        )}
      >
        {/* Brand / Logo Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/80 bg-background/50">
          <Link
            href="/admin"
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 transition-opacity overflow-hidden",
              isCollapsed && "justify-center w-full"
            )}
          >
            <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
              <Image
                src="/logo/icon.png"
                alt="KaamDo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
                priority
              />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-foreground">
                    Kaam<span className="text-[#FE6705]">Do</span>
                  </span>
                  <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-4 border-primary/30 text-primary font-semibold">
                    Admin
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate">
                  Platform Operations
                </span>
              </div>
            )}
          </Link>

          {/* Toggle button on right when expanded */}
          {!isCollapsed && onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onToggleCollapse}
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Expand Toggle Button Bar when collapsed */}
        {isCollapsed && onToggleCollapse && (
          <div className="p-2 border-b border-border/80 flex justify-center">
            <Tooltip>
              <TooltipTrigger render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onToggleCollapse}
                  aria-label="Expand Sidebar"
                  className="w-full h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                >
                  <PanelLeftOpen className="h-4 w-4" />
                </Button>
              } />
              <TooltipContent side="right">Expand Sidebar</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Quick Filter Search when expanded */}
        {!isCollapsed && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search navigation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-[13px] bg-muted/60 hover:bg-muted focus:bg-background border border-border/80 rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2 text-xs text-muted-foreground hover:text-foreground"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        )}

        {/* Navigation Items List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {filteredGroups.map((group) => (
            <div key={group.group} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                  {group.group}
                </div>
              )}
              {isCollapsed && <Separator className="my-2" />}

              {group.items.map((item) => {
                const isGroupActive =
                  pathname === item.href ||
                  (item.href !== "/admin" && pathname.startsWith(item.href));
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openMenus[item.title] ?? false;

                // Collapsed View
                if (isCollapsed) {
                  if (hasChildren) {
                    return (
                      <DropdownMenu key={item.href}>
                        <DropdownMenuTrigger render={
                          <button
                            className={cn(
                              "flex items-center justify-center w-full h-10 rounded-xl transition-all outline-none",
                              isGroupActive
                                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                            title={item.title}
                          >
                            <item.icon className="h-5 w-5" />
                          </button>
                        } />
                        <DropdownMenuContent side="right" align="start" className="w-52">
                          <DropdownMenuLabel className="font-semibold text-xs text-foreground">
                            {item.title}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {item.children?.map((child) => (
                            <DropdownMenuItem
                              key={child.href}
                              onClick={() => {
                                router.push(child.href);
                                onNavigate?.();
                              }}
                              className="text-xs cursor-pointer flex items-center justify-between"
                            >
                              <span>{child.title}</span>
                              {child.badge && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5">
                                  {child.badge}
                                </Badge>
                              )}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    );
                  }

                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger render={
                        <Link
                          href={item.href}
                          onClick={onNavigate}
                          className={cn(
                            "flex items-center justify-center w-full h-10 rounded-xl transition-all",
                            isGroupActive
                              ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </Link>
                      } />
                      <TooltipContent side="right">
                        <span className="font-semibold text-xs">{item.title}</span>
                        {item.badge && (
                          <span className="ml-1.5 text-[10px] opacity-80">({item.badge})</span>
                        )}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                // Expanded View with Submenu
                if (hasChildren) {
                  return (
                    <div key={item.title} className="space-y-0.5">
                      <button
                        type="button"
                        onClick={() => toggleSubmenu(item.title)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 text-[13px] sm:text-sm font-medium rounded-xl transition-all group",
                          isGroupActive
                            ? "bg-muted/80 text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={cn(
                              "p-1.5 rounded-lg transition-colors",
                              isGroupActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </span>
                          <span className="truncate">{item.title}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {item.badge && (
                            <Badge
                              variant={item.badgeVariant || "secondary"}
                              className="text-[11px] px-1.5 py-0 h-4 font-semibold"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight
                            className={cn(
                              "h-4 w-4 text-muted-foreground transition-transform duration-200",
                              isOpen && "rotate-90"
                            )}
                          />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="ml-7 pl-2.5 border-l-2 border-border/80 space-y-1 pt-1 pb-1">
                          {item.children?.map((child) => {
                            const isChildActive =
                              pathname === child.href ||
                              (child.href.includes("?") &&
                                pathname + (typeof window !== "undefined" ? window.location.search : "") === child.href);

                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={onNavigate}
                                className={cn(
                                  "flex items-center justify-between px-2.5 py-1.5 text-[13px] font-medium rounded-lg transition-all",
                                  isChildActive
                                    ? "bg-primary/10 text-primary font-semibold"
                                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                )}
                              >
                                <span className="truncate">{child.title}</span>
                                {child.badge && (
                                  <Badge
                                    variant={child.badgeVariant || "outline"}
                                    className="text-[10px] px-1.5 py-0 h-3.5"
                                  >
                                    {child.badge}
                                  </Badge>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Expanded View Single Nav Item
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-[13px] sm:text-sm font-medium rounded-xl transition-all group",
                      isGroupActive
                        ? "bg-primary text-primary-foreground font-semibold shadow-sm shadow-primary/25"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          isGroupActive
                            ? "bg-white/20 text-white"
                            : "text-muted-foreground group-hover:text-foreground group-hover:bg-muted"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </span>
                      <span className="truncate">{item.title}</span>
                    </div>
                    {item.badge && (
                      <Badge
                        variant={isGroupActive ? "outline" : (item.badgeVariant || "secondary")}
                        className={cn(
                          "text-[11px] px-1.5 py-0 h-4 font-semibold",
                          isGroupActive && "border-white/40 text-white"
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Section: Customer Site Link & User Profile Card */}
        <div className="p-3 border-t border-border/80 bg-background/50 space-y-2">
          {!isCollapsed ? (
            <>
              <Link
                href="/services"
                target="_blank"
                className="flex items-center justify-between w-full px-3 py-2 text-xs sm:text-[13px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Public Marketplace</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <button
                      className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition text-left outline-none group"
                    />
                  }
                >
                  <Avatar size="default" className="border border-border">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                      SA
                    </AvatarFallback>
                    <AvatarBadge className="bg-emerald-500" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      Super Admin
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      admin@kaamdo.com
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
                  <DropdownMenuLabel className="font-semibold text-xs">
                    Admin Session Active
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/settings")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Platform Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => router.push("/services")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>View Customer Site</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                    <span>Log Out Securely</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="outline-none" title="Super Admin">
                    <Avatar size="sm" className="border border-border">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                        SA
                      </AvatarFallback>
                      <AvatarBadge className="bg-emerald-500" />
                    </Avatar>
                  </button>
                } />
                <DropdownMenuContent align="end" side="right" className="w-52">
                  <DropdownMenuLabel>
                    <p className="text-xs font-semibold text-foreground">Super Admin</p>
                    <p className="text-[11px] text-muted-foreground truncate">admin@kaamdo.com</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/admin/settings")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Settings className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Platform Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                    <span>Log Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
