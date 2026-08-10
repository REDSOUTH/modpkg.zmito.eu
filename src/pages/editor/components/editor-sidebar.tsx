import { Search, Monitor, Server, Compass, Upload, FileUp, FileBraces, Globe, PlusCircle, Box, Paintbrush, Braces, Glasses, Map as MapIcon, Check } from "lucide-react";
import { useState, useEffect, JSX } from "react";
import { fetchCategories, UnifiedCategory } from "@/lib/api/categories";
import { CATEGORY_ICONS } from "@/lib/api/category-icons";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

interface EnvironmentItem {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
}

export interface EditorSidebarProps {
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
  const [activeView, setActiveView] = useState<string>("browse"); // "browse" | "overrides"
  const [categories, setCategories] = useState<UnifiedCategory[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoadingCategories(true);
    fetchCategories(contentType, provider).then(data => {
      if (mounted) {
        setCategories(data);
        setIsLoadingCategories(false);
        // Clean selected categories when filters change
        // We do this here to avoid rapid state updates in tabs onClick
      }
    });
    return () => { mounted = false; };
  }, [contentType, provider]);

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



  return (
    <aside className="w-80 border-r border-[#1E1E1E] bg-black flex flex-col flex-shrink-0 z-30 sticky top-[122px] h-[calc(100vh-122px)] overflow-hidden">
      
      <TooltipProvider delayDuration={200}>
        {/* VIEW Mode Switcher */}
        <div className="p-5 pb-4 shrink-0 flex flex-col gap-3">
          <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">View</h3>
          <Tabs value={activeView} onValueChange={(val) => val && setActiveView(val)} className="w-full">
            <TabsList className="bg-[#1E1E1E] border-0 rounded-xl p-1 gap-1 flex w-full h-11">
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="browse" 
                    className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                      activeView === 'browse' 
                        ? 'bg-[#333333] opacity-100 shadow-sm' 
                        : 'bg-transparent opacity-40 hover:opacity-80'
                    }`}
                  >
                    <Compass className="w-4 h-4 text-[#FE5000]" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                  <p>Browse & Add Content</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="overrides" 
                    className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                      activeView === 'overrides' 
                        ? 'bg-[#333333] opacity-100 shadow-sm' 
                        : 'bg-transparent opacity-40 hover:opacity-80'
                    }`}
                  >
                    <FileUp className="w-4 h-4 text-amber-400" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                  <p>Overrides & Custom Files</p>
                </TooltipContent>
              </Tooltip>

            </TabsList>
          </Tabs>
        </div>

        <div className="px-5 shrink-0">
          <Separator className="bg-[#1E1E1E] w-full" />
        </div>

        {activeView === "browse" ? (
          <>
            {/* Source Provider */}
            <div className="p-5 pb-4 shrink-0 flex flex-col gap-3">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">Source Provider</h3>
              <Tabs value={provider} onValueChange={(val) => { 
                if (val) { 
                  setProvider(val); 
                  setSelectedCategories([]); 
                  if (val === "modrinth" && contentType === "worlds") {
                    setContentType("mods");
                  }
                } 
              }} className="w-full">
                <TabsList className="bg-[#1E1E1E] border-0 rounded-xl p-1 gap-1 flex w-full h-11">
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="all" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          provider === 'all' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Globe className="w-4 h-4 text-white" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                      <p>All Sources</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="modrinth" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          provider === 'modrinth' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <img src="/social/modrinth.svg" alt="Modrinth" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-[#45D66F] font-medium shadow-xl">
                      <p>Modrinth</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="curseforge" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          provider === 'curseforge' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <img src="/social/curseforge.svg" alt="CurseForge" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-[#F16436] font-medium shadow-xl">
                      <p>CurseForge</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="custom" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          provider === 'custom' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <PlusCircle className="w-4 h-4 text-blue-400" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-blue-400 font-medium shadow-xl">
                      <p>Custom</p>
                    </TooltipContent>
                  </Tooltip>

                </TabsList>
              </Tabs>
            </div>

            {/* Content Type */}
            <div className="px-5 pb-4 shrink-0 flex flex-col gap-3">
              <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">Content Type</h3>
              <Tabs value={contentType} onValueChange={(val) => val && setContentType(val)} className="w-full">
                <TabsList className="bg-[#1E1E1E] border-0 rounded-xl p-1 gap-1 flex w-full h-11">
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="mods" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          contentType === 'mods' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Box className="w-4 h-4 text-[#FE5000]" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                      <p>Mods</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="textures" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          contentType === 'textures' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Paintbrush className="w-4 h-4 text-blue-400" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                      <p>Resource Packs</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="datapacks" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          contentType === 'datapacks' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Braces className="w-4 h-4 text-emerald-400" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                      <p>Datapacks</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <TabsTrigger 
                        value="shaders" 
                        className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                          contentType === 'shaders' 
                            ? 'bg-[#333333] opacity-100 shadow-sm' 
                            : 'bg-transparent opacity-40 hover:opacity-80'
                        }`}
                      >
                        <Glasses className="w-4 h-4 text-purple-400" />
                      </TabsTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                      <p>Shaders</p>
                    </TooltipContent>
                  </Tooltip>

                  {provider !== "modrinth" && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <TabsTrigger 
                          value="worlds" 
                          className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                            contentType === 'worlds' 
                              ? 'bg-[#333333] opacity-100 shadow-sm' 
                              : 'bg-transparent opacity-40 hover:opacity-80'
                          }`}
                        >
                          <MapIcon className="w-4 h-4 text-cyan-400" />
                        </TabsTrigger>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                        <p>Worlds</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                </TabsList>
              </Tabs>
            </div>

            {/* Separator under Source & Content Type */}
            <div className="px-5 shrink-0">
              <Separator className="bg-[#1E1E1E] w-full" />
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 min-h-0">
              <div className="flex flex-col gap-6 p-5">
                {/* Search */}
                <div className="flex flex-col gap-2">
                  <InputGroup>
                    <InputGroupAddon align="inline-start">
                      <Search className="w-4 h-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      type="text"
                      placeholder="Search mods..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 h-10 bg-[#1E1E1E] border-transparent focus-visible:border-[#FE5000] rounded-xl text-sm"
                    />
                  </InputGroup>
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
                            const iconData = CATEGORY_ICONS[cat.id] || CATEGORY_ICONS["default"];
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
                                    className={`w-4 h-4 transition-all duration-300 ${iconData.color} ${
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

                    {/* Environment List */}
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

                {provider === "custom" && (
                  <div className="text-sm text-white/50 text-center p-5 border-2 border-dashed border-[#1E1E1E] rounded-xl bg-[#1E1E1E]/20 mt-2">
                    Add mods manually by providing their direct download links in the main view.
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          /* Overrides View in Sidebar */
          <div className="p-5 flex flex-col gap-4 flex-1">
            <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">Override Folders</h3>
            <div className="flex flex-col gap-1 text-sm text-white/60">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1E1E1E] text-white">
                <FileBraces className="w-4 h-4 text-amber-400" />
                <span className="font-medium">config/</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#1E1E1E]/50 transition-colors cursor-pointer">
                <FileBraces className="w-4 h-4 text-white/40" />
                <span>defaultconfigs/</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#1E1E1E]/50 transition-colors cursor-pointer">
                <FileBraces className="w-4 h-4 text-white/40" />
                <span>kubejs/</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl hover:bg-[#1E1E1E]/50 transition-colors cursor-pointer">
                <FileBraces className="w-4 h-4 text-white/40" />
                <span>options.txt</span>
              </div>
            </div>

            <Button className="w-full bg-[#1E1E1E] hover:bg-white/10 text-white gap-2 rounded-xl h-10 mt-2">
              <Upload className="w-4 h-4 text-amber-400" />
              Upload Custom File
            </Button>
          </div>
        )}
      </TooltipProvider>

    </aside>
  );
}
