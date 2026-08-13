import * as React from "react";
import { PlusCircle, FileBraces, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardProviderType } from "@/pages/editor/components/mod-card";

export interface ProviderIconProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: CardProviderType | string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
}

export function ProviderIcon({ provider, size = "sm", className, ...props }: ProviderIconProps) {
  const p = (provider || "modrinth").toLowerCase();

  const sizeClasses = {
    sm: "w-3.5 h-3.5 min-w-[14px] min-h-[14px] max-w-[14px] max-h-[14px]",
    md: "w-4 h-4 min-w-[16px] min-h-[16px] max-w-[16px] max-h-[16px]",
    lg: "w-5 h-5 min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px]",
  };

  if (p === "modrinth") {
    return (
      <div className={cn("shrink-0 flex items-center justify-center select-none", className)} title="Modrinth" {...props}>
        <img
          src="/social/modrinth.svg"
          alt="Modrinth"
          className={cn("object-contain shrink-0 pointer-events-none", sizeClasses[size])}
          draggable={false}
        />
      </div>
    );
  }

  if (p === "curseforge") {
    return (
      <div className={cn("shrink-0 flex items-center justify-center select-none", className)} title="CurseForge" {...props}>
        <img
          src="/social/curseforge.svg"
          alt="CurseForge"
          className={cn("object-contain shrink-0 pointer-events-none", sizeClasses[size])}
          draggable={false}
        />
      </div>
    );
  }

  if (p === "custom") {
    return (
      <div className={cn("shrink-0 flex items-center justify-center", className)} title="Custom Source" {...props}>
        <PlusCircle className={cn("text-blue-400 shrink-0", sizeClasses[size])} />
      </div>
    );
  }

  if (p === "local_override" || p === "override") {
    return (
      <div className={cn("shrink-0 flex items-center justify-center", className)} title="Local Override" {...props}>
        <FileBraces className={cn("text-amber-400 shrink-0", sizeClasses[size])} />
      </div>
    );
  }

  return (
    <div className={cn("shrink-0 flex items-center justify-center", className)} title="Web Source" {...props}>
      <Globe className={cn("text-white/40 shrink-0", sizeClasses[size])} />
    </div>
  );
}

export interface ProviderBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  provider: CardProviderType | string;
}

export function ProviderBadge({ provider, className, ...props }: ProviderBadgeProps) {
  const p = (provider || "modrinth").toLowerCase();
  const labels: Record<string, string> = {
    modrinth: "Modrinth",
    curseforge: "CurseForge",
    custom: "Custom Link",
    local_override: "Local Override"
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E1E1E] text-white/80 border border-white/5",
        className
      )}
      {...props}
    >
      <ProviderIcon provider={p} size="sm" />
      <span>{labels[p] || p}</span>
    </div>
  );
}
