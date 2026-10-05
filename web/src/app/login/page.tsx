"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { api, setToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import { useToast } from "@/components/ui/toast";
import {
  ShieldCheck,
  Wrench,
  User,
  Briefcase,
  Building2,
  Lock,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  ChevronLeft,
  AlertCircle,
} from "lucide-react";

interface SeedRole {
  id: string;
  role: "admin" | "customer" | "worker" | "contractor";
  title: string;
  subtitle: string;
  badge: string;
  phone: string;
  passwordRaw: string;
  icon: any;
  color: string;
  borderHover: string;
  bgLight: string;
  destination: string;
}

const SEED_ROLES: SeedRole[] = [
  {
    id: "admin",
    role: "admin",
    title: "Super Admin",
    subtitle: "KYC approvals, payouts, settings, and platform oversight",
    badge: "Full Access",
    phone: "9876543210",
    passwordRaw: "AdminPassword123!",
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500",
    bgLight: "bg-blue-50 dark:bg-blue-950/40",
    destination: "/admin",
  },
  {
    id: "customer",
    role: "customer",
    title: "Verified Customer",
    subtitle: "Book services, live technician tracking, reviews & invoices",
    badge: "Consumer",
    phone: "9876543211",
    passwordRaw: "CustomerPass123!",
    icon: User,
    color: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-500",
    bgLight: "bg-purple-50 dark:bg-purple-950/40",
    destination: "/dashboard/customer",
  },
  {
    id: "worker",
    role: "worker",
    title: "Professional Worker",
    subtitle: "Accept jobs, OTP work start, attendance & earnings ledger",
    badge: "Technician",
    phone: "9876543212",
    passwordRaw: "WorkerPass123!",
    icon: Wrench,
    color: "text-orange-600 dark:text-orange-400",
    borderHover: "hover:border-orange-500",
    bgLight: "bg-orange-50 dark:bg-orange-950/40",
    destination: "/dashboard/worker",
  },
  {
    id: "contractor",
    role: "contractor",
    title: "Commercial Contractor",
    subtitle: "Large renovation projects, team bidding & milestone delivery",
    badge: "Contractor",
    phone: "9876543213",
    passwordRaw: "ContractorPass123!",
    icon: Building2,
    color: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500",
    bgLight: "bg-emerald-50 dark:bg-emerald-950/40",
    destination: "/dashboard/contractor",
  },
];

function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cache = useQueryClient();

  const redirectUrl = searchParams.get("redirect") || "";

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<SeedRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  const handleSelectRole = (role: SeedRole) => {
    setSelectedRole(role);
    setPhone(role.phone);
    setPassword(role.passwordRaw);
    setError(null);
    toast({
      title: `${role.title} Demo`,
      description: `Autofilled credentials for ${role.title}. Click Sign In to continue.`,
      type: "info",
    });
  };

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!phone || !password) {
      const msg = "Please enter both phone number and password.";
      setError(msg);
      toast({ title: "Incomplete Credentials", description: msg, type: "error" });
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const result = await api.post<ApiResponse<{ token: string; user: { role: string; name: string } }>>(
        "/api/auth",
        {
          action: "login",
          phone: phone.trim(),
          password,
        }
      );

      if (!result.data?.token) {
        throw new Error(result.message || "Authentication failed.");
      }

      cache.clear();
      setToken(result.data.token);

      const userRole = result.data.user.role;
      setSuccessRole(userRole);

      toast({
        title: "Welcome Back!",
        description: `Signed in as ${result.data.user.name || userRole}.`,
        type: "success",
      });

      // Determine redirect target
      let target = "/dashboard";
      if (redirectUrl) {
        target = redirectUrl;
      } else if (userRole === "admin") {
        target = "/admin";
      } else if (userRole === "customer") {
        target = "/dashboard/customer";
      } else if (userRole === "worker") {
        target = "/dashboard/worker";
      } else if (userRole === "contractor") {
        target = "/dashboard/contractor";
      } else {
        target = "/dashboard";
      }

      setTimeout(() => {
        router.replace(target);
      }, 500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Sign in failed. Check credentials.";
      setError(msg);
      toast({
        title: "Login Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-between">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Image
              src="/logo/icon.png"
              alt="KaamDo Icon"
              width={32}
              height={32}
              className="w-8 h-8 object-contain"
              priority
            />
          </div>
          <span className="text-xl font-black tracking-tight">
            <span className="text-slate-900 dark:text-white">Kaam</span>
            <span className="text-[#FE6705]">Do</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Info Column (5 cols) */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            Seed Roles & Live Authentication
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            Sign In with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Demo Profiles</span> or Your Account
          </h1>

          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Select any pre-configured role below to test the platform as an Administrator, Customer, Field Technician, or Commercial Contractor.
          </p>

          {/* Quick Metrics / Assurance */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
              <ShieldCheck className="w-5 h-5 text-emerald-600 mb-1" />
              <div className="font-bold text-sm text-slate-900 dark:text-white">Role-Based Access</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict authorization containment enforced</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left">
              <Briefcase className="w-5 h-5 text-blue-600 mb-1" />
              <div className="font-bold text-sm text-slate-900 dark:text-white">Active Ledger</div>
              <p className="text-[11px] text-slate-400 mt-0.5">Real DB persistence with 0 mock delays</p>
            </div>
          </div>
        </div>

        {/* Right Form Card (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-900/5 space-y-6">
          {/* Seed Roles Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                1-Click Quick Demo Sign In
              </span>
              <span className="text-[11px] text-slate-400">Click to autofill credentials</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {SEED_ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleSelectRole(role)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-start gap-3 relative ${
                      isSelected
                        ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20 shadow-md"
                        : `border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 ${role.borderHover}`
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-xl ${role.bgLight} ${role.color} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0 pr-5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                          {role.title}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {role.subtitle}
                      </p>
                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400 font-mono">
                        <span>{role.phone}</span>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-blue-600 absolute top-3.5 right-3.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
            <span className="flex-shrink mx-4 text-[11px] text-slate-400 uppercase font-semibold">
              Or Sign In with Phone & Password
            </span>
            <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-center gap-2.5 text-xs text-red-700 dark:text-red-300 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Badge */}
          {successRole && (
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Authenticated as <strong>{successRole.toUpperCase()}</strong>. Redirecting...</span>
            </div>
          )}

          {/* Manual Input Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>
                    {selectedRole ? `Sign In as ${selectedRole.title}` : "Sign In to KaamDo"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Helper Text */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl text-center">
            <span className="text-[11px] text-slate-500">
              Need fresh database seeds? Run <code className="bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono text-[10px] text-slate-700 dark:text-slate-300">npm run seed:marketplace</code> in the terminal.
            </span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800">
        KaamDo Technologies Private Limited © 2026 • Secure Role-Based Authentication
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
