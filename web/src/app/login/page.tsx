"use client";

import { useState, useEffect, Suspense } from "react";
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
  KeyRound,
  RotateCcw,
  Zap,
  Check,
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
    subtitle: "KYC audits, worker payouts, settings & full platform governance",
    badge: "Super Admin",
    phone: "9876543210",
    passwordRaw: "AdminPassword123!",
    icon: ShieldCheck,
    color: "text-blue-600 dark:text-blue-400",
    borderHover: "hover:border-blue-500",
    bgLight: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
    destination: "/admin",
  },
  {
    id: "customer",
    role: "customer",
    title: "Verified Customer",
    subtitle: "Book services, track workers live on GPS, OTP completion & reviews",
    badge: "Homeowner",
    phone: "9876543211",
    passwordRaw: "CustomerPass123!",
    icon: User,
    color: "text-purple-600 dark:text-purple-400",
    borderHover: "hover:border-purple-500",
    bgLight: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    destination: "/dashboard/customer",
  },
  {
    id: "worker",
    role: "worker",
    title: "Service Professional",
    subtitle: "Claim local jobs, GPS arrival, OTP start, daily attendance & payouts",
    badge: "Technician",
    phone: "9876543212",
    passwordRaw: "WorkerPass123!",
    icon: Wrench,
    color: "text-amber-600 dark:text-amber-400",
    borderHover: "hover:border-amber-500",
    bgLight: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    destination: "/dashboard/worker",
  },
  {
    id: "contractor",
    role: "contractor",
    title: "Commercial Contractor",
    subtitle: "Commercial renovations, multi-crew projects, bidding & milestones",
    badge: "Contractor",
    phone: "9876543213",
    passwordRaw: "ContractorPass123!",
    icon: Building2,
    color: "text-emerald-600 dark:text-emerald-400",
    borderHover: "hover:border-emerald-500",
    bgLight: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    destination: "/dashboard/contractor",
  },
];

function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const cache = useQueryClient();

  const redirectUrl = searchParams.get("redirect") || "";

  // Auth Modes: "demo" | "password" | "otp"
  const [authMode, setAuthMode] = useState<"demo" | "password" | "otp">("demo");

  // Form State
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<SeedRole | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeRoleLoggingIn, setActiveRoleLoggingIn] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successRole, setSuccessRole] = useState<string | null>(null);

  // OTP State
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);

  // Cooldown timer
  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  // Autofill credentials
  const handleSelectRole = (role: SeedRole) => {
    setSelectedRole(role);
    setPhone(role.phone);
    setPassword(role.passwordRaw);
    setError(null);
  };

  // Instant 1-Click Launch for Seed Role
  const handleInstantLaunch = async (role: SeedRole) => {
    setActiveRoleLoggingIn(role.id);
    setSelectedRole(role);
    setPhone(role.phone);
    setPassword(role.passwordRaw);
    setBusy(true);
    setError(null);

    try {
      const result = await api.post<ApiResponse<{ token: string; user: { role: string; name: string } }>>(
        "/api/auth",
        {
          action: "login",
          phone: role.phone,
          password: role.passwordRaw,
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
        title: `Welcome, ${role.title}!`,
        description: `Signed in as ${result.data.user.name || userRole}. Launching portal...`,
        type: "success",
      });

      const target = redirectUrl || role.destination;
      setTimeout(() => {
        router.replace(target);
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Instant launch failed. Try password sign in.";
      setError(msg);
      toast({
        title: "Login Failed",
        description: msg,
        type: "error",
      });
    } finally {
      setBusy(false);
      setActiveRoleLoggingIn(null);
    }
  };

  // Password Login Handler
  const handlePasswordLogin = async (e?: React.FormEvent) => {
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
      }

      setTimeout(() => {
        router.replace(target);
      }, 400);
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

  // OTP Send Handler
  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await api.post<ApiResponse<any>>("/api/auth", {
        action: "send-otp",
        phone: phone.trim(),
      });

      setOtpSent(true);
      setOtpCooldown(60);
      toast({
        title: "OTP Dispatched",
        description: `Verification code sent to +91 ${phone}. (Dev test OTP: 1234)`,
        type: "info",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send OTP.";
      setError(msg);
      toast({ title: "OTP Dispatch Failed", description: msg, type: "error" });
    } finally {
      setBusy(false);
    }
  };

  // OTP Verify Handler
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || !otp) {
      setError("Please provide both phone number and 4-digit OTP.");
      return;
    }

    setBusy(true);
    setError(null);

    try {
      const result = await api.post<ApiResponse<{ token: string; user: { role: string; name: string } }>>(
        "/api/auth",
        {
          action: "verify-otp",
          phone: phone.trim(),
          otp: otp.trim(),
          role: selectedRole?.role || "customer",
        }
      );

      if (!result.data?.token) {
        throw new Error(result.message || "OTP verification failed.");
      }

      cache.clear();
      setToken(result.data.token);

      const userRole = result.data.user.role;
      setSuccessRole(userRole);

      toast({
        title: "Phone Verified!",
        description: `Signed in as ${result.data.user.name || userRole}.`,
        type: "success",
      });

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
      }

      setTimeout(() => {
        router.replace(target);
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Invalid or expired OTP. (Try 1234 in dev mode).";
      setError(msg);
      toast({ title: "Verification Failed", description: msg, type: "error" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between selection:bg-primary/20 selection:text-primary">
      {/* Top Header Bar */}
      <header className="px-6 py-4 border-b border-border bg-card/80 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
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
            <span>Kaam</span>
            <span className="text-primary">Do</span>
          </span>
        </Link>
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted px-3 py-1.5 rounded-lg transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headline, Value Proposition, Trust Highlights */}
        <div className="lg:col-span-5 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Role-Based Authentication Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-foreground leading-[1.12]">
            Sign in with{" "}
            <span className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-transparent">
              1-Click Demo Profiles
            </span>{" "}
            or your account
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            Experience the complete ecosystem as an Administrator, Customer, Field Technician, or Commercial Contractor with full database persistence.
          </p>

          {/* Key Assurance Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 rounded-2xl bg-card border border-border text-left shadow-2xs space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <div className="font-bold text-xs sm:text-sm text-foreground">Aadhaar KYC Enforced</div>
              <p className="text-[11px] text-muted-foreground">Strict permission boundary per role</p>
            </div>
            <div className="p-4 rounded-2xl bg-card border border-border text-left shadow-2xs space-y-1">
              <Briefcase className="w-5 h-5 text-primary" />
              <div className="font-bold text-xs sm:text-sm text-foreground">Live Escrow & Jobs</div>
              <p className="text-[11px] text-muted-foreground">Real MongoDB data with active queues</p>
            </div>
          </div>
        </div>

        {/* Right Form Card */}
        <div className="lg:col-span-7 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/5 space-y-6">
          {/* Auth Mode Tabs */}
          <div className="flex rounded-xl bg-muted p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setAuthMode("demo");
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "demo"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span>1-Click Demo Profiles</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("password");
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "password"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Password Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode("otp");
                setError(null);
              }}
              className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                authMode === "otp"
                  ? "bg-background text-foreground shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>OTP Verify</span>
            </button>
          </div>

          {/* Error Message Alert */}
          {error && (
            <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center gap-2.5 text-xs text-destructive font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1">{error}</span>
            </div>
          )}

          {/* Success Badge */}
          {successRole && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Authenticated as <strong>{successRole.toUpperCase()}</strong>. Opening portal...</span>
            </div>
          )}

          {/* MODE 1: 1-CLICK DEMO ACCESS CARDS */}
          {authMode === "demo" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Select Any Role to Launch Instantly:
                </span>
                <span className="text-[11px] text-muted-foreground">No typing required</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SEED_ROLES.map((role) => {
                  const Icon = role.icon;
                  const isLaunching = activeRoleLoggingIn === role.id;
                  const isSelected = selectedRole?.id === role.id;

                  return (
                    <div
                      key={role.id}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 relative ${
                        isSelected
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                          : `border-border bg-card/60 hover:bg-card ${role.borderHover}`
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className={`w-9 h-9 rounded-xl ${role.bgLight} flex items-center justify-center shrink-0`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-border">
                            {role.badge}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm text-foreground">{role.title}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {role.subtitle}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-border/80 flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {role.phone}
                        </span>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleInstantLaunch(role)}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                        >
                          {isLaunching ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Signing in...</span>
                            </>
                          ) : (
                            <>
                              <span>Launch</span>
                              <ArrowRight className="w-3 h-3" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 bg-muted/40 border border-border rounded-xl text-center text-xs text-muted-foreground">
                Want to test custom credentials? Switch to <button type="button" onClick={() => setAuthMode("password")} className="text-primary font-semibold hover:underline">Password Sign In</button> or <button type="button" onClick={() => setAuthMode("otp")} className="text-primary font-semibold hover:underline">OTP Verify</button>.
              </div>
            </div>
          )}

          {/* MODE 2: PHONE & PASSWORD MANUAL SIGN IN */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                    +91
                  </div>
                  <input
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("otp");
                      setError(null);
                    }}
                    className="text-[11px] text-primary hover:underline font-medium"
                  >
                    Forgot Password? Sign in via OTP
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter account password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition cursor-pointer"
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Autofill helper chips */}
              <div className="pt-1">
                <span className="text-[11px] text-muted-foreground block mb-1.5 font-medium">Quick Autofill Demo Profile:</span>
                <div className="flex flex-wrap gap-1.5">
                  {SEED_ROLES.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                        selectedRole?.id === r.id
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-muted text-muted-foreground border-border hover:bg-muted/80"
                      }`}
                    >
                      {r.title}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={busy}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* MODE 3: OTP PHONE VERIFICATION */}
          {authMode === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      +91
                    </div>
                    <input
                      type="tel"
                      placeholder="98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={busy || otpCooldown > 0}
                    onClick={handleSendOtp}
                    className="px-4 py-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground font-semibold text-xs border border-border transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {otpCooldown > 0 ? `Resend (${otpCooldown}s)` : otpSent ? "Resend OTP" : "Send OTP"}
                  </button>
                </div>
              </div>

              {otpSent && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-foreground">
                      4-Digit Verification Code
                    </label>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Development Test OTP: <strong>1234</strong>
                    </span>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Enter 4-digit code (e.g. 1234)"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono tracking-widest text-base"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={busy || !otpSent}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs sm:text-sm transition-all shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Seed helper strip */}
          <div className="p-3 bg-muted/40 border border-border rounded-xl text-center text-xs text-muted-foreground">
            Seed accounts reset? Run <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[11px] text-foreground font-semibold">npm run seed:marketplace</code> in the terminal.
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border">
        KaamDo Technologies Private Limited © 2026 • Secure Role-Based Authentication
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

