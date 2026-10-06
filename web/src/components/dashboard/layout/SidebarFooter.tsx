import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowUpRight, ChevronDown, User, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { UserSession, roleDisplayNames } from "./types";

interface SidebarFooterProps {
  user: UserSession | null;
  isCollapsed: boolean;
  mobile?: boolean;
  onLogout: () => Promise<void>;
}

export function SidebarFooter({
  user,
  isCollapsed,
  mobile = false,
  onLogout,
}: SidebarFooterProps) {
  const router = useRouter();

  return (
    <div className="p-3 border-t border-border/80 bg-background/50 space-y-2">
      {!isCollapsed || mobile ? (
        <>
          <Link
            href="/services"
            target="_blank"
            className="flex items-center justify-between w-full px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/15 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Public Services</span>
            </div>
            <ArrowUpRight className="h-3.5 w-3.5 opacity-70" />
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-muted transition text-left outline-none group cursor-pointer" />
            }>
              <Avatar size="default" className="border border-border">
                <AvatarFallback className="bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || "KD"}
                </AvatarFallback>
                <AvatarBadge className="bg-emerald-500" />
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">{user?.name || "KaamDo User"}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.phone || user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56 mb-2">
              <DropdownMenuLabel>
                <p className="text-xs font-bold">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground">{roleDisplayNames[user?.role || "customer"]}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="text-xs cursor-pointer flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>My Profile & Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/services")}
                className="text-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Explore Services</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void onLogout()}
                className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5 text-destructive" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger render={
              <button className="outline-none cursor-pointer" title={user?.name}>
                <Avatar size="sm" className="border border-border">
                  <AvatarFallback className="bg-gradient-to-tr from-primary to-blue-600 text-primary-foreground font-bold text-[10px]">
                    {user?.name?.slice(0, 2).toUpperCase() || "KD"}
                  </AvatarFallback>
                  <AvatarBadge className="bg-emerald-500" />
                </Avatar>
              </button>
            } />
            <DropdownMenuContent align="end" side="right" className="w-52">
              <DropdownMenuLabel>
                <p className="text-xs font-bold text-foreground">{user?.name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.phone || user?.email}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="text-xs cursor-pointer flex items-center gap-2"
              >
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Profile Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/services")}
                className="text-xs cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Public Services</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => void onLogout()}
                className="text-xs text-destructive hover:bg-destructive/10 cursor-pointer flex items-center gap-2"
              >
                <LogOut className="h-3.5 w-3.5 text-destructive" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
