import { useState, useEffect } from "react";
import { AlertCircle, AlertTriangle, Info, CheckCircle2, Bell, ExternalLink } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import alertsData from "@/config/alerts.json";

export type AlertType = "info" | "warning" | "error" | "success";

export interface SystemAlert {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  url?: string;
  translations?: Record<string, { title: string; description: string }>;
}

const alertStyles: Record<AlertType, { text: string; icon: any }> = {
  info: { text: "text-blue-500", icon: Info },
  warning: { text: "text-amber-500", icon: AlertTriangle },
  error: { text: "text-red-500", icon: AlertCircle },
  success: { text: "text-green-500", icon: CheckCircle2 },
};

const SYSTEM_ALERTS = alertsData as SystemAlert[];

export function AlertsDropdown() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language?.split("-")[0] || "en";

  const [seenIds, setSeenIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("modpkg_seen_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [dismissedIds, setDismissedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("modpkg_dismissed_alerts");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("modpkg_seen_alerts", JSON.stringify(seenIds));
    } catch {
      // Ignore storage errors
    }
  }, [seenIds]);

  useEffect(() => {
    try {
      localStorage.setItem("modpkg_dismissed_alerts", JSON.stringify(dismissedIds));
    } catch {
      // Ignore storage errors
    }
  }, [dismissedIds]);

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // When opening dropdown, mark all current alerts as seen so the ping badge disappears
      const allAlertIds = SYSTEM_ALERTS.map((a) => a.id);
      setSeenIds((prev) => Array.from(new Set([...prev, ...allAlertIds])));
    }
  };

  const restoreAlert = (id: string) => {
    setDismissedIds((prev) => prev.filter((item) => item !== id));
  };

  // Has unseen alerts that are not dismissed
  const hasUnseenAlerts = SYSTEM_ALERTS.some(
    (alert) => !seenIds.includes(alert.id) && !dismissedIds.includes(alert.id)
  );

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-xl text-zinc-600 dark:text-zinc-300 hover:text-[#FE5000] dark:hover:text-[#FE5000] hover:bg-muted/50 cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {hasUnseenAlerts && (
            <span className="absolute top-2 right-2 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE5000]/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FE5000]"></span>
            </span>
          )}
          <span className="sr-only">{t("systemAlerts.toggle")}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[320px] max-h-[80vh] overflow-y-auto bg-card border border-border dark:border-[#333333] rounded-xl shadow-xl z-50 p-1"
      >
        <div className="flex items-center justify-between px-3 py-2">
          <span className="font-semibold text-sm text-foreground">{t("systemAlerts.title")}</span>
          <span className="text-xs text-muted-foreground">{t("systemAlerts.total", { count: SYSTEM_ALERTS.length })}</span>
        </div>
        <DropdownMenuSeparator />

        {SYSTEM_ALERTS.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            {t("systemAlerts.noAlerts")}
          </div>
        ) : (
          SYSTEM_ALERTS.map((alert) => {
            const isDismissed = dismissedIds.includes(alert.id);
            const style = alertStyles[alert.type] || alertStyles.info;
            const Icon = style.icon;

            const localized = alert.translations?.[currentLang] || {
              title: alert.title,
              description: alert.description,
            };

            const isClickable = Boolean(alert.url);

            return (
              <DropdownMenuItem
                key={alert.id}
                className={cn(
                  "flex flex-col items-start gap-1 p-3 rounded-lg focus:bg-muted transition-colors w-full group",
                  isClickable ? "cursor-pointer" : "cursor-default"
                )}
                onSelect={(e) => {
                  if (isClickable && alert.url) {
                    window.open(alert.url, "_blank", "noopener,noreferrer");
                  } else {
                    e.preventDefault();
                  }
                }}
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <Icon className={`w-4 h-4 ${style.text} ${isDismissed ? "opacity-50" : ""} shrink-0`} />
                    <span
                      className={cn(
                        "font-medium text-sm transition-colors truncate",
                        isDismissed ? "text-muted-foreground" : "text-foreground",
                        isClickable && "group-hover:text-[#FE5000]"
                      )}
                    >
                      {localized.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {isClickable && (
                      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#FE5000] transition-colors" />
                    )}
                    {isDismissed && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          restoreAlert(alert.id);
                        }}
                        className="text-[10px] uppercase tracking-wider font-semibold text-blue-500 hover:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-sm transition-colors cursor-pointer"
                      >
                        {t("systemAlerts.restore")}
                      </button>
                    )}
                  </div>
                </div>
                <p className={`text-xs mt-1 leading-relaxed ${isDismissed ? "text-muted-foreground/70" : "text-muted-foreground"}`}>
                  {localized.description}
                </p>
              </DropdownMenuItem>
            );
          })
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
