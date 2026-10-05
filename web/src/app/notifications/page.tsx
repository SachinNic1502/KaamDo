"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/api-client";
import {
  Bell,
  CheckCheck,
  Briefcase,
  CreditCard,
  AlertCircle,
  Clock,
  ArrowLeft,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { EmptyState } from "@/components/dashboard/dashboard-components";

interface NotificationItem {
  id: string;
  category: "job" | "payment" | "security" | "system";
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = React.useState<NotificationItem[]>([]);
  const [activeTab, setActiveTab] = React.useState("all");

  React.useEffect(() => {
    const token = getToken();
    if (!token) router.replace("/login");
  }, [router]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markItemAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? ({ ...n, isRead: true } as NotificationItem) : n)));
  };

  const filteredNotifications = React.useMemo(() => {
    if (activeTab === "unread") return notifications.filter((n) => !n.isRead);
    if (activeTab === "job") return notifications.filter((n) => n.category === "job");
    if (activeTab === "payment") return notifications.filter((n) => n.category === "payment");
    return notifications;
  }, [notifications, activeTab]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-muted/20">
      {/* Top Header */}
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
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-foreground">Notifications & Activity Feed</h1>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="text-xs px-2 py-0.5">
                  {unreadCount} Unread
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">Platform alerts, job progress, and transaction receipts</p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            size="sm"
            variant="outline"
            onClick={markAllAsRead}
            className="text-xs font-semibold gap-1.5"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            <span>Mark All as Read</span>
          </Button>
        )}
      </header>

      {/* Main Viewport */}
      <main className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 sm:w-auto sm:inline-flex">
            <TabsTrigger value="all" className="text-xs">All ({notifications.length})</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs">Unread ({unreadCount})</TabsTrigger>
            <TabsTrigger value="job" className="text-xs">Jobs</TabsTrigger>
            <TabsTrigger value="payment" className="text-xs">Billing</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="pt-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <EmptyState
                icon={Bell}
                title="All caught up!"
                description="You have no notifications in this category. We will notify you when job updates or transactions occur."
              />
            ) : (
              <div className="space-y-3">
                {filteredNotifications.map((item) => (
                  <Card
                    key={item.id}
                    onClick={() => markItemAsRead(item.id)}
                    className={`border transition-all cursor-pointer ${
                      item.isRead
                        ? "border-border/60 bg-card hover:border-border"
                        : "border-primary/40 bg-primary/5 hover:border-primary/60 shadow-xs"
                    }`}
                  >
                    <CardContent className="p-4 flex items-start gap-3.5">
                      <div className="p-2.5 rounded-xl bg-muted flex-shrink-0 mt-0.5">
                        {item.category === "job" && <Briefcase className="h-4 w-4 text-blue-600" />}
                        {item.category === "payment" && <CreditCard className="h-4 w-4 text-emerald-600" />}
                        {item.category === "security" && <ShieldCheck className="h-4 w-4 text-indigo-600" />}
                        {item.category === "system" && <Sparkles className="h-4 w-4 text-orange-600" />}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`text-xs sm:text-sm ${item.isRead ? "font-semibold text-foreground" : "font-bold text-foreground"}`}>
                            {item.title}
                          </p>
                          <span className="text-[11px] text-muted-foreground flex-shrink-0 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.timestamp}</span>
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{item.message}</p>
                      </div>

                      {item.actionUrl && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            markItemAsRead(item.id);
                            router.push(item.actionUrl!);
                          }}
                          className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                          title="Open Link"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
