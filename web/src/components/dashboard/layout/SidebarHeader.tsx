import NextLink from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { roleDashboardMap } from "./types";

interface SidebarHeaderProps {
  role?: string;
  portalTitle: string;
  badgeLabel?: string;
  isCollapsed: boolean;
  mobile?: boolean;
  onToggleCollapse: () => void;
  onCloseMobile?: () => void;
}

export function SidebarHeader({
  role = "customer",
  portalTitle,
  badgeLabel,
  isCollapsed,
  mobile = false,
  onToggleCollapse,
  onCloseMobile,
}: SidebarHeaderProps) {
  const homeTarget = roleDashboardMap[role] || "/";

  return (
    <>
      <div className="flex items-center justify-between h-16 px-4 border-b border-border/80 bg-background/50">
        <NextLink
          href={homeTarget}
          onClick={() => mobile && onCloseMobile?.()}
          className={cn(
            "flex items-center gap-3 overflow-hidden",
            isCollapsed && !mobile && "justify-center w-full"
          )}
        >
          <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
            <Image
              src="/logo/icon.png"
              alt="KaamDo Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
              priority
            />
          </div>
          {(!isCollapsed || mobile) && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-foreground">
                  Kaam<span className="text-primary">Do</span>
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-4 font-semibold text-primary border-primary/30"
                >
                  {badgeLabel || role}
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground truncate">{portalTitle}</span>
            </div>
          )}
        </NextLink>

        {!isCollapsed && !mobile && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onToggleCollapse}
            aria-label="Collapse Sidebar"
            title="Collapse Sidebar"
            className="text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <PanelLeftClose className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Collapsed Top Expand Button */}
      {isCollapsed && !mobile && (
        <div className="p-2 border-b border-border/80 flex justify-center">
          <Tooltip>
            <TooltipTrigger render={
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={onToggleCollapse}
                aria-label="Expand Sidebar"
                className="w-full h-8 text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            } />
            <TooltipContent side="right">Expand Sidebar</TooltipContent>
          </Tooltip>
        </div>
      )}
    </>
  );
}
