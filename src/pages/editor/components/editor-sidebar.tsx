import { Search, Compass, FileUp, Globe, PlusCircle, Plus, Monitor, Server, Check } from "lucide-react";
import { SearchInput } from "@/components/common/search-input";
import { IconTabSelector, IconTabOption } from "@/components/common/icon-tab-selector";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { useState, useEffect } from "react";
import { fetchCategories, UnifiedCategory } from "@/lib/api/categories";
import { CATEGORY_ICONS } from "@/lib/api/category-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AddCustomContentDialog } from "@/components/views/add-custom-content-dialog";
import { AddConfigFileDialog } from "@/components/views/add-config-file-dialog";
import { PackageFileTree } from "./package-file-tree";
import { usePack } from "@/context/pack-context";

interface EnvironmentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

export interface EditorSidebarProps {
  activeView: "browse" | "overrides";
  setActiveView: (view: "browse" | "overrides") => void;
  selectedFileId: string | null;
  onSelectFile: (id: string | null) => void;
  contentType: string;
  setContentType: (type: string) => void;
  provider: string;
  setProvider: (provider: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategories: string[];
  setSelectedCategories: (cats: string[]) => void;
  selectedEnvironments: string[];
  setSelectedEnvironments: (envs: string[]) => void;
}

export default function EditorSidebar({ 
  activeView,
  setActiveView,
  selectedFileId,
  onSelectFile,
  contentType, 
  setContentType,
  provider, 
  setProvider,
  searchQuery, 
  setSearchQuery,
  selectedCategories, 
  setSelectedCategories,
  selectedEnvironments, 
  setSelectedEnvironments
}: EditorSidebarProps) {
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isAddCustomDialogOpen, setIsAddCustomDialogOpen] = useState<boolean>(false);
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState<boolean>(false);
  const [initialAddPath, setInitialAddPath] = useState<string | undefined>(undefined);

  useEffect(() => {
    let mounted = true;
    if (activeView === "browse") {
      setIsLoadingCategories(true);
      fetchCategories(contentType, provider).then(data => {
        if (mounted) {
          setCategories(data);
          setIsLoadingCategories(false);
        }
      });
    }
    return () => { mounted = false; };
  }, [contentType, provider, activeView]);

  const toggleCategory = (catName: string) => {
    const next = selectedCategories.includes(catName)
      ? selectedCategories.filter((c: string) => c !== catName)
      : [...selectedCategories, catName];
    setSelectedCategories(next);
  };

  const toggleEnvironment = (envId: string) => {
    const next = selectedEnvironments.includes(envId)
      ? selectedEnvironments.filter((e: string) => e !== envId)
      : [...selectedEnvironments, envId];
    setSelectedEnvironments(next);
  };

  const environments: EnvironmentItem[] = [
    { id: "client", name: "Client", icon: Monitor, color: "text-blue-400" },
    { id: "server", name: "Server", icon: Server, color: "text-emerald-400" },
  ];

  const viewOptions: IconTabOption[] = [
    { id: "browse", label: "Browse & Add Content", icon: <Compass className="w-4 h-4 text-[#FE5000]" />, activeColorClass: "text-[#FE5000]" },
    { id: "overrides", label: "Overrides & Custom Files", icon: <FileUp className="w-4 h-4 text-amber-400" />, activeColorClass: "text-amber-400" },
  ];

  const providerOptions: IconTabOption[] = [
    { id: "all", label: "All Sources", icon: <Globe className="w-4 h-4 text-white" /> },
    { id: "modrinth", label: "Modrinth", icon: <img src="/social/modrinth.svg" alt="Modrinth" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />, activeColorClass: "text-[#45D66F]" },
    { id: "curseforge", label: "CurseForge", icon: <img src="/social/curseforge.svg" alt="CurseForge" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />, activeColorClass: "text-[#F16436]" },
    { id: "custom", label: "Custom", icon: <PlusCircle className="w-4 h-4 text-blue-400" />, activeColorClass: "text-blue-400" },
  ];

  const contentTypeOptions: IconTabOption[] = [
    { id: "mods", label: "Mods", icon: <ContentTypeIcon type="mod" iconClassName="w-4 h-4" />, activeColorClass: "text-[#FE5000]" },
    { id: "textures", label: "Resourcepacks", icon: <ContentTypeIcon type="resourcepack" iconClassName="w-4 h-4" />, activeColorClass: "text-blue-400" },
    { id: "shaders", label: "Shaders", icon: <ContentTypeIcon type="shader" iconClassName="w-4 h-4" />, activeColorClass: "text-purple-400" },
    { id: "datapacks", label: "Datapacks", icon: <ContentTypeIcon type="datapack" iconClassName="w-4 h-4" />, activeColorClass: "text-emerald-400" },
    ...(provider !== "modrinth" ? [{ id: "worlds", label: "Worlds", icon: <ContentTypeIcon type="world" iconClassName="w-4 h-4" />, activeColorClass: "text-cyan-400" }] : []),
  ];

  return (
    <aside className="w-80 border-r border-[#1E1E1E] bg-black flex flex-col flex-shrink-0 z-30 sticky top-[121px] h-[calc(100vh-121px)] overflow-hidden">
      
      <TooltipProvider delayDuration={200}>
        {/* VIEW Mode Switcher */}
        <div className="p-5 pb-4 shrink-0">
          <IconTabSelector 
            label="VIEW" 
            value={activeView} 
            onValueChange={(val) => setActiveView(val as "browse" | "overrides")} 
            options={viewOptions} 
          />
        </div>

        <div className="px-5 shrink-0">
          <Separator className="bg-[#1E1E1E] w-full" />
        </div>

        {activeView === "browse" ? (
          <>
            {/* Source Provider */}
            <div className="p-5 pb-4 shrink-0">
              <IconTabSelector
                label="SOURCE PROVIDER"
                value={provider}
                onValueChange={(val) => {
                  setProvider(val);
                  setSelectedCategories([]);
                  if (val === "modrinth" && contentType === "worlds") {
                    setContentType("mods");
                  }
                }}
                options={providerOptions}
              />
            </div>

            {/* Content Type */}
            <div className="px-5 pb-4 shrink-0">
              <IconTabSelector
                label="CONTENT TYPE"
                value={contentType}
                onValueChange={setContentType}
                options={contentTypeOptions}
              />
            </div>

            {/* Separator under Source & Content Type */}
            <div className="px-5 shrink-0">
              <Separator className="bg-[#1E1E1E] w-full" />
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden [&>div>div]:!block [&>div]:!block">
              <div className="flex flex-col gap-6 p-5">
                
                {/* Search */}
                <div className="flex flex-col gap-2">
                  <SearchInput
                    value={searchQuery}
                    onChange={setSearchQuery}
                    placeholder={`Search ${contentType}...`}
                    label="SEARCH"
                  />

                  {/* Add Custom Resource Button (shown when Provider is Custom) */}
                  {provider === "custom" && (
                    <div className="flex flex-col gap-2 mt-1">
                      <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">
                        CUSTOM RESOURCE
                      </h3>
                      <Button
                        onClick={() => setIsAddCustomDialogOpen(true)}
                        className="w-full bg-blue-500 hover:bg-blue-500 text-white rounded-xl h-10 px-4 text-xs font-semibold gap-2 border-0 outline outline-2 outline-transparent hover:outline-blue-500/50 hover:outline-offset-2 active:scale-[0.98] transition-all cursor-pointer shadow-lg shadow-blue-500/20"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Custom Content</span>
                      </Button>
                    </div>
                  )}
                </div>

                {provider !== "custom" && (
                  <>
                    {/* Categories List */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between pl-1 pr-1">
                        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Categories</h3>
                        {selectedCategories.length > 0 && (
                          <button 
                            onClick={() => setSelectedCategories([])}
                            className="text-[10px] text-[#FE5000] hover:underline font-medium"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {isLoadingCategories ? (
                          Array.from({ length: 11 }).map((_, i) => (
                            <div key={i} className="h-9 bg-[#1E1E1E]/50 animate-pulse rounded-xl" />
                          ))
                        ) : (
                          categories.map((cat) => {
                            const isSelected = selectedCategories.includes(cat.id);
                            const iconData = CATEGORY_ICONS[cat.id.toLowerCase()] || CATEGORY_ICONS[cat.id] || CATEGORY_ICONS["default"];
                            const IconComponent = iconData.icon;

                            return (
                              <Button
                                key={cat.id}
                                variant="ghost"
                                onClick={() => toggleCategory(cat.id)}
                                className={`group justify-between px-3 h-9 rounded-xl text-sm font-medium transition-all ${
                                  isSelected 
                                    ? "bg-[#1E1E1E] text-white" 
                                    : "text-white/50 hover:bg-[#1E1E1E]/50 hover:text-white"
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <IconComponent 
                                    className={`w-4 h-4 transition-all duration-300 group-hover:scale-110 shrink-0 ${iconData.color || "text-white/60"} ${
                                      isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                                    }`} 
                                  />
                                  <span>{cat.name}</span>
                                </div>
                                {isSelected && <Check className="w-4 h-4 text-[#FE5000]" />}
                              </Button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <Separator className="bg-[#1E1E1E]" />

                    {/* Environment Filter */}
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between pl-1 pr-1">
                        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest">Environment</h3>
                        {selectedEnvironments.length > 0 && (
                          <button 
                            onClick={() => setSelectedEnvironments([])}
                            className="text-[10px] text-[#FE5000] hover:underline font-medium"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        {environments.map((env) => {
                          const isSelected = selectedEnvironments.includes(env.id);
                          const IconComponent = env.icon;

                          return (
                            <Button
                              key={env.id}
                              variant="ghost"
                              onClick={() => toggleEnvironment(env.id)}
                              className={`group justify-between px-3 h-9 rounded-xl text-sm font-medium transition-all ${
                                isSelected 
                                  ? "bg-[#1E1E1E] text-white" 
                                  : "text-white/50 hover:bg-[#1E1E1E]/50 hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <IconComponent 
                                  className={`w-4 h-4 transition-all duration-300 ${env.color} ${
                                    isSelected ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
                                  }`} 
                                />
                                <span>{env.name}</span>
                              </div>
                              {isSelected && <Check className="w-4 h-4 text-[#FE5000]" />}
                            </Button>
                          );
                        })}
                      </div>
                    </div>
                  </>
                )}

              </div>
            </ScrollArea>
          </>
        ) : (
          /* ========================================================= */
          /* OVERRIDES & CUSTOM FILES VIEW SIDEBAR: FOLDER TREE        */
          /* ========================================================= */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
            <ScrollArea className="flex-1 min-h-0 w-full overflow-hidden [&>div>div]:!block [&>div]:!block">
              <div className="p-4 flex flex-col gap-4 w-full min-w-0 overflow-hidden">
                <PackageFileTree
                  selectedFileId={selectedFileId}
                  onSelectFile={onSelectFile}
                  onOpenAddDialog={(initialPath) => {
                    setInitialAddPath(initialPath);
                    setIsAddFileDialogOpen(true);
                  }}
                />
              </div>
            </ScrollArea>
          </div>
        )}
      </TooltipProvider>

      {/* Add Custom Content Dialog (Browse Mode) */}
      <AddCustomContentDialog
        isOpen={isAddCustomDialogOpen}
        onClose={() => setIsAddCustomDialogOpen(false)}
        context="editor"
        defaultAddToPackage={true}
        defaultSaveAsCommon={true}
      />

      {/* Add Custom File Dialog (Overrides Mode) */}
      <AddConfigFileDialog
        isOpen={isAddFileDialogOpen}
        onClose={() => {
          setIsAddFileDialogOpen(false);
          setInitialAddPath(undefined);
        }}
        initialTargetPath={initialAddPath}
        context="editor"
        defaultAddToPackage={true}
        defaultSaveAsCommon={true}
        onAdded={(item) => {
          onSelectFile(item.id);
          setIsAddFileDialogOpen(false);
          setInitialAddPath(undefined);
        }}
      />
    </aside>
  );
}
