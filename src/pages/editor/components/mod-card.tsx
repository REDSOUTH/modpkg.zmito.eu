import { Plus, Check, X, ExternalLink } from "lucide-react";
import { ProviderIcon } from "@/components/common/provider-icon";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePack } from "@/context/pack-context";
import { getModVersions } from "@/lib/api/mods";
import { ModVersion } from "@/types";

export type CardContentType = "mod" | "resourcepack" | "shader" | "datapack" | "world" | "override";
export type CardProviderType = "modrinth" | "curseforge" | "custom" | "local_override" | "all";

export interface ModItemData {
  id?: string;
  name: string;
  author: string;
  authorUrl?: string;
  iconUrl: string;
  description: string;
  categories: string[];
  provider?: CardProviderType;
  type?: CardContentType;
  versions?: string[];
  curseforgeId?: string | number;
  modrinthId?: string;
  slug?: string;
  websiteUrl?: string;
}

export interface ModCardComponentProps {
  mod: ModItemData;
  onCategoryClick?: (category: string) => void;
}

const normalizeType = (t: string) => {
  if (t === "mods") return "mod";
  if (t === "resourcepacks" || t === "textures") return "resourcepack";
  if (t === "shaders") return "shader";
  if (t === "datapacks") return "datapack";
  if (t === "worlds") return "world";
  return t;
};

const normalizeProvider = (p: string) => {
  if (p === "all" || !p) return "modrinth";
  return p;
};

export default function ModCard({ mod, onCategoryClick }: ModCardComponentProps) {
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [versions, setVersions] = useState<ModVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  const { packSettings, installedContent, addContent, removeContent } = usePack();
  const { mcVersion, loader } = packSettings;
  
  const isAdded = installedContent.some(i => i.id === mod.id);
  const installedItem = installedContent.find(i => i.id === mod.id);
  const currentVersionId = installedItem?.versionId || "latest";

  const isCustom = mod.provider === "custom";

  const handleAddAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isAdded) {
      if (mod.id) removeContent(mod.id);
    } else {
      if (mod.id) {
        addContent({
          id: mod.id,
          name: mod.name,
          provider: isCustom ? "custom" : (normalizeProvider(mod.provider || "modrinth") as CardProviderType),
          iconUrl: mod.iconUrl,
          versionId: isCustom ? "custom" : "latest",
          versionName: isCustom ? "Custom URL" : "Latest",
          contentType: normalizeType(mod.type || "mod")
        });
      }
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open && versions.length === 0 && !isLoadingVersions && mod.id && !isCustom) {
      setIsLoadingVersions(true);
      const fetched = await getModVersions(mod.provider || "modrinth", mod.id, mcVersion, loader);
      setVersions(fetched);
      setIsLoadingVersions(false);
    }
  };

  const getProjectUrl = () => {
    if (mod.websiteUrl) return mod.websiteUrl;
    const provider = normalizeProvider(mod.provider || "modrinth");
    const identifier = mod.slug || mod.id || mod.name.toLowerCase().replace(/ /g, "");
    
    if (provider === "curseforge") {
      return `https://www.curseforge.com/minecraft/mc-mods/${identifier}`;
    }
    return `https://modrinth.com/mod/${identifier}`;
  };

  const getAuthorUrl = () => {
    if (mod.authorUrl) return mod.authorUrl;
    const provider = normalizeProvider(mod.provider || "modrinth");
    
    if (provider === "curseforge") {
      return `https://www.curseforge.com/members/${mod.author}/projects`;
    }
    return `https://modrinth.com/user/${mod.author}`;
  };

  const handleOpenProject = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (mod.websiteUrl) {
      window.open(mod.websiteUrl, '_blank');
    }
  };

  const handleOpenAuthor = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isCustom) {
      window.open(getAuthorUrl(), '_blank');
    }
  };

  return (
    <motion.div 
      onClick={handleAddAction}
      className="group relative bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-4 overflow-hidden outline outline-3 outline-transparent transition-all duration-200 hover:outline-[#FE5000] hover:outline-offset-4 active:scale-95 cursor-pointer h-full"
    >

      <div className="flex items-start justify-between relative z-10 w-full">
        
        {/* Title container with dynamic right padding to prevent button overlap */}
        <div className={`flex gap-3.5 items-center min-w-0 w-full ${isCustom ? 'pr-10' : 'pr-20'}`}>
          
          {/* Icon rendering with light grey MODPKG logo fallback */}
          {mod.iconUrl && !imageError ? (
            <img 
              src={mod.iconUrl} 
              alt={mod.name} 
              onError={() => setImageError(true)}
              className="w-14 h-14 rounded-xl bg-black object-cover transition-colors select-none cursor-pointer shrink-0"
              draggable={false}
              onClick={handleOpenProject}
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            />
          ) : (
            <div 
              className="w-14 h-14 rounded-xl bg-[#141414] border border-white/5 flex items-center justify-center shrink-0 cursor-pointer p-3 select-none"
              onClick={handleOpenProject}
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
              <img 
                src="/logo.svg" 
                alt="MODPKG" 
                className="w-full h-full object-contain opacity-30 grayscale"
                draggable={false}
              />
            </div>
          )}

          <div className="flex flex-col justify-center gap-0.5 min-w-0 flex-1">
            <TooltipProvider delayDuration={400}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center gap-1.5 cursor-pointer min-w-0 max-w-full"
                    onClick={handleOpenProject}
                    onMouseEnter={() => setIsTitleHovered(true)}
                    onMouseLeave={() => setIsTitleHovered(false)}
                  >
                    <h4 className={`font-semibold text-base leading-tight truncate ${isTitleHovered ? 'text-[#FE5000] underline' : 'text-white'}`}>
                      {mod.name}
                    </h4>
                    {mod.websiteUrl && (
                      <ExternalLink className={`w-3.5 h-3.5 text-[#FE5000] transition-opacity shrink-0 ${isTitleHovered ? 'opacity-100' : 'opacity-0'}`} />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#1E1E1E] text-white border border-[#333] shadow-xl text-xs rounded-lg p-2 max-w-xs z-50">
                  <p className="font-semibold">{mod.name}</p>
                  <p className="text-[10px] text-white/50">{mod.author}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            {/* Subline: Author */}
            <div 
              className="flex items-center gap-1.5 text-white/40 text-xs w-fit group/author cursor-pointer mt-0.5"
              onClick={handleOpenAuthor}
            >
              <span className="truncate transition-colors group-hover/author:text-[#FE5000] group-hover/author:underline">
                {mod.author}
              </span>
              {!isCustom && (
                <ExternalLink className="w-3 h-3 text-[#FE5000] transition-opacity opacity-0 group-hover/author:opacity-100 shrink-0" />
              )}
            </div>
          </div>
        </div>
        
        {/* Add button & Version Select Group */}
        {isCustom ? (
          /* For Custom Content: ONLY show the + / Check button without version dropdown */
          <div 
            className={`absolute top-0 right-0 flex items-center rounded-full overflow-hidden border border-transparent transition-all flex-shrink-0 shadow-sm z-30 ${
              isAdded ? "bg-[#FE5000] text-white" : "bg-black text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="group/btn w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-all"
                    onClick={handleAddAction}
                  >
                    {!isAdded && <Plus className="w-4 h-4" />}
                    {isAdded && (
                      <>
                        <Check className="w-4 h-4 block group-hover/btn:hidden" />
                        <X className="w-4 h-4 hidden group-hover/btn:block" />
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E1E1E] text-white border-transparent text-xs">
                  <p>{isAdded ? "Remove" : "Add to Package"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ) : (
          /* Standard Provider Card: Show + Button AND Version Select Dropdown */
          <div 
            className={`absolute top-0 right-0 flex items-center ml-2 rounded-full overflow-hidden border border-transparent transition-all flex-shrink-0 shadow-sm z-30 ${
              isAdded ? "bg-[#FE5000] text-white" : "bg-black text-white"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    className="group/btn w-8 h-8 flex items-center justify-center hover:bg-white/20 transition-all"
                    onClick={handleAddAction}
                  >
                    {!isAdded && <Plus className="w-4 h-4" />}
                    {isAdded && (
                      <>
                        <Check className="w-4 h-4 block group-hover/btn:hidden" />
                        <X className="w-4 h-4 hidden group-hover/btn:block" />
                      </>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-[#1E1E1E] text-white border-transparent text-xs">
                  <p>{isAdded ? "Remove" : "Add Latest"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <div className="w-px h-4 bg-white/20 transition-colors" />

            <Select 
              value={currentVersionId}
              onOpenChange={handleOpenChange}
              onValueChange={(val) => {
                if (mod.id) {
                  addContent({
                    id: mod.id,
                    name: mod.name,
                    provider: normalizeProvider(mod.provider || "modrinth") as CardProviderType,
                    iconUrl: mod.iconUrl,
                    versionId: val,
                    versionName: val === "latest" ? "Latest" : val === "latest-unstable" ? "Latest Unstable" : versions.find(v => v.id === val)?.name || val,
                    contentType: normalizeType(mod.type || "mod")
                  });
                }
              }}
            >
              <SelectTrigger 
                className="w-8 h-8 p-0 border-none bg-transparent hover:bg-white/20 focus:ring-0 shadow-none flex items-center justify-center rounded-none transition-colors [&>svg]:w-4 [&>svg]:h-4 [&>span]:hidden [&>svg]:opacity-100 [&>svg]:text-white"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1E1E1E] text-white border-[#333] rounded-xl shadow-xl z-50">
                <SelectItem value="latest" className="focus:bg-black focus:text-[#FE5000] text-xs font-medium">Latest</SelectItem>
                <SelectItem value="latest-unstable" className="focus:bg-black focus:text-[#FE5000] text-xs font-medium">Latest Unstable</SelectItem>
                {isLoadingVersions ? (
                  <div className="text-xs text-white/40 px-2 py-2 text-center animate-pulse">Loading versions...</div>
                ) : versions.length === 0 ? (
                  <div className="text-xs text-white/40 px-2 py-2 text-center">No versions found</div>
                ) : (
                  <>
                    <div className="h-px bg-white/10 my-1 mx-2" />
                    {versions.map(v => (
                      <SelectItem key={v.id} value={v.id} className="focus:bg-black focus:text-[#FE5000] text-xs">
                        {v.name}
                        {!v.stable && (
                          <span className="text-white/40 text-[10px] ml-1.5">(Unstable)</span>
                        )}
                        {v.recommended && (
                          <span className="text-[10px] font-bold text-blue-500 ml-1">★</span>
                        )}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <p className="text-sm text-white/60 line-clamp-2 break-words relative z-10 mt-1 leading-relaxed">
        {mod.description}
      </p>

      {/* Footer tags */}
      <div className="flex items-end justify-between mt-auto pt-2 relative z-10 gap-2">
        
        {/* Categories tags (Fluid single-line layout using flex-nowrap & shrink min-w-0) */}
        {!isCustom && mod.categories && mod.categories.length > 0 ? (
          <div className="flex items-center gap-1.5 overflow-hidden max-w-[calc(100%-36px)] flex-nowrap">
            {mod.categories.slice(0, 2).map((cat) => (
              <Badge 
                key={cat} 
                variant="secondary" 
                className="bg-black/50 hover:bg-black text-white/60 hover:text-white rounded-md text-[10px] uppercase tracking-wider font-medium border border-transparent transition-colors cursor-pointer truncate shrink min-w-0 max-w-[120px]"
                onClick={(e) => {
                  e.stopPropagation();
                  onCategoryClick?.(cat);
                }}
              >
                {cat}
              </Badge>
            ))}
            {mod.categories.length > 2 && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex cursor-help shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Badge 
                        variant="secondary" 
                        className="bg-black/50 hover:bg-black text-white/60 hover:text-white rounded-md text-[10px] uppercase tracking-wider font-medium border border-transparent transition-colors shrink-0"
                      >
                        +{mod.categories.length - 2}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-[#1E1E1E] text-white border-[#333] shadow-xl p-2 z-50">
                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                      {mod.categories.slice(2).map((cat) => (
                        <Badge 
                          key={cat} 
                          variant="secondary" 
                          className="bg-black/50 hover:bg-black text-white/60 hover:text-white rounded-md text-[10px] uppercase tracking-wider font-medium border border-transparent transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onCategoryClick?.(cat);
                          }}
                        >
                          {cat}
                        </Badge>
                      ))}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        ) : <div />}
        
        {/* Provider Icon */}
        <div className="flex items-center gap-1.5 shrink-0 ml-auto">
          {mod.provider === "all" ? (
            <>
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                <ProviderIcon provider="modrinth" size="sm" />
              </div>
              <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
                <ProviderIcon provider="curseforge" size="sm" />
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <ProviderIcon provider={mod.provider || "modrinth"} size="sm" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
