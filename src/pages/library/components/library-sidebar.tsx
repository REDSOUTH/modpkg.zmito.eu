import { Layers, Globe, Plus, Package } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { PackSettings } from "@/types";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export interface LibrarySidebarProps {
  packages: PackSettings[];
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedStorage: string;
  setSelectedStorage: (v: string) => void;
  selectedLoader: string;
  setSelectedLoader: (v: string) => void;
  selectedMcVersion: string;
  setSelectedMcVersion: (v: string) => void;
  onCreatePack: () => void;
}

export function LibrarySidebar({
  packages,
  searchQuery,
  setSearchQuery,
  selectedStorage,
  setSelectedStorage,
  selectedLoader,
  setSelectedLoader,
  selectedMcVersion,
  setSelectedMcVersion,
  onCreatePack,
}: LibrarySidebarProps) {
  const { t } = useTranslation();
  // Compute loader counts from existing packages
  const loaderCountsMap: Record<string, number> = {};
  packages.forEach((pkg) => {
    if (pkg.loader) {
      const k = pkg.loader.toLowerCase().trim();
      loaderCountsMap[k] = (loaderCountsMap[k] || 0) + 1;
    }
  });

  const availableLoaders = Object.entries(loaderCountsMap).map(([k, count]) => ({
    id: k,
    label: k.charAt(0).toUpperCase() + k.slice(1),
    count,
  }));

  // Compute Minecraft version counts from existing packages
  const mcVersionCountsMap: Record<string, number> = {};
  packages.forEach((pkg) => {
    if (pkg.mcVersion) {
      const v = pkg.mcVersion.trim();
      mcVersionCountsMap[v] = (mcVersionCountsMap[v] || 0) + 1;
    }
  });

  const availableMcVersions = Object.entries(mcVersionCountsMap).map(([k, count]) => ({
    id: k,
    label: k,
    count,
  }));

  return (
    <aside
      className="w-80 shrink-0 border-r border-border bg-background flex flex-col z-30 overflow-hidden sticky transition-colors duration-200"
      style={{ top: 65, height: "calc(100vh - 65px)" }}
    >
      {/* Top section: Action Button to create new MODPKG */}
      <div className="p-5 pb-4 flex flex-col gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-[#FE5000]" />
          <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {t("library.manager")}
          </span>
        </div>

        <button
          onClick={onCreatePack}
          className="w-full bg-[#FE5000] hover:bg-[#e04700] text-white text-xs font-semibold px-4 py-2.5 rounded-xl active:scale-95 transition-all duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-[#FE5000]/15 cursor-pointer"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>{t("library.createNew")}</span>
        </button>
      </div>

      <div className="px-5 shrink-0">
        <Separator className="bg-border w-full" />
      </div>

      {/* Scrollable Filters */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-5">
          {/* 1. SEARCH */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={t("library.searchPlaceholder")}
            label={t("library.search")}
          />

          {/* 2. STORAGE SOURCE BADGES - exact pattern from my-resources */}
          <div className="flex flex-col gap-2.5 w-full">
            <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
              {t("library.storageSource")}
            </h3>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: "all", label: t("library.storage.all") },
                { id: "local", label: t("library.storage.local") },
                { id: "cloud", label: t("library.storage.cloud") },
              ].map((badge) => {
                const isActive = selectedStorage === badge.id;
                const iconColor = isActive ? "text-white" : "text-muted-foreground";

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
                        ? "bg-[#FE5000] text-white"
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

          {/* 3. LOADER BADGES - exact pattern from my-resources */}
          {availableLoaders.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                {t("library.loader")}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedLoader("all")}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                    selectedLoader === "all"
                      ? "bg-[#FE5000] text-white"
                      : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                  )}
                >
                  <Layers className={cn("w-3.5 h-3.5 shrink-0", selectedLoader === "all" ? "text-white" : "text-muted-foreground")} />
                  <span>{t("library.all")} ({packages.length})</span>
                </button>
                {availableLoaders.map((ldr) => (
                  <button
                    key={ldr.id}
                    onClick={() => setSelectedLoader(ldr.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                      selectedLoader === ldr.id
                        ? "bg-[#FE5000] text-white"
                        : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                    }`}
                  >
                    {ldr.label} ({ldr.count})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 4. MINECRAFT VERSION BADGES - exact pattern from my-resources */}
          {availableMcVersions.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
                {t("library.mcVersion")}
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedMcVersion("all")}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer select-none",
                    selectedMcVersion === "all"
                      ? "bg-[#FE5000] text-white"
                      : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                  )}
                >
                  <Layers className={cn("w-3.5 h-3.5 shrink-0", selectedMcVersion === "all" ? "text-white" : "text-muted-foreground")} />
                  <span>{t("library.all")} ({packages.length})</span>
                </button>
                {availableMcVersions.map((ver) => (
                  <button
                    key={ver.id}
                    onClick={() => setSelectedMcVersion(ver.id)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                      selectedMcVersion === ver.id
                        ? "bg-[#FE5000] text-white"
                        : "bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:bg-muted/80 dark:hover:bg-[#252525] hover:text-foreground"
                    }`}
                  >
                    {ver.label} ({ver.count})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
