import * as React from "react";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterBadgeItem {
  id: string; // e.g. "all", "mods", "textures", "shaders", "datapacks", "worlds", "overrides" or "mod", "resourcepack", etc.
  type?: string;
  label: string;
  count?: number;
}

export interface ContentTypeFilterBadgesProps {
  label?: string;
  showLabel?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  items?: FilterBadgeItem[];
  activeColorClass?: string;
  className?: string;
}

export const DEFAULT_FILTER_BADGE_ITEMS: FilterBadgeItem[] = [
  { id: "all", label: "All", type: "all" },
  { id: "mods", label: "Mods", type: "mod" },
  { id: "textures", label: "Resourcepacks", type: "resourcepack" },
  { id: "shaders", label: "Shaders", type: "shader" },
  { id: "datapacks", label: "Datapacks", type: "datapack" },
  { id: "worlds", label: "Worlds", type: "world" },
  { id: "overrides", label: "Overrides", type: "override" },
];

export function ContentTypeFilterBadges({
  label = "CONTENT TYPE",
  showLabel = true,
  value,
  onValueChange,
  items = DEFAULT_FILTER_BADGE_ITEMS,
  activeColorClass = "bg-blue-500 text-white shadow-md shadow-blue-500/20",
  className,
}: ContentTypeFilterBadgesProps) {
  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      {showLabel && label && (
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}

      <div className="flex items-center gap-1.5 flex-wrap">
        {items.map((item) => {
          const isActive = value === item.id || value === item.type;
          const isAll = item.id === "all" || item.type === "all";
          const isBlackActive = isActive && activeColorClass.includes("text-black");
          const iconActiveColor = isBlackActive ? "text-black" : "text-white";

          return (
            <button
              key={item.id}
              onClick={() => onValueChange(item.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                isActive
                  ? activeColorClass
                  : "bg-[#1E1E1E] text-white/70 hover:bg-[#252525] hover:text-white"
              )}
            >
              {isAll ? (
                <Layers className={cn("w-3.5 h-3.5 shrink-0", isActive ? iconActiveColor : "text-white/70")} />
              ) : (
                <ContentTypeIcon
                  type={item.type || item.id}
                  iconClassName={cn("w-3.5 h-3.5", isActive && iconActiveColor)}
                />
              )}
              <span>
                {item.label}
                {item.count !== undefined && ` (${item.count})`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
