"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Shield,
  Wrench,
  Briefcase,
  User,
  Sparkles,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ChevronDown,
  HardHat,
  Building2,
  CalendarCheck,
  CheckCircle2,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { getToken, removeToken, api } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";

interface CurrentUser {
  id?: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [user, setUser] = React.useState<CurrentUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    let active = true;
    api
      .get<ApiResponse<CurrentUser>>("/api/auth", token)
      .then((res) => {
        if (active && res.data) {
          setUser(res.data);
        }
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  function handleLogout() {
    removeToken();
    setUser(null);
    router.replace("/login");
  }

  const roleDashboardMap: Record<string, string> = {
    admin: "/admin",
    worker: "/",
    contractor: "/admin/jobs/projects",
    customer: "/services",
  };

  const roleLabels: Record<string, string> = {
    admin: "Super Admin",
    worker: "Service Pro",
    contractor: "Contractor",
    customer: "Customer",
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo/icon.png"
              alt="KaamDo Icon"
              width={40}
              height={40}
              className="w-10 h-10 object-contain drop-shadow-sm"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                Kaam<span className="text-[#FE6705]">Do</span>
              </span>
              <Badge variant="outline" className="hidden sm:inline-flex text-[10px] px-1.5 py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-semibold">
                Verified
              </Badge>
            </div>
            <span className="block text-[10px] text-muted-foreground font-semibold tracking-wider uppercase -mt-0.5">
              Har Kaam, Sahi Insaan
            </span>
          </div>
        </Link>

        {/* Center Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/workers"
            className={cn(
              "hover:text-foreground transition-colors",
              pathname === "/workers" && "text-primary font-semibold"
            )}
          >
            Find Workers
          </Link>
          <Link
            href="/services"
            className={cn(
              "hover:text-foreground transition-colors",
              pathname === "/services" && "text-primary font-semibold"
            )}
          >
            Services
          </Link>
          <Link
            href="/book"
            className={cn(
              "hover:text-foreground transition-colors",
              pathname === "/book" && "text-primary font-semibold"
            )}
          >
            Post a Job
          </Link>
          <Link
            href="/#how-it-works"
            className="hover:text-foreground transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/apps"
            className={cn(
              "flex items-center gap-1.5 hover:text-foreground transition-colors",
              pathname === "/apps" ? "text-primary font-semibold" : ""
            )}
          >
            <Smartphone className="w-4 h-4 text-primary" />
            <span>Download Apps</span>
          </Link>
        </nav>

        {/* Right Desktop Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden lg:inline-flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors py-1.5 px-2"
          >
            Become a Worker
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center gap-2 p-1.5 h-9 rounded-full hover:bg-muted"
                  />
                }
              >
                <Avatar size="sm" className="border border-border">
                  <AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
                    {user.name?.slice(0, 2).toUpperCase() || "KD"}
                  </AvatarFallback>
                  <AvatarBadge className="bg-emerald-500" />
                </Avatar>
                <span className="hidden sm:inline-block text-xs font-semibold text-foreground max-w-[120px] truncate">
                  {user.name}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-foreground">{user.name}</p>
                    <Badge variant="secondary" className="text-[10px]">
                      {roleLabels[user.role || "customer"] || user.role}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{user.phone || user.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => router.push(roleDashboardMap[user.role || "customer"] || "/")}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <LayoutDashboard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>My Workspace</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => router.push("/services")}
                  className="text-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Explore Services</span>
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem
                    onClick={() => router.push("/admin")}
                    className="text-xs cursor-pointer flex items-center gap-2"
                  >
                    <Shield className="h-3.5 w-3.5 text-primary" />
                    <span>Admin Operations</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
                >
                  <LogOut className="h-3.5 w-3.5 text-destructive" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors py-1.5 px-3"
            >
              Sign In
            </Link>
          )}

          {/* Single Primary Action Button */}
          <Button
            size="sm"
            onClick={() => router.push("/book")}
            className="text-xs font-semibold px-4 h-9 bg-primary hover:bg-primary/90 text-primary-foreground shadow-xs transition-colors rounded-lg"
          >
            Post a Job
          </Button>

          {/* Mobile Navigation Drawer */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              render={
                <Button
                  variant="outline"
                  size="icon-sm"
                  className="md:hidden"
                  aria-label="Open Navigation"
                />
              }
            >
              <Menu className="h-4 w-4" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72 p-6 flex flex-col justify-between">
              <div className="space-y-6">
                <SheetHeader className="p-0 text-left">
                  <SheetTitle className="flex items-center gap-2.5">
                    <Image
                      src="/logo/icon.png"
                      alt="KaamDo Icon"
                      width={32}
                      height={32}
                      className="w-8 h-8 object-contain"
                    />
                    <div>
                      <span className="font-extrabold text-foreground">Kaam<span className="text-[#FE6705]">Do</span></span>
                      <p className="text-[10px] text-muted-foreground font-medium">Har Kaam, Sahi Insaan</p>
                    </div>
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1.5 pt-4 text-sm font-medium">
                  <Link
                    href="/workers"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <HardHat className="w-4 h-4 text-primary" />
                    <span>Find Workers</span>
                  </Link>
                  <Link
                    href="/services"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>Services Catalog</span>
                  </Link>
                  <Link
                    href="/book"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <CalendarCheck className="w-4 h-4 text-primary" />
                    <span>Post a Job</span>
                  </Link>
                  <Link
                    href="/#how-it-works"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition"
                  >
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    <span>How It Works</span>
                  </Link>
                  <Link
                    href="/apps"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted text-foreground transition font-semibold text-primary"
                  >
                    <Smartphone className="w-4 h-4 text-primary" />
                    <span>Download Mobile Apps</span>
                  </Link>
                </nav>
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                {user ? (
                  <Button
                    variant="outline"
                    className="w-full justify-start text-xs gap-2"
                    onClick={() => {
                      setMobileOpen(false);
                      router.push(roleDashboardMap[user.role || "customer"] || "/");
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4 text-primary" />
                    <span>Open Dashboard</span>
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full text-xs font-semibold"
                      onClick={() => {
                        setMobileOpen(false);
                        router.push("/login");
                      }}
                    >
                      Sign In
                    </Button>
                    <Button
                      className="w-full text-xs font-semibold bg-primary text-primary-foreground"
                      onClick={() => {
                        setMobileOpen(false);
                        router.push("/book");
                      }}
                    >
                      Post a Job
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}