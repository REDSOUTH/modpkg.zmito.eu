import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { Layers } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ContentTypeTabsProps {
  value: string;
  onValueChange: (value: string) => void;
  showAllOption?: boolean;
  className?: string;
}

export const CONTENT_TYPE_TAB_ITEMS = [
  { id: "all", label: "All", icon: null },
  { id: "mods", label: "Mods", type: "mod" },
  { id: "textures", label: "Resourcepacks", type: "resourcepack" },
  { id: "shaders", label: "Shaders", type: "shader" },
  { id: "datapacks", label: "Datapacks", type: "datapack" },
  { id: "worlds", label: "Worlds", type: "world" },
  { id: "overrides", label: "Overrides", type: "override" },
];

export function ContentTypeTabs({ value, onValueChange, showAllOption = true, className }: ContentTypeTabsProps) {
  const items = showAllOption 
    ? CONTENT_TYPE_TAB_ITEMS 
    : CONTENT_TYPE_TAB_ITEMS.filter(i => i.id !== "all");

  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn("w-full", className)}>
      <TabsList className="bg-[#1E1E1E] border-0 rounded-xl p-1 gap-1 flex flex-wrap w-full h-auto min-h-11">
        {items.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg text-white/60 data-[state=active]:bg-black data-[state=active]:text-white transition-all flex items-center justify-center gap-1.5 min-w-[80px]"
          >
            {tab.id === "all" ? (
              <Layers className="w-3.5 h-3.5 text-white/60 shrink-0" />
            ) : (
              <ContentTypeIcon type={tab.type!} />
            )}
            <span>{tab.label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
