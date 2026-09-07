import { Layers, Globe, HardDrive, Plus, PlusCircle, FileSliders } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IconTabSelector, IconTabOption } from "@/components/common/icon-tab-selector";
import { SearchInput } from "@/components/common/search-input";
import { ContentTypeFilterBadges, FilterBadgeItem } from "@/components/common/content-type-filter-badges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CustomContentItem } from "@/types";

import { cn } from "@/lib/utils";

type ActiveTab = "custom-content" | "custom-files";

interface CustomContentCounts {
  all: number;
  mods: number;
  textures: number;
  shaders: number;
  datapacks: number;
  worlds: number;
}

export interface MyResourcesSidebarProps {
  // Tab state
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;

  // Custom Content filter state
  items: CustomContentItem[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedStorage: string;
  setSelectedStorage: (v: string) => void;
  selectedType: string;
  setSelectedType: (v: string) => void;
  selectedLoader: string;
  setSelectedLoader: (v: string) => void;
  selectedMcVersion: string;
  setSelectedMcVersion: (v: string) => void;
  counts: CustomContentCounts;

  // Action callbacks
  onAddResource: () => void;
  onAddConfigFile: () => void;
}

export function MyResourcesSidebar({
  activeTab,
  onTabChange,
  items,
  searchQuery,
  setSearchQuery,
  selectedStorage,
  setSelectedStorage,
  selectedType,
  setSelectedType,
  selectedLoader,
  setSelectedLoader,
  selectedMcVersion,
  setSelectedMcVersion,
  counts,
  onAddResource,
  onAddConfigFile,
}: MyResourcesSidebarProps) {
  const { t } = useTranslation();

  const TAB_OPTIONS: IconTabOption[] = [
    {
      id: "custom-content",
      label: t("myResources.tabs.customContent"),
      icon: <PlusCircle className="w-4 h-4 text-blue-400" />,
      activeColorClass: "text-blue-400",
    },
    {
      id: "custom-files",
      label: t("myResources.tabs.customFiles"),
      icon: <FileSliders className="w-4 h-4 text-amber-400" />,
      activeColorClass: "text-amber-400",
    },
  ];

  const isCustomContent = activeTab === "custom-content";

  // Derived filter data for Custom Content
  const contentTypeFilterItems: FilterBadgeItem[] = [
    { id: "all",       type: "all",         label: t("myResources.types.all"),          count: counts.all },
    { id: "mods",      type: "mod",         label: t("myResources.types.mods"),         count: counts.mods },
    { id: "textures",  type: "resourcepack",label: t("myResources.types.textures"),     count: counts.textures },
    { id: "shaders",   type: "shader",      label: t("myResources.types.shaders"),      count: counts.shaders },
    { id: "datapacks", type: "datapack",    label: t("myResources.types.datapacks"),    count: counts.datapacks },
    { id: "worlds",    type: "world",       label: t("myResources.types.worlds"),       count: counts.worlds },
  ].filter((item) => item.type === "all" || (item.count && item.count > 0));

  // Derived filter data for Custom Files
  const fileTypeFilterItems: FilterBadgeItem[] = [
    { id: "all",        type: "all",        label: t("myResources.types.all") },
    { id: "config",     type: "config",     label: t("myResources.types.config") },
    { id: "script",     type: "script",     label: t("myResources.types.script") },
    { id: "data",       type: "data",       label: t("myResources.types.data") },
    { id: "multimedia", type: "multimedia", label: t("myResources.types.multimedia") },
    { id: "other",      type: "other",      label: t("myResources.types.other") },
  ];

  const loaderCountsMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.loader && item.loader !== "Any") {
      item.loader.split(",").map((s) => s.trim()).filter(Boolean).forEach((p) => {
        const k = p.toLowerCase();
        loaderCountsMap[k] = (loaderCountsMap[k] || 0) + 1;
      });
    }
  });
  const availableLoaders = Object.entries(loaderCountsMap).map(([k, count]) => ({
    id: k,
    label: k.charAt(0).toUpperCase() + k.slice(1),
    count,
  }));

  const mcVersionCountsMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.mcVersion && item.mcVersion !== "Any") {
      item.mcVersion.split(",").map((s) => s.trim()).filter(Boolean).forEach((p) => {
        mcVersionCountsMap[p] = (mcVersionCountsMap[p] || 0) + 1;
      });
    }
  });
  const availableMcVersions = Object.entries(mcVersionCountsMap).map(([k, count]) => ({
    id: k, label: k, count,
  }));

  return (
    <aside
      className="w-80 shrink-0 border-r border-border bg-background flex flex-col z-30 overflow-hidden sticky transition-colors duration-200"
      style={{ top: 65, height: "calc(100vh - 65px)" }}
    >
      {/* Top section — tabs + add button */}
      <div className="p-5 pb-4 flex flex-col gap-4 shrink-0">
        <IconTabSelector
          label={t("myResources.resourceType")}
          value={activeTab}
          onValueChange={(v) => onTabChange(v as ActiveTab)}
          options={TAB_OPTIONS}
        />

        {/* Contextual add button */}
        {isCustomContent ? (
          <button
            onClick={onAddResource}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{t("myResources.addResource")}</span>
          </button>
        ) : (
          <button
            onClick={onAddConfigFile}
            className="w-full bg-amber-400 hover:bg-amber-500 text-black text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/10 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{t("myResources.addConfigFile")}</span>
          </button>
        )}
      </div>

      <div className="px-5 shrink-0">
        <Separator className="bg-border w-full" />
      </div>

      {/* Scrollable filters — Search on top, followed by Storage Source Badges, Content/File Types, Loaders, and MC Versions */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-5">

          {/* 1. SEARCH */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={isCustomContent ? t("myResources.searchContentPlaceholder") : t("myResources.searchFilesPlaceholder")}
            label={t("myResources.search")}
          />

          {/* 2. STORAGE SOURCE BADGES */}
          <div className="flex flex-col gap-2.5 w-full">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
              {t("myResources.storageSource")}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: t("myResources.storage.all") },
                { id: "local", label: t("myResources.storage.local") },
                { id: "cloud", label: t("myResources.storage.cloud") },
              ].map((badge) => {
                const isActive = selectedStorage === badge.id;
                const isBlackActive = isActive && !isCustomContent;
                const iconColor = isActive
                  ? (isBlackActive ? "text-black" : "text-white")
                  : "text-muted-foreground";

                const renderBadgeIcon = () => {
                  if (badge.id === "all") {
                    return <Layers className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />;
                  }
                  if (badge.id === "local") {
                    return <Globe className={cn("w-3.5 h-3.5 shrink-0", iconColor)} />;
                  }
                  return <img src="/redsouth/logo-colored.svg" alt="REDSOUTH" className="w-3.5 h-3.5 object-contain shrink-0" />;
                };

                return (
                  <button
                    key={badge.id}
                    onClick={() => setSelectedStorage(badge.id)}
                    className={cn(
                      "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                      isActive
                        ? isCustomContent
                          ? "bg-blue-500 text-white"
                          : "bg-amber-400 text-black"
                        : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                    )}
                  >
                    {renderBadgeIcon()}
                    <span>{badge.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. CONTENT TYPE or FILE TYPE BADGES */}
          {isCustomContent ? (
            <>
              <ContentTypeFilterBadges
                label={t("myResources.contentType")}
                value={selectedType}
                onValueChange={setSelectedType}
                items={contentTypeFilterItems}
                activeColorClass="bg-blue-500 text-white"
              />

              {availableLoaders.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">{t("myResources.loader")}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedLoader("all")}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                        selectedLoader === "all"
                          ? "bg-blue-500 text-white"
                          : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                      )}
                    >
                      <Layers className={cn("w-3.5 h-3.5 shrink-0", selectedLoader === "all" ? "text-white" : "text-muted-foreground")} />
                      <span>{t("myResources.all")} ({counts.all})</span>
                    </button>
                    {availableLoaders.map((ldr) => (
                      <button
                        key={ldr.id}
                        onClick={() => setSelectedLoader(ldr.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                          selectedLoader === ldr.id
                            ? "bg-blue-500 text-white"
                            : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                        }`}
                      >
                        {ldr.label} ({ldr.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {availableMcVersions.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">{t("myResources.mcVersion")}</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedMcVersion("all")}
                      className={cn(
                        "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                        selectedMcVersion === "all"
                          ? "bg-blue-500 text-white"
                          : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                      )}
                    >
                      <Layers className={cn("w-3.5 h-3.5 shrink-0", selectedMcVersion === "all" ? "text-white" : "text-muted-foreground")} />
                      <span>{t("myResources.all")} ({counts.all})</span>
                    </button>
                    {availableMcVersions.map((ver) => (
                      <button
                        key={ver.id}
                        onClick={() => setSelectedMcVersion(ver.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                          selectedMcVersion === ver.id
                            ? "bg-blue-500 text-white"
                            : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                        }`}
                      >
                        {ver.label} ({ver.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <ContentTypeFilterBadges
              label={t("myResources.fileType")}
              value={selectedType}
              onValueChange={setSelectedType}
              items={fileTypeFilterItems}
              activeColorClass="bg-amber-400 text-black"
            />
          )}

        </div>
      </ScrollArea>
    </aside>
  );
}
