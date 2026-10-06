import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function AdminLoadingScreen() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background selection:bg-primary/20 selection:text-primary">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
        {/* Animated Brand Container */}
        <div className="relative">
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-600/30 via-indigo-600/20 to-blue-600/30 blur-lg opacity-70 animate-pulse" />
          <div className="relative w-16 h-16 rounded-2xl bg-card border border-border/80 p-2.5 shadow-xl flex items-center justify-center">
            <Image
              src="/logo/icon.png"
              alt="KaamDo Logo"
              width={48}
              height={48}
              className="w-11 h-11 object-contain"
              priority
            />
          </div>
        </div>

        {/* Text & Status */}
        <div className="space-y-1.5">
          <div className="font-extrabold text-lg tracking-tight text-foreground">
            Kaam<span className="text-primary">Do</span> Admin Console
          </div>
          <h3 className="font-bold text-sm text-foreground">Authorizing Access</h3>
          <p className="text-xs text-muted-foreground">
            Verifying administrative credentials & RBAC permissions…
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-52 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-primary rounded-full animate-pulse" />
        </div>

        {/* Security Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Role-Based Access Control • Audit Active</span>
        </div>
      </div>
    </div>
  );
}
