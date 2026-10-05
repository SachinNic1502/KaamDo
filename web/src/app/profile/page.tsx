"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { api, getToken, removeToken } from "@/lib/api-client";
import type { ApiResponse } from "@/lib/api-response";
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Bell,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  KeyRound,
  LogOut,
  Camera,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";

interface UserProfileData {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  avatar?: string;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  notificationSettings?: {
    jobUpdates: boolean;
    chatMessages: boolean;
    paymentReceipts: boolean;
    disputeUpdates: boolean;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = React.useState<UserProfileData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saveLoading, setSaveLoading] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  // Form states
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [notifications, setNotifications] = React.useState({
    jobUpdates: true,
    chatMessages: true,
    paymentReceipts: true,
    disputeUpdates: true,
  });

  // Password state
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [pwdLoading, setPwdLoading] = React.useState(false);
  const [pwdMessage, setPwdMessage] = React.useState<{ text: string; type: "success" | "error" } | null>(null);

  React.useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    api
      .get<ApiResponse<UserProfileData>>("/api/auth", token)
      .then((res) => {
        if (res.data) {
          setProfile(res.data);
          setName(res.data.name || "");
          setEmail(res.data.email || "");
          if (res.data.notificationSettings) {
            setNotifications(res.data.notificationSettings);
          }
        }
      })
      .catch(() => {
        router.replace("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function handleProfileSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setSaveLoading(true);
    setStatusMessage(null);

    try {
      const token = getToken();
      await api.patch<ApiResponse<unknown>>(
        "/api/users",
        {
          userId: profile._id,
          name: name.trim(),
          email: email.trim() || undefined,
          notificationSettings: notifications,
        },
        token || undefined
      );

      setStatusMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err: any) {
      setStatusMessage({ text: err.message || "Failed to update profile.", type: "error" });
    } finally {
      setSaveLoading(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPwdMessage(null);

    if (newPassword.length < 8) {
      setPwdMessage({ text: "New password must be at least 8 characters.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    setPwdLoading(true);
    try {
      const token = getToken();
      await api.post<ApiResponse<unknown>>(
        "/api/auth",
        {
          action: "change-password",
          oldPassword,
          newPassword,
        },
        token || undefined
      );

      setPwdMessage({ text: "Password changed successfully!", type: "success" });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdMessage({ text: err.message || "Failed to change password.", type: "error" });
    } finally {
      setPwdLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/20 flex items-center justify-center p-6">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold animate-pulse">
          KD
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-base font-bold text-foreground">Profile & Account Settings</h1>
            <p className="text-[11px] text-muted-foreground">Manage your credentials, security, and notification preferences</p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            removeToken();
            router.replace("/login");
          }}
          className="text-xs text-destructive hover:bg-destructive/10 gap-1.5"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </header>

      {/* Main Form Body */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Profile Card Header */}
        <Card className="border border-border/80 p-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <div className="relative">
            <Avatar size="lg" className="h-20 w-20 border-2 border-border shadow-md">
              <AvatarFallback className="bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xl">
                {profile?.name?.slice(0, 2).toUpperCase() || "KD"}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-500 h-4 w-4" />
            </Avatar>
          </div>

          <div className="space-y-1 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">{profile?.name}</h2>
              <Badge variant="outline" className="text-xs uppercase font-semibold text-primary border-primary/30 w-fit mx-auto sm:mx-0">
                {profile?.role}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              <span>{profile?.phone}</span>
              {profile?.isPhoneVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              )}
            </p>
          </div>
        </Card>

        {/* Edit Personal Information Form */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold">Personal Information</CardTitle>
            <CardDescription className="text-xs">Update your identity and official communication channels.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileSave} className="space-y-4">
              {statusMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    statusMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {statusMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{statusMessage.text}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Full Name</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Registered Phone Number</label>
                <Input
                  type="text"
                  value={profile?.phone || ""}
                  disabled
                  className="text-xs bg-muted text-muted-foreground"
                />
                <span className="text-[10px] text-muted-foreground">Phone number is verified and tied to security challenges.</span>
              </div>

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="sm" disabled={saveLoading} className="font-semibold text-xs gap-1.5">
                  <Save className="h-3.5 w-3.5" />
                  <span>{saveLoading ? "Saving Changes…" : "Save Profile"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Security & Password Reset Form */}
        <Card className="border border-border/80">
          <CardHeader>
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Lock className="h-4 w-4 text-primary" />
              <span>Security & Password</span>
            </CardTitle>
            <CardDescription className="text-xs">Keep your account secure with a strong password.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4 max-w-lg">
              {pwdMessage && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    pwdMessage.type === "success"
                      ? "bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-emerald-800 dark:text-emerald-300"
                      : "bg-rose-50 dark:bg-rose-950/30 border border-rose-200 text-rose-800 dark:text-rose-300"
                  }`}
                >
                  {pwdMessage.type === "success" ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <span>{pwdMessage.text}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">Current Password</label>
                <Input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Confirm New Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="text-xs"
                  />
                </div>
              </div>

              <Button type="submit" size="sm" variant="outline" disabled={pwdLoading} className="font-semibold text-xs gap-1.5">
                <KeyRound className="h-3.5 w-3.5" />
                <span>{pwdLoading ? "Updating…" : "Update Password"}</span>
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
