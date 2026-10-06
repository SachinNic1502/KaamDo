import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { RoleNavSection } from "@/lib/role-navigation";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface SidebarNavProps {
  navSections: RoleNavSection[];
  searchQuery: string;
  isCollapsed: boolean;
  mobile?: boolean;
  openSubmenus: Record<string, boolean>;
  onToggleSubmenu: (title: string) => void;
  isItemActive: (href: string) => boolean;
  onNavigateMobile?: () => void;
}

export function SidebarNav({
  navSections,
  searchQuery,
  isCollapsed,
  mobile = false,
  openSubmenus,
  onToggleSubmenu,
  isItemActive,
  onNavigateMobile,
}: SidebarNavProps) {
  const router = useRouter();

  return (
    <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
      {navSections.map((section) => {
        const filteredItems = section.items.filter(
          (item) =>
            !searchQuery.trim() ||
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.children?.some((c) =>
              c.title.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

        if (filteredItems.length === 0) return null;

        return (
          <div key={section.section} className="space-y-1">
            {(!isCollapsed || mobile) && (
              <div className="px-3 pt-2.5 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
                {section.section}
              </div>
            )}
            {isCollapsed && !mobile && <div className="h-px bg-border my-2" />}

            {filteredItems.map((item) => {
              const isActive = isItemActive(item.href);
              const hasChildren = item.children && item.children.length > 0;
              const isOpen = openSubmenus[item.title] ?? false;

              // Collapsed View
              if (isCollapsed && !mobile) {
                if (hasChildren) {
                  return (
                    <DropdownMenu key={item.href}>
                      <DropdownMenuTrigger render={
                        <button
                          className={cn(
                            "flex items-center justify-center w-full h-9 rounded-lg transition-colors outline-none",
                            isActive
                              ? "bg-primary/10 text-primary font-bold shadow-2xs"
                              : "text-muted-foreground hover:bg-muted hover:text-foreground"
                          )}
                          title={item.title}
                        >
                          <item.icon className="h-4 w-4" />
                        </button>
                      } />
                      <DropdownMenuContent side="right" align="start" className="w-52">
                        <DropdownMenuLabel className="font-semibold text-xs text-foreground">
                          {item.title}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.children?.map((child) => (
                          <DropdownMenuItem
                            key={child.href}
                            onClick={() => router.push(child.href)}
                            className={cn(
                              "text-xs cursor-pointer flex items-center justify-between",
                              isItemActive(child.href) && "font-bold text-primary bg-primary/5"
                            )}
                          >
                            <span>{child.title}</span>
                            {child.badge && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5">
                                {child.badge}
                              </Badge>
                            )}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger render={
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center justify-center w-full h-9 rounded-lg transition-colors",
                          isActive
                            ? "bg-primary/10 text-primary font-bold shadow-2xs"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                      </Link>
                    } />
                    <TooltipContent side="right">
                      <span className="font-semibold text-xs">{item.title}</span>
                    </TooltipContent>
                  </Tooltip>
                );
              }

              // Expanded View with Submenu
              if (hasChildren) {
                return (
                  <div key={item.title} className="space-y-0.5">
                    <button
                      type="button"
                      onClick={() => onToggleSubmenu(item.title)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-colors group cursor-pointer",
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={cn(
                            "p-1 rounded-md transition-colors",
                            isActive
                              ? "text-primary"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </span>
                        <span className="truncate">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {item.badge && (
                          <Badge
                            variant={item.badgeVariant || "secondary"}
                            className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                          >
                            {item.badge}
                          </Badge>
                        )}
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200",
                            isOpen && "rotate-90"
                          )}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="ml-5 pl-2.5 border-l border-border/80 space-y-0.5 pt-0.5 pb-0.5">
                        {item.children?.map((child) => {
                          const isChildActive = isItemActive(child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => mobile && onNavigateMobile?.()}
                              className={cn(
                                "flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors",
                                isChildActive
                                  ? "bg-primary/10 text-primary font-bold"
                                  : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                              )}
                            >
                              <span className="truncate">{child.title}</span>
                              {child.badge && (
                                <Badge variant="outline" className="text-[10px] px-1 py-0 h-3.5">
                                  {child.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Single Nav Link
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => mobile && onNavigateMobile?.()}
                  className={cn(
                    "flex items-center justify-between px-2.5 py-2 text-xs font-medium rounded-lg transition-colors group",
                    isActive
                      ? "bg-primary/10 text-primary font-bold shadow-2xs"
                      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={cn(
                        "p-1 rounded-md transition-colors",
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-4 w-4" />
                    </span>
                    <span className="truncate">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant={item.badgeVariant || "secondary"}
                      className="text-[10px] px-1.5 py-0 h-4 font-semibold"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
