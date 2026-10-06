"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  ExternalLink,
  Settings,
  User,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { AdminUser, BreadcrumbCrumb } from "./types";
import { AdminHealthBadge } from "./AdminHealthBadge";
import { AdminAlertsDropdown } from "./AdminAlertsDropdown";

interface AdminNavbarProps {
  adminUser: AdminUser | null;
  isCollapsed: boolean;
  breadcrumbs: BreadcrumbCrumb[];
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => Promise<void>;
}

export function AdminNavbar({
  adminUser,
  isCollapsed,
  breadcrumbs,
  onToggleCollapse,
  onOpenMobileMenu,
  onLogout,
}: AdminNavbarProps) {
  const router = useRouter();

  const initials = React.useMemo(() => {
    if (!adminUser?.name) return "AD";
    const parts = adminUser.name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return adminUser.name.slice(0, 2).toUpperCase();
  }, [adminUser?.name]);

  return (
    <header className="h-16 flex-shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-10">
      {/* Left: Mobile Toggle, Desktop Toggle, & Breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="outline"
          size="icon-sm"
          className="lg:hidden text-foreground"
          onClick={onOpenMobileMenu}
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={onToggleCollapse}
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>

        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                <Home className="h-3.5 w-3.5" />
                <span>Admin</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.slice(1).map((seg) => (
              <React.Fragment key={seg.href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {seg.isLast ? (
                    <BreadcrumbPage className="text-xs font-semibold text-foreground">
                      {seg.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink href={seg.href} className="text-xs text-muted-foreground hover:text-foreground">
                      {seg.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Right: Health Status, Quick Link, Alerts & Profile */}
      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Real Live System Health */}
        <AdminHealthBadge />

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

        {/* Live Admin Alerts Dropdown */}
        <AdminAlertsDropdown />

        {/* Admin Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger render={
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition outline-none cursor-pointer" />
          }>
            <Avatar size="sm" className="border border-border">
              <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-[10px]">
                {initials}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-500" />
            </Avatar>
            <span className="hidden xl:block text-xs font-semibold text-foreground max-w-[120px] truncate">
              {adminUser?.name || "Admin"}
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <p className="text-xs font-semibold text-foreground">{adminUser?.name || "Super Admin"}</p>
              <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email || adminUser?.phone || "admin@kaamdo.com"}</p>
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
              onClick={() => void onLogout()}
              className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-3.5 w-3.5 text-destructive" />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
