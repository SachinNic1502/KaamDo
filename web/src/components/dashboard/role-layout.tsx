"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { ROLE_NAVIGATION, RoleNavSection, RoleNavItem } from "@/lib/role-navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  LogOut,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowUpRight,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";

export interface UserSession {
  userId?: string;
  name?: string;
  phone?: string;
  email?: string;
  role: "admin" | "customer" | "worker" | "contractor";
}

interface RoleDashboardLayoutProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "customer" | "worker" | "contractor")[];
  portalTitle: string;
  badgeLabel?: string;
}

const roleDashboardMap: Record<string, string> = {
  admin: "/admin",
  customer: "/dashboard/customer",
  worker: "/dashboard/worker",
  contractor: "/dashboard/contractor",
};

const roleDisplayNames: Record<string, string> = {
  admin: "Super Admin",
  customer: "Verified Customer",
  worker: "Service Professional",
  contractor: "Commercial Contractor",
};

export function RoleDashboardLayout({
  children,
  allowedRoles,
  portalTitle,
  badgeLabel,
}: RoleDashboardLayoutProps) {
  const [user, setUser] = React.useState<UserSession | null>(null);
  const [authorized, setAuthorized] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [openSubmenus, setOpenSubmenus] = React.useState<Record<string, boolean>>({});

  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    let active = true;
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get<ApiResponse<UserSession>>("/api/auth", token)
      .then((res) => {
        if (!active) return;
        if (res.data) {
          if (allowedRoles.includes(res.data.role)) {
            setUser(res.data);
            setAuthorized(true);
          } else {
            const targetDashboard = roleDashboardMap[res.data.role] || "/";
            router.replace(targetDashboard);
          }
        } else {
          removeToken();
          router.replace("/login");
        }
      })
      .catch(() => {
        if (active) {
          removeToken();
          router.replace("/login");
        }
      });

    return () => {
      active = false;
    };
  }, [router, allowedRoles]);

  async function handleLogout() {
    try {
      await api.post("/api/auth", { action: "logout" }, getToken() ?? undefined);
    } catch {
      // Ignore network errors
    } finally {
      removeToken();
      router.replace("/login");
    }
  }

  const navSections: RoleNavSection[] = React.useMemo(() => {
    if (!user) return [];
    return ROLE_NAVIGATION[user.role] || [];
  }, [user]);

  // Breadcrumbs
  const breadcrumbs = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    return parts.map((part, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      return { href, label, isLast: idx === parts.length - 1 };
    });
  }, [pathname]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-orange-500 p-0.5 shadow-xl shadow-blue-500/25 animate-pulse">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-white text-xl">K<span className="text-orange-400">D</span></span>
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">Preparing Workspace</h3>
            <p className="text-xs text-muted-foreground">
              Verifying permissions for {portalTitle}…
            </p>
          </div>
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    );
  }

  const renderSidebarContent = (mobile = false) => (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-card select-none">
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-border/80 bg-background/50">
          <Link
            href={roleDashboardMap[user?.role || "customer"] || "/"}
            onClick={() => mobile && setMobileMenuOpen(false)}
            className={cn("flex items-center gap-3 overflow-hidden", isCollapsed && !mobile && "justify-center w-full")}
          >
            <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
              <Image
                src="/logo/icon.png"
                alt="KaamDo"
                width={36}
                height={36}
                className="w-9 h-9 object-contain"
                priority
              />
            </div>
            {(!isCollapsed || mobile) && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-foreground">
                    Kaam<span className="text-[#FE6705]">Do</span>
                  </span>
                  <Badge variant="outline" className="text-[11px] px-1.5 py-0 h-4 font-semibold text-primary border-primary/30">
                    {badgeLabel || user?.role}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground truncate">{portalTitle}</span>
              </div>
            )}
          </Link>

          {!isCollapsed && !mobile && (
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsCollapsed(true)}
              aria-label="Collapse Sidebar"
              title="Collapse Sidebar"
              className="text-muted-foreground hover:text-foreground hover:bg-muted"
            >
              <PanelLeftClose className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Collapsed Top Expand Button */}
        {isCollapsed && !mobile && (
          <div className="p-2 border-b border-border/80 flex justify-center">
            <Tooltip>
              <TooltipTrigger render={
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setIsCollapsed(false)}
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

        {/* Search when expanded */}
        {(!isCollapsed || mobile) && (
          <div className="px-3 pt-3 pb-1">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search menu..."
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

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
          {navSections.map((section) => {
            const filteredItems = section.items.filter((item) =>
              !searchQuery.trim() ||
              item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              item.children?.some((c) => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            if (filteredItems.length === 0) return null;

            return (
              <div key={section.section} className="space-y-1">
                {(!isCollapsed || mobile) && (
                  <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                    {section.section}
                  </div>
                )}
                {isCollapsed && !mobile && <div className="h-px bg-border my-2" />}

                {filteredItems.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && item.href !== "/dashboard/customer" && item.href !== "/dashboard/worker" && item.href !== "/dashboard/contractor" && pathname.startsWith(item.href));
                  const hasChildren = item.children && item.children.length > 0;
                  const isOpen = openSubmenus[item.title] ?? false;

                  // Collapsed View
                  if (isCollapsed && !mobile) {
                    if (hasChildren) {
                      return (
                        <DropdownMenu key={item.href}>
                          <DropdownMenuTrigger render={
                            <button
                              className={cn(
                                "flex items-center justify-center w-full h-9 rounded-md transition-colors outline-none",
                                isActive
                                  ? "bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 font-semibold"
                                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
                              )}
                              title={item.title}
                            >
                              <item.icon className="h-4 w-4" />
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
                                onClick={() => router.push(child.href)}
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
                            className={cn(
                              "flex items-center justify-center w-full h-9 rounded-md transition-colors",
                              isActive
                                ? "bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 font-semibold"
                                : "text-muted-foreground hover:bg-muted hover:text-foreground"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                          </Link>
                        } />
                        <TooltipContent side="right">
                          <span className="font-semibold text-xs">{item.title}</span>
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
                            "w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors group",
                            isActive
                              ? "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold"
                              : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                          )}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                "p-1 rounded transition-colors",
                                isActive
                                  ? "text-[#0456D3] dark:text-blue-400"
                                  : "text-muted-foreground group-hover:text-foreground"
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
                                className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                              >
                                {item.badge}
                              </Badge>
                            )}
                            <ChevronRight
                              className={cn(
                                "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                                isOpen && "rotate-90"
                              )}
                            />
                          </div>
                        </button>

                        {isOpen && (
                          <div className="ml-6 pl-2 border-l border-border/80 space-y-0.5 pt-0.5 pb-0.5">
                            {item.children?.map((child) => (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => mobile && setMobileMenuOpen(false)}
                                className={cn(
                                  "flex items-center justify-between px-2 py-1.5 text-xs font-medium rounded-md transition-colors",
                                  pathname === child.href
                                    ? "bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 font-semibold"
                                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                                )}
                              >
                                <span className="truncate">{child.title}</span>
                                {child.badge && (
                                  <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5">
                                    {child.badge}
                                  </Badge>
                                )}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }

                  // Single Nav Link
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => mobile && setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors group",
                        isActive
                          ? "bg-blue-50 dark:bg-blue-950/60 text-[#0456D3] dark:text-blue-400 font-semibold"
                          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={cn(
                            "p-1 rounded transition-colors",
                            isActive
                              ? "text-[#0456D3] dark:text-blue-400"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge
                          variant={item.badgeVariant || "secondary"}
                          className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-border/80 bg-background/50 space-y-2">
          {(!isCollapsed || mobile) ? (
            <>
              <Link
                href="/services"
                target="_blank"
                className="flex items-center justify-between w-full px-3 py-2 text-xs sm:text-[13px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Public Services</span>
                </div>
                <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition text-left outline-none group" />
                }>
                  <Avatar size="default" className="border border-border">
                    <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || "KD"}
                    </AvatarFallback>
                    <AvatarBadge className="bg-emerald-500" />
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{user?.name || "KaamDo User"}</p>
                    <p className="text-xs text-muted-foreground truncate">{user?.phone || user?.email}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
                  <DropdownMenuLabel>
                    <p className="text-xs font-semibold">{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground">{roleDisplayNames[user?.role || "customer"]}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/services")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Explore Services</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger render={
                  <button className="outline-none" title={user?.name}>
                    <Avatar size="sm" className="border border-border">
                      <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                        {user?.name?.slice(0, 2).toUpperCase() || "KD"}
                      </AvatarFallback>
                      <AvatarBadge className="bg-emerald-500" />
                    </Avatar>
                  </button>
                } />
                <DropdownMenuContent align="end" side="right" className="w-52">
                  <DropdownMenuLabel>
                    <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user?.phone || user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => router.push("/services")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>Public Services</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => void handleLogout()}
                    className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-3.5 w-3.5 text-destructive" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 border-r border-border transition-all duration-300 z-20",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:max-w-xs border-r border-border">
          {renderSidebarContent(true)}
        </SheetContent>
      </Sheet>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile Toggle */}
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Navigation Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* Desktop Collapse/Expand Toggle */}
            <Button
              variant="ghost"
              size="icon-sm"
              className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-muted"
              onClick={() => setIsCollapsed(!isCollapsed)}
              aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>

            <Breadcrumb className="hidden sm:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href={roleDashboardMap[user?.role || "customer"] || "/"} className="flex items-center gap-1 text-xs">
                    <Home className="h-3.5 w-3.5" />
                    <span>{portalTitle}</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbs.slice(1).map((b) => (
                  <React.Fragment key={b.href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {b.isLast ? (
                        <BreadcrumbPage className="text-xs font-semibold">{b.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={b.href} className="text-xs">{b.label}</BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{roleDisplayNames[user?.role || "customer"]}</span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => window.open("/services", "_blank")}
            >
              <span>Marketplace</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>

            {/* Profile Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger render={
                <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition outline-none" />
              }>
                <Avatar size="sm" className="border border-border">
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                    {user?.name?.slice(0, 2).toUpperCase() || "KD"}
                  </AvatarFallback>
                  <AvatarBadge className="bg-emerald-500" />
                </Avatar>
                <span className="hidden xl:block text-xs font-semibold text-foreground max-w-[120px] truncate">
                  {user?.name}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-xs font-semibold text-foreground">{user?.name}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{user?.phone || user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/services")}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Public Services</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => void handleLogout()}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
