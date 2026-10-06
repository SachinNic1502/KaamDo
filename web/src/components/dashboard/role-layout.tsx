"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { ROLE_NAVIGATION, RoleNavSection } from "@/lib/role-navigation";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  type UserSession,
  type RoleDashboardLayoutProps,
  roleDashboardMap,
  roleDisplayNames,
  roleBadgeColors,
  WorkspaceLoading,
  SidebarHeader,
  SidebarSearch,
  SidebarNav,
  SidebarFooter,
  DashboardNavbar,
} from "./layout";

export type { UserSession, RoleDashboardLayoutProps };
export { roleDashboardMap, roleDisplayNames, roleBadgeColors };

function RoleDashboardLayoutContent({
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
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") : null;

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

  // Accurate active matching considering base path + tab query params
  const isItemActive = React.useCallback(
    (href: string) => {
      const [itemPath, itemQuery] = href.split("?");

      const isBaseExact = pathname === itemPath;
      const isBaseSubpath =
        itemPath !== "/admin" &&
        itemPath !== "/dashboard/customer" &&
        itemPath !== "/dashboard/worker" &&
        itemPath !== "/dashboard/contractor" &&
        pathname.startsWith(itemPath + "/");

      if (!isBaseExact && !isBaseSubpath) {
        return false;
      }

      // If item has a query like ?tab=bookings
      if (itemQuery) {
        const itemParams = new URLSearchParams(itemQuery);
        const itemTab = itemParams.get("tab");
        if (itemTab) {
          return currentTab === itemTab;
        }
      }

      // If item has no query (e.g. /dashboard/customer), it is active only if no tab or tab is overview
      return !currentTab || currentTab === "overview";
    },
    [pathname, currentTab]
  );

  // Sync breadcrumbs with active tab
  const breadcrumbs = React.useMemo(() => {
    const parts = pathname.split("/").filter(Boolean);
    const crumbs = parts.map((part, idx) => {
      const href = "/" + parts.slice(0, idx + 1).join("/");
      const label = part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
      return { href, label, isLast: idx === parts.length - 1 && !currentTab };
    });

    if (currentTab && currentTab !== "overview") {
      let tabTitle = currentTab.charAt(0).toUpperCase() + currentTab.slice(1).replace(/-/g, " ");
      navSections.forEach((sec) => {
        sec.items.forEach((item) => {
          if (item.href.includes(`tab=${currentTab}`)) {
            tabTitle = item.title;
          }
        });
      });

      crumbs.push({
        href: `${pathname}?tab=${currentTab}`,
        label: tabTitle,
        isLast: true,
      });
    }

    return crumbs;
  }, [pathname, currentTab, navSections]);

  const toggleSubmenu = (title: string) => {
    setOpenSubmenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  if (!authorized) {
    return <WorkspaceLoading portalTitle={portalTitle} />;
  }

  const renderSidebar = (mobile = false) => (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-card select-none">
        <SidebarHeader
          role={user?.role}
          portalTitle={portalTitle}
          badgeLabel={badgeLabel}
          isCollapsed={isCollapsed}
          mobile={mobile}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <SidebarSearch
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClear={() => setSearchQuery("")}
        />

        <SidebarNav
          navSections={navSections}
          searchQuery={searchQuery}
          isCollapsed={isCollapsed}
          mobile={mobile}
          openSubmenus={openSubmenus}
          onToggleSubmenu={toggleSubmenu}
          isItemActive={isItemActive}
          onNavigateMobile={() => setMobileMenuOpen(false)}
        />

        <SidebarFooter
          user={user}
          isCollapsed={isCollapsed}
          mobile={mobile}
          onLogout={handleLogout}
        />
      </div>
    </TooltipProvider>
  );

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden selection:bg-primary/20 selection:text-primary">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col flex-shrink-0 border-r border-border transition-all duration-300 z-20",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        {renderSidebar(false)}
      </aside>

      {/* Mobile Drawer */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-72 sm:max-w-xs border-r border-border">
          {renderSidebar(true)}
        </SheetContent>
      </Sheet>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <DashboardNavbar
          user={user}
          portalTitle={portalTitle}
          isCollapsed={isCollapsed}
          breadcrumbs={breadcrumbs}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onLogout={handleLogout}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function RoleDashboardLayout(props: RoleDashboardLayoutProps) {
  return (
    <React.Suspense fallback={<WorkspaceLoading portalTitle={props.portalTitle} />}>
      <RoleDashboardLayoutContent {...props} />
    </React.Suspense>
  );
}
