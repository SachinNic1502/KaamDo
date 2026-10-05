"use client";

import * as React from "react";
import Image from "next/image";
import { Sidebar } from "@/components/admin/sidebar";
import { useRouter, usePathname } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import {
  Menu,
  Bell,
  Search,
  CheckCircle2,
  ExternalLink,
  Shield,
  LogOut,
  Settings,
  Sparkles,
  Command,
  ChevronRight,
  Home,
  User,
  PanelLeftClose,
  PanelLeftOpen,
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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState<{ name?: string; email?: string; phone?: string } | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    let active = true;
    void api
      .get<ApiResponse<{ role: string; name?: string; email?: string; phone?: string }>>(
        "/api/auth",
        getToken() ?? undefined
      )
      .then((response) => {
        if (!active) return;
        if (response.data?.role === "admin") {
          setAuthorized(true);
          setAdminUser({
            name: response.data.name || "Super Admin",
            email: response.data.email || "admin@kaamdo.com",
            phone: response.data.phone,
          });
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
  }, [router]);

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

  // Generate breadcrumb items from pathname
  const breadcrumbSegments = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      return { href, label, isLast: idx === segments.length - 1 };
    });
  }, [pathname]);

  if (!authorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 text-center max-w-sm px-6">
          <div className="relative w-16 h-16 flex items-center justify-center animate-pulse">
            <Image
              src="/logo/icon.png"
              alt="KaamDo"
              width={64}
              height={64}
              className="w-16 h-16 object-contain"
              priority
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-base text-foreground">Authorizing Access</h3>
            <p className="text-xs text-muted-foreground">
              Verifying administrative credentials and security tokens…
            </p>
          </div>
          <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary rounded-full animate-indeterminate" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>

      {/* Mobile Drawer Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:max-w-xs border-r border-border">
          <Sidebar
            isCollapsed={false}
            onNavigate={() => setMobileMenuOpen(false)}
          />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-10">
          {/* Left: Mobile Toggle & Breadcrumbs */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="outline"
              size="icon-sm"
              className="lg:hidden text-foreground"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Mobile Menu"
            >
              <Menu className="h-4 w-4" />
            </Button>

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
                  <BreadcrumbLink href="/admin" className="flex items-center gap-1 text-xs">
                    <Home className="h-3.5 w-3.5" />
                    <span>Admin</span>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {breadcrumbSegments.slice(1).map((seg) => (
                  <React.Fragment key={seg.href}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {seg.isLast ? (
                        <BreadcrumbPage className="text-xs font-semibold">
                          {seg.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={seg.href} className="text-xs">
                          {seg.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Right: Actions, Status & User Menu */}
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            {/* System Status Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live System</span>
            </div>

            {/* Quick Link to Marketplace */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={() => window.open("/services", "_blank")}
            >
              <span>Marketplace</span>
              <ExternalLink className="h-3 w-3 opacity-60" />
            </Button>

            {/* Notifications Button */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="icon-sm"
                    className="relative text-muted-foreground hover:text-foreground rounded-lg"
                    aria-label="Notifications"
                  />
                }
              >
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] font-bold text-white shadow-xs">
                  2
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel className="font-semibold text-xs flex items-center justify-between">
                  <span>System Alerts</span>
                  <Badge variant="secondary" className="text-[10px]">2 New</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <div className="p-2 rounded-lg bg-muted/50 text-xs space-y-1">
                    <p className="font-medium text-foreground">KYC Documents Pending</p>
                    <p className="text-[11px] text-muted-foreground">3 new worker verifications require admin review.</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50 text-xs space-y-1">
                    <p className="font-medium text-foreground">Daily Reconciliation</p>
                    <p className="text-[11px] text-muted-foreground">Payment gateway reconciliation completed successfully.</p>
                  </div>
                  <div className="pt-1 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push("/notifications")}
                      className="w-full text-xs text-primary justify-center font-semibold"
                    >
                      View All Notifications
                    </Button>
                  </div>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition outline-none" />
                }
              >
                <Avatar size="sm" className="border border-border">
                  <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                    SA
                  </AvatarFallback>
                  <AvatarBadge className="bg-emerald-500" />
                </Avatar>
                <span className="hidden xl:block text-xs font-semibold text-foreground">
                  {adminUser?.name || "Super Admin"}
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-xs font-semibold text-foreground">{adminUser?.name || "Super Admin"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email || "admin@kaamdo.com"}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push("/profile")}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Profile & Settings</span>
                </DropdownMenuItem>
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
                  <span>Public Marketplace</span>
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

        {/* Dynamic Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
