import { Layers, HardDrive } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { IconTabSelector, IconTabOption } from "@/components/common/icon-tab-selector";
import { ContentTypeFilterBadges, FilterBadgeItem } from "@/components/common/content-type-filter-badges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CustomContentItem } from "@/types";

export interface CustomContentCounts {
  all: number;
  mods: number;
  textures: number;
  shaders: number;
  datapacks: number;
  worlds: number;
}

export interface CustomContentSidebarProps {
  items: CustomContentItem[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedStorage: string;
  setSelectedStorage: (storage: string) => void;
  selectedType: string;
  setSelectedType: (type: string) => void;
  selectedLoader: string;
  setSelectedLoader: (loader: string) => void;
  selectedMcVersion: string;
  setSelectedMcVersion: (version: string) => void;
  counts?: CustomContentCounts;
  stickyTop?: number;
}

export function CustomContentSidebar({
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
  counts = { all: 0, mods: 0, textures: 0, shaders: 0, datapacks: 0, worlds: 0 },
  stickyTop = 121,
}: CustomContentSidebarProps) {

  const storageOptions: IconTabOption[] = [
    { id: "all", label: "All Storage", icon: <Layers className="w-4 h-4 text-foreground" /> },
    { id: "local", label: "Local Browser", icon: <HardDrive className="w-4 h-4 text-blue-400" />, activeColorClass: "text-blue-400" },
    { id: "cloud", label: "REDSOUTH Account", icon: <img src="/redsouth/logo-colored.svg" alt="REDSOUTH Account" className="w-4 h-4 object-contain" />, activeColorClass: "text-[#FE5000]" },
  ];

  // Only include content types that actually exist in items (or 'all')
  const contentTypeFilterItems: FilterBadgeItem[] = [
    { id: "all", type: "all", label: "All", count: counts.all },
    { id: "mods", type: "mod", label: "Mods", count: counts.mods },
    { id: "textures", type: "resourcepack", label: "Resourcepacks", count: counts.textures },
    { id: "shaders", type: "shader", label: "Shaders", count: counts.shaders },
    { id: "datapacks", type: "datapack", label: "Datapacks", count: counts.datapacks },
    { id: "worlds", type: "world", label: "Worlds", count: counts.worlds },
  ].filter((item) => item.type === "all" || (item.count && item.count > 0));

  // Calculate available loaders and their counts from items
  const loaderCountsMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.loader && item.loader !== "Any") {
      const parts = item.loader.split(",").map((s) => s.trim());
      parts.forEach((p) => {
        if (p) {
          const k = p.toLowerCase();
          loaderCountsMap[k] = (loaderCountsMap[k] || 0) + 1;
        }
      });
    }
  });

  const availableLoaders = Object.keys(loaderCountsMap).map((k) => ({
    id: k,
    label: k.charAt(0).toUpperCase() + k.slice(1),
    count: loaderCountsMap[k],
  }));

  // Calculate available Minecraft versions and their counts from items
  const mcVersionCountsMap: Record<string, number> = {};
  items.forEach((item) => {
    if (item.mcVersion && item.mcVersion !== "Any") {
      const parts = item.mcVersion.split(",").map((s) => s.trim());
      parts.forEach((p) => {
        if (p) {
          mcVersionCountsMap[p] = (mcVersionCountsMap[p] || 0) + 1;
        }
      });
    }
  });

  const availableMcVersions = Object.keys(mcVersionCountsMap).map((k) => ({
    id: k,
    label: k,
    count: mcVersionCountsMap[k],
  }));

  return (
    <aside
      className="w-80 shrink-0 border-r border-border bg-card flex flex-col z-30 overflow-hidden sticky"
      style={{ top: stickyTop, height: `calc(100vh - ${stickyTop}px)` }}
    >
      
      {/* Storage Source Selector */}
      <div className="p-5 pb-4 shrink-0">
        <IconTabSelector
          label="STORAGE SOURCE"
          value={selectedStorage}
          onValueChange={setSelectedStorage}
          options={storageOptions}
        />
      </div>

      <div className="px-5 shrink-0">
        <Separator className="bg-border w-full" />
      </div>

      {/* Scrollable Area */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="flex flex-col gap-6 p-5">
          {/* Search Input */}
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search resources..."
            label="SEARCH"
          />

          {/* Content Type Filter Badges (Filtered to show only types with count > 0) */}
          <ContentTypeFilterBadges
            label="CONTENT TYPE"
            value={selectedType}
            onValueChange={setSelectedType}
            items={contentTypeFilterItems}
          />

          {/* Loader Filter Badges (Only available ones with count > 0) */}
          {availableLoaders.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                LOADER
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedLoader("all")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                    selectedLoader === "all"
                      ? "bg-[#FE5000] text-white shadow-md shadow-[#FE5000]/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  All ({counts.all})
                </button>
                {availableLoaders.map((ldr) => {
                  const isActive = selectedLoader === ldr.id;
                  return (
                    <button
                      key={ldr.id}
                      onClick={() => setSelectedLoader(ldr.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#FE5000] text-white shadow-md shadow-[#FE5000]/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {ldr.label} ({ldr.count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Minecraft Version Filter Badges (Only available ones with count > 0) */}
          {availableMcVersions.length > 0 && (
            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider pl-1">
                MINECRAFT VERSION
              </h3>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  onClick={() => setSelectedMcVersion("all")}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                    selectedMcVersion === "all"
                      ? "bg-[#FE5000] text-white shadow-md shadow-[#FE5000]/20"
                      : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  }`}
                >
                  All ({counts.all})
                </button>
                {availableMcVersions.map((ver) => {
                  const isActive = selectedMcVersion === ver.id;
                  return (
                    <button
                      key={ver.id}
                      onClick={() => setSelectedMcVersion(ver.id)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                        isActive
                          ? "bg-[#FE5000] text-white shadow-md shadow-[#FE5000]/20"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {ver.label} ({ver.count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </ScrollArea>
    </aside>
  );
}
