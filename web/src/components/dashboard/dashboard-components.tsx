"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getStatusBadgeClass } from "@/lib/status-colors";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus, AlertCircle } from "lucide-react";

export interface StatMetricProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconBg?: string;
  iconColor?: string;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  badge?: string;
  className?: string;
  onClick?: () => void;
}

export function StatMetricCard({
  title,
  value,
  icon: Icon,
  iconBg = "bg-primary/10",
  iconColor = "text-primary",
  description,
  trend,
  badge,
  className,
  onClick,
}: StatMetricProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "relative overflow-hidden border border-border/80 bg-card hover:border-border transition-all duration-200 shadow-xs",
        onClick && "cursor-pointer hover:shadow-md hover:-translate-y-0.5",
        className
      )}
    >
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground truncate">
                {title}
              </span>
              {badge && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                  {badge}
                </Badge>
              )}
            </div>
            <div className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {value}
            </div>
          </div>
          <div className={cn("p-3 rounded-2xl flex-shrink-0 flex items-center justify-center", iconBg)}>
            <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
          </div>
        </div>

        {(description || trend) && (
          <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
            {description && <span className="truncate">{description}</span>}
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 font-semibold ml-auto",
                  trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.isPositive ? (
                  <ArrowUpRight className="h-3.5 w-3.5" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5" />
                )}
                <span>{trend.value}</span>
                {trend.label && <span className="text-muted-foreground font-normal">{trend.label}</span>}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center border border-dashed border-border/80 rounded-2xl bg-card/50",
        className
      )}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-muted/80 flex items-center justify-center text-muted-foreground mb-4">
        <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
      </div>
      <h3 className="font-bold text-base sm:text-lg text-foreground mb-1">{title}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-5">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm" className="font-semibold text-xs shadow-xs">
          {actionText}
        </Button>
      )}
    </div>
  );
}

export function DashboardHeader({
  title,
  description,
  children,
  badge,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">{title}</h1>
          {badge && (
            <Badge variant="outline" className="text-xs font-semibold px-2 py-0.5">
              {badge}
            </Badge>
          )}
        </div>
        {description && <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2.5 flex-wrap">{children}</div>}
    </div>
  );
}

export function CanonicalStatusBadge({ status }: { status?: string }) {
  if (!status) return null;
  const label = status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  const badgeClass = getStatusBadgeClass(status);
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border",
        badgeClass
      )}
    >
      {label}
    </span>
  );
}
