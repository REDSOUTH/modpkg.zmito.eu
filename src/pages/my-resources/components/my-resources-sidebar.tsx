import { Layers, HardDrive, Plus, PlusCircle, FileSliders } from "lucide-react";
import { IconTabSelector, IconTabOption } from "@/components/common/icon-tab-selector";
import { SearchInput } from "@/components/common/search-input";
import { ContentTypeFilterBadges, FilterBadgeItem } from "@/components/common/content-type-filter-badges";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { CustomContentItem } from "@/types";

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

const STORAGE_OPTIONS: { id: string; label: string; icon: React.ReactNode }[] = [
  { id: "all",   label: "All Storage",      icon: <Layers className="w-4 h-4 text-white" /> },
  { id: "local", label: "Local Browser",    icon: <HardDrive className="w-4 h-4 text-blue-400" /> },
  { id: "cloud", label: "REDSOUTH Account", icon: <img src="/redsouth/logo-colored.svg" alt="REDSOUTH" className="w-4 h-4 object-contain" /> },
];

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

  const TAB_OPTIONS: IconTabOption[] = [
    {
      id: "custom-content",
      label: "Custom Content",
      icon: <PlusCircle className="w-4 h-4 text-blue-400" />,
      activeColorClass: "text-blue-400",
    },
    {
      id: "custom-files",
      label: "Custom Files",
      icon: <FileSliders className="w-4 h-4 text-amber-400" />,
      activeColorClass: "text-amber-400",
    },
  ];

  // Derived filter data (same logic as CustomContentSidebar)
  const contentTypeFilterItems: FilterBadgeItem[] = [
    { id: "all",       type: "all",         label: "All",          count: counts.all },
    { id: "mods",      type: "mod",         label: "Mods",         count: counts.mods },
    { id: "textures",  type: "resourcepack",label: "Resourcepacks", count: counts.textures },
    { id: "shaders",   type: "shader",      label: "Shaders",      count: counts.shaders },
    { id: "datapacks", type: "datapack",    label: "Datapacks",    count: counts.datapacks },
    { id: "worlds",    type: "world",       label: "Worlds",       count: counts.worlds },
  ].filter((item) => item.type === "all" || (item.count && item.count > 0));

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

  const isCustomContent = activeTab === "custom-content";

  return (
    <aside
      className="w-80 shrink-0 border-r border-[#1E1E1E] bg-black flex flex-col z-30 overflow-hidden sticky"
      style={{ top: 65, height: "calc(100vh - 65px)" }}
    >
      {/* Top section — tabs + add button */}
      <div className="p-5 pb-4 flex flex-col gap-4 shrink-0">
        <IconTabSelector
          label="RESOURCE TYPE"
          value={activeTab}
          onValueChange={(v) => onTabChange(v as ActiveTab)}
          options={TAB_OPTIONS}
        />

        {/* Contextual add button */}
        {isCustomContent ? (
          <button
            onClick={onAddResource}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-blue-500/50 hover:outline-offset-2 active:scale-95 duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Add Custom Content</span>
          </button>
        ) : (
          <button
            onClick={onAddConfigFile}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-semibold px-4 py-2.5 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-amber-400/50 hover:outline-offset-2 active:scale-95 duration-200 flex items-center justify-center gap-1.5 shadow-md shadow-amber-400/10"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Add Custom File</span>
          </button>
        )}
      </div>

      <div className="px-5 shrink-0">
        <Separator className="bg-[#1E1E1E] w-full" />
      </div>

      {/* Contextual filter content */}
      {isCustomContent ? (
        <>
          {/* Storage Source Selector */}
          <div className="px-5 pt-5 pb-4 shrink-0">
            <IconTabSelector
              label="STORAGE SOURCE"
              value={selectedStorage}
              onValueChange={setSelectedStorage}
              options={STORAGE_OPTIONS}
            />
          </div>

          <div className="px-5 shrink-0">
            <Separator className="bg-[#1E1E1E] w-full" />
          </div>

          {/* Scrollable filters */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="flex flex-col gap-6 p-5">

              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search resources..."
                label="SEARCH"
              />

              <ContentTypeFilterBadges
                label="CONTENT TYPE"
                value={selectedType}
                onValueChange={setSelectedType}
                items={contentTypeFilterItems}
              />

              {availableLoaders.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider pl-1">LOADER</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedLoader("all")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                        selectedLoader === "all"
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-[#1E1E1E] text-white/70 hover:bg-[#252525] hover:text-white"
                      }`}
                    >
                      All ({counts.all})
                    </button>
                    {availableLoaders.map((ldr) => (
                      <button
                        key={ldr.id}
                        onClick={() => setSelectedLoader(ldr.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                          selectedLoader === ldr.id
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-[#1E1E1E] text-white/70 hover:bg-[#252525] hover:text-white"
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
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider pl-1">MINECRAFT VERSION</h3>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => setSelectedMcVersion("all")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                        selectedMcVersion === "all"
                          ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                          : "bg-[#1E1E1E] text-white/70 hover:bg-[#252525] hover:text-white"
                      }`}
                    >
                      All ({counts.all})
                    </button>
                    {availableMcVersions.map((ver) => (
                      <button
                        key={ver.id}
                        onClick={() => setSelectedMcVersion(ver.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl border-0 transition-all cursor-pointer ${
                          selectedMcVersion === ver.id
                            ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
                            : "bg-[#1E1E1E] text-white/70 hover:bg-[#252525] hover:text-white"
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
        </>
      ) : (
        /* Config Files — sidebar is minimal, just tab+button above */
        <div className="flex-1" />
      )}
    </aside>
  );
}
