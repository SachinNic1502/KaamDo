import Image from "next/image";
import { ShieldCheck } from "lucide-react";

interface WorkspaceLoadingProps {
  portalTitle: string;
}

export function WorkspaceLoading({ portalTitle }: WorkspaceLoadingProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background selection:bg-primary/20 selection:text-primary">
      <div className="flex flex-col items-center gap-5 text-center max-w-sm px-6">
        {/* Animated Brand Logo Container */}
        <div className="relative">
          {/* Subtle Outer Glow */}
          <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/30 via-blue-500/20 to-primary/30 blur-lg opacity-70 animate-pulse" />

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

        {/* Brand Name & Loading Status */}
        <div className="space-y-1.5">
          <div className="font-extrabold text-lg tracking-tight text-foreground">
            Kaam<span className="text-primary">Do</span> Workspace
          </div>
          <h3 className="font-bold text-sm text-foreground">Preparing Workspace</h3>
          <p className="text-xs text-muted-foreground">
            Verifying permissions for <strong className="text-foreground">{portalTitle}</strong>…
          </p>
        </div>

        {/* Smooth Loading Progress Bar */}
        <div className="w-52 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="w-1/2 h-full bg-primary rounded-full animate-pulse" />
        </div>

        {/* Security & Audit Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground pt-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Biometric Aadhaar KYC & Escrow Secured</span>
        </div>
      </div>
    </div>
  );
}
