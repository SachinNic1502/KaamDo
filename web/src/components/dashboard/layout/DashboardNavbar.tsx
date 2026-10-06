import React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Home,
  ExternalLink,
  Sparkles,
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
import { UserSession, roleDashboardMap, roleDisplayNames, roleBadgeColors } from "./types";

interface BreadcrumbCrumb {
  href: string;
  label: string;
  isLast: boolean;
}

interface DashboardNavbarProps {
  user: UserSession | null;
  portalTitle: string;
  isCollapsed: boolean;
  breadcrumbs: BreadcrumbCrumb[];
  onToggleCollapse: () => void;
  onOpenMobileMenu: () => void;
  onLogout: () => Promise<void>;
}

export function DashboardNavbar({
  user,
  portalTitle,
  isCollapsed,
  breadcrumbs,
  onToggleCollapse,
  onOpenMobileMenu,
  onLogout,
}: DashboardNavbarProps) {
  const router = useRouter();
  const badgeColorClass =
    roleBadgeColors[user?.role || "customer"] ||
    "bg-primary/10 text-primary border-primary/20";

  return (
    <header className="h-16 flex-shrink-0 border-b border-border/80 bg-background/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-4 z-10">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile Toggle */}
        <Button
          variant="outline"
          size="icon-sm"
          className="lg:hidden text-foreground"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        {/* Desktop Collapse/Expand Toggle */}
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

        {/* Dynamic Synchronized Breadcrumbs */}
        <Breadcrumb className="hidden sm:flex">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={roleDashboardMap[user?.role || "customer"] || "/"}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Home className="h-3.5 w-3.5" />
                <span>{portalTitle}</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            {breadcrumbs.slice(1).map((b) => (
              <React.Fragment key={b.href}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {b.isLast ? (
                    <BreadcrumbPage className="text-xs font-bold text-foreground">
                      {b.label}
                    </BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink
                      href={b.href}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      {b.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3.5">
        {/* Role Status Tag */}
        <div
          className={cn(
            "hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs",
            badgeColorClass
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
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
            <button className="flex items-center gap-2 p-1 rounded-full hover:bg-muted transition outline-none cursor-pointer" />
          }>
            <Avatar size="sm" className="border border-border">
              <AvatarFallback className="bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground font-bold text-[10px]">
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
              <p className="text-xs font-bold text-foreground">{user?.name}</p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.phone || user?.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <User className="h-3.5 w-3.5 text-muted-foreground" />
              <span>My Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => router.push("/services")}
              className="text-xs cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span>Public Services</span>
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
