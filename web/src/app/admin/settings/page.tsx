"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Plus, Trash2, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { getToken } from "@/lib/api-client";

interface CommissionRule {
  category: string;
  type: "percentage" | "fixed";
  value: number;
}

interface CancellationPolicy {
  status: string;
  fee: string;
}

interface NotificationSetting {
  name: string;
  description: string;
  enabled: boolean;
}

interface SettingsState {
  platformName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  description: string;
  commissionRules: CommissionRule[];
  cancellationPolicies: CancellationPolicy[];
  notifications: NotificationSetting[];
  serviceAreas: string[];
}

const defaultSettings: SettingsState = {
  platformName: "KaamDo",
  tagline: "Har Kaam, Sahi Insaan",
  supportEmail: "support@kaamdo.com",
  supportPhone: "+91 1800-123-4567",
  description: "One platform for getting local work done.",
  commissionRules: [
    { category: "Electrician", type: "percentage", value: 10 },
    { category: "Plumbing", type: "percentage", value: 12 },
    { category: "AC Repair", type: "percentage", value: 10 },
    { category: "Carpentry", type: "percentage", value: 10 },
    { category: "Cleaning", type: "percentage", value: 15 },
    { category: "Painting Contract", type: "percentage", value: 5 },
    { category: "Labor", type: "fixed", value: 30 },
  ],
  cancellationPolicies: [
    { status: "Before assignment", fee: "Free" },
    { status: "After assignment", fee: "5% of job value" },
    { status: "Worker en route", fee: "Visit charge" },
    { status: "Worker arrived", fee: "Full visit charge" },
    { status: "Work started", fee: "No cancellation" },
  ],
  notifications: [
    { name: "New Job", description: "Send notification for new job events", enabled: true },
    { name: "Job Accepted", description: "Send notification when job is accepted", enabled: true },
    { name: "Worker Assigned", description: "Send notification when worker is assigned", enabled: true },
    { name: "Payment Received", description: "Send notification for payment received", enabled: true },
    { name: "Dispute Update", description: "Send notification for dispute updates", enabled: true },
    { name: "KYC Status", description: "Send notification for KYC status changes", enabled: true },
  ],
  serviceAreas: ["Mumbai", "Delhi NCR", "Bengaluru", "Hyderabad", "Pune", "Chennai", "Kolkata"],
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settings");
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          setSettings({
            platformName: json.data.platformName || defaultSettings.platformName,
            tagline: json.data.tagline || defaultSettings.tagline,
            supportEmail: json.data.supportEmail || defaultSettings.supportEmail,
            supportPhone: json.data.supportPhone || defaultSettings.supportPhone,
            description: json.data.description || defaultSettings.description,
            commissionRules: json.data.commissionRules?.length ? json.data.commissionRules : defaultSettings.commissionRules,
            cancellationPolicies: json.data.cancellationPolicies?.length ? json.data.cancellationPolicies : defaultSettings.cancellationPolicies,
            notifications: json.data.notifications?.length ? json.data.notifications : defaultSettings.notifications,
            serviceAreas: json.data.serviceAreas?.length ? json.data.serviceAreas : defaultSettings.serviceAreas,
          });
        }
      }
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (partialUpdates?: Partial<SettingsState>) => {
    try {
      setSaving(true);
      setFeedback(null);
      const token = getToken();
      const payload = partialUpdates || settings;

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.message || "Failed to update settings");
      }

      setFeedback({ type: "success", message: "Settings saved successfully!" });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update settings";
      setFeedback({ type: "error", message });
    } finally {
      setSaving(false);
    }
  };

  const updateCommissionRule = (index: number, field: "type" | "value", val: string | number) => {
    const updated = [...settings.commissionRules];
    if (field === "type") {
      updated[index].type = val as "percentage" | "fixed";
    } else {
      updated[index].value = Number(val) || 0;
    }
    setSettings({ ...settings, commissionRules: updated });
  };

  const updateCancellationPolicy = (index: number, val: string) => {
    const updated = [...settings.cancellationPolicies];
    updated[index].fee = val;
    setSettings({ ...settings, cancellationPolicies: updated });
  };

  const toggleNotification = (index: number) => {
    const updated = [...settings.notifications];
    updated[index].enabled = !updated[index].enabled;
    setSettings({ ...settings, notifications: updated });
  };

  const addCity = () => {
    if (!newCity.trim()) return;
    if (settings.serviceAreas.includes(newCity.trim())) return;
    const updated = [...settings.serviceAreas, newCity.trim()];
    setSettings({ ...settings, serviceAreas: updated });
    setNewCity("");
  };

  const removeCity = (city: string) => {
    const updated = settings.serviceAreas.filter((c) => c !== city);
    setSettings({ ...settings, serviceAreas: updated });
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading platform settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Platform Settings</h1>
          <p className="text-muted-foreground">Configure live platform rules, commission rates, policies, and service coverage</p>
        </div>
        {feedback && (
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium animate-in fade-in duration-200 ${
              feedback.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400"
                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400"
            }`}
          >
            {feedback.type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {feedback.message}
          </div>
        )}
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="commission">Commission</TabsTrigger>
          <TabsTrigger value="cancellation">Cancellation</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="service-areas">Service Areas</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Basic platform identification and contact channels</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.platformName}
                    onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Helpline Phone</Label>
                  <Input
                    value={settings.supportPhone}
                    onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Platform Description</Label>
                <Textarea
                  rows={3}
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                />
              </div>
              <div className="pt-2">
                <Button onClick={() => saveSettings()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save General Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Commission Rules Tab */}
        <TabsContent value="commission" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Configure take-rate rules per service category for automated ledger splits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {settings.commissionRules.map((rule, index) => (
                  <div key={rule.category} className="flex flex-wrap items-center gap-4 p-3 bg-muted/30 border rounded-lg">
                    <span className="w-48 font-medium text-sm">{rule.category}</span>
                    <select
                      className="px-3 py-2 border rounded-md text-sm w-36 bg-background"
                      value={rule.type}
                      onChange={(e) => updateCommissionRule(index, "type", e.target.value)}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Flat (₹)</option>
                    </select>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        className="w-28"
                        value={rule.value}
                        onChange={(e) => updateCommissionRule(index, "value", e.target.value)}
                      />
                      <span className="text-sm font-semibold text-muted-foreground">
                        {rule.type === "percentage" ? "%" : "₹"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button onClick={() => saveSettings()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Commission Rules
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cancellation Policy Tab */}
        <TabsContent value="cancellation" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cancellation Policy Rules</CardTitle>
              <CardDescription>Define customer cancellation penalty tiers based on live dispatch state</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {settings.cancellationPolicies.map((policy, index) => (
                  <div key={policy.status} className="flex flex-wrap items-center justify-between gap-4 p-3 border rounded-lg">
                    <span className="w-56 font-medium text-sm text-foreground">{policy.status}</span>
                    <Input
                      className="w-64"
                      value={policy.fee}
                      onChange={(e) => updateCancellationPolicy(index, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button onClick={() => saveSettings()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Cancellation Policy
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Triggers</CardTitle>
              <CardDescription>Control automated push and WhatsApp alerts for marketplace lifecycle milestones</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {settings.notifications.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-sm text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      variant={item.enabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleNotification(index)}
                      className={item.enabled ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                    >
                      {item.enabled ? "Enabled" : "Disabled"}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <Button onClick={() => saveSettings()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Notification Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Service Areas Tab */}
        <TabsContent value="service-areas" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Coverage Zones</CardTitle>
              <CardDescription>Add or remove supported cities for worker matching and customer job creation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3 max-w-md">
                <Input
                  placeholder="Enter city or district name..."
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addCity()}
                />
                <Button onClick={addCity} variant="secondary">
                  <Plus className="mr-2 h-4 w-4" /> Add City
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {settings.serviceAreas.map((city) => (
                  <div key={city} className="flex items-center justify-between px-3 py-2.5 bg-muted/40 border rounded-lg">
                    <span className="font-medium text-sm">{city}</span>
                    <button
                      type="button"
                      onClick={() => removeCity(city)}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                      title="Remove city"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <Button onClick={() => saveSettings()} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Service Areas
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
