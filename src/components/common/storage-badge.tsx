import * as React from "react";
import { useTranslation } from "react-i18next";
import { HardDrive } from "lucide-react";
import { cn } from "@/lib/utils";

export type CustomStorageType = "local_browser" | "account_cloud";

export interface StorageBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  storageType: CustomStorageType | string;
  showLabel?: boolean;
}

export function StorageBadge({ storageType, showLabel = true, className, ...props }: StorageBadgeProps) {
  const { t } = useTranslation();
  const isCloud = storageType === "account_cloud" || storageType === "cloud";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground dark:bg-[#1E1E1E] dark:text-white/90 border-0 whitespace-nowrap transition-colors",
        className
      )}
      title={isCloud ? t("resourceOptions.syncAcrossDevices") : t("myResources.storage.local")}
      {...props}
    >
      {isCloud ? (
        <img src="/redsouth/logo-colored.svg" alt="REDSOUTH Account" className="w-3.5 h-3.5 object-contain shrink-0" />
      ) : (
        <HardDrive className="w-3.5 h-3.5 shrink-0 text-blue-400" />
      )}
      {showLabel && (
        <span className="whitespace-nowrap">
          {isCloud ? t("myResources.storage.cloud") : t("myResources.storage.local")}
        </span>
      )}
    </div>
  );
}
