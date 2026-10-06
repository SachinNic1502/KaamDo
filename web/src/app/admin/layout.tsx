"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  AdminUser,
  BreadcrumbCrumb,
  AdminLoadingScreen,
  AdminNavbar,
} from "@/components/admin/layout";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const [authorized, setAuthorized] = React.useState(false);
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [adminUser, setAdminUser] = React.useState<AdminUser | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    let active = true;
    const token = getToken();

    if (!token) {
      router.replace("/login");
      return;
    }

    void api
      .get<ApiResponse<AdminUser>>("/api/auth", token)
      .then((response) => {
        if (!active) return;
        if (response.data && response.data.role === "admin") {
          setAuthorized(true);
          setAdminUser(response.data);
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

  // Generate dynamic breadcrumb items from current pathname
  const breadcrumbSegments: BreadcrumbCrumb[] = React.useMemo(() => {
    const segments = pathname.split("/").filter(Boolean);
    return segments.map((seg, idx) => {
      const href = "/" + segments.slice(0, idx + 1).join("/");
      const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      return { href, label, isLast: idx === segments.length - 1 };
    });
  }, [pathname]);

  if (!authorized) {
    return <AdminLoadingScreen />;
  }

  return (
    <TooltipProvider>
      <div className="flex h-screen w-full bg-muted/20 overflow-hidden selection:bg-primary/20 selection:text-primary">
        {/* Desktop Sidebar */}
        <div className="hidden lg:flex flex-shrink-0">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            adminUser={adminUser}
          />
        </div>

        {/* Mobile Drawer Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-72 sm:max-w-xs border-r border-border">
            <Sidebar
              isCollapsed={false}
              onNavigate={() => setMobileMenuOpen(false)}
              adminUser={adminUser}
            />
          </SheetContent>
        </Sheet>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          {/* Top Navbar */}
          <AdminNavbar
            adminUser={adminUser}
            isCollapsed={isCollapsed}
            breadcrumbs={breadcrumbSegments}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onLogout={handleLogout}
          />

          {/* Dynamic Page Content Viewport */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">{children}</div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={<AdminLoadingScreen />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </React.Suspense>
  );
}
