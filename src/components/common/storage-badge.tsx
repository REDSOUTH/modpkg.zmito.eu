import * as React from "react";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomStorageType = "local_browser" | "account_cloud";

export interface StorageBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  storageType: CustomStorageType | string;
  showLabel?: boolean;
}

export function StorageBadge({ storageType, showLabel = true, className, ...props }: StorageBadgeProps) {
  const isCloud = storageType === "account_cloud" || storageType === "cloud";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E1E1E] text-white/90 border-0 whitespace-nowrap transition-colors",
        className
      )}
      title={isCloud ? "Synced with REDSOUTH Account" : "Saved in Local Browser Storage"}
      {...props}
    >
      {isCloud ? (
        <img src="/redsouth/logo-colored.svg" alt="REDSOUTH Account" className="w-3.5 h-3.5 object-contain shrink-0" />
      ) : (
        <HardDrive className="w-3.5 h-3.5 shrink-0 text-blue-400" />
      )}
      {showLabel && (
        <span className="whitespace-nowrap">{isCloud ? "REDSOUTH Account" : "Local Browser"}</span>
      )}
    </div>
  );
}
