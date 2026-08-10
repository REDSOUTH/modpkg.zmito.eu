import { Plus, Box, Paintbrush, Glasses, FileBraces, Braces, Map, PlusCircle, FileText, Check, X, ExternalLink } from "lucide-react";
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
  iconUrl: string;
  description: string;
  categories: string[];
  provider?: CardProviderType;
  type?: CardContentType;
  versions?: string[];
  curseforgeId?: string | number;
  modrinthId?: string;
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
  const [versions, setVersions] = useState<ModVersion[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState(false);
  
  const { packSettings, installedContent, addContent, removeContent } = usePack();
  const { mcVersion, loader } = packSettings;
  
  const isAdded = installedContent.some(i => i.id === mod.id);
  const installedItem = installedContent.find(i => i.id === mod.id);
  const currentVersionId = installedItem?.versionId || "latest";

  const handleAddAction = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    
    if (isAdded) {
      if (mod.id) removeContent(mod.id);
    } else {
      if (mod.id) {
        addContent({
          id: mod.id,
          name: mod.name,
          provider: normalizeProvider(mod.provider || "modrinth") as CardProviderType,
          iconUrl: mod.iconUrl,
          versionId: "latest",
          versionName: "Latest",
          contentType: normalizeType(mod.type || "mod")
        });
      }
    }
  };

  const handleOpenChange = async (open: boolean) => {
    if (open && versions.length === 0 && !isLoadingVersions && mod.id) {
      setIsLoadingVersions(true);
      const fetched = await getModVersions(mod.provider || "modrinth", mod.id, mcVersion, loader);
      setVersions(fetched);
      setIsLoadingVersions(false);
    }
  };

  return (
    <motion.div 
      onClick={handleAddAction}
      className="group relative bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-4 overflow-hidden outline outline-3 outline-transparent transition-all duration-200 hover:outline-[#FE5000] hover:outline-offset-4 active:scale-95 cursor-pointer h-full"
    >

      <div className="flex items-start justify-between relative z-10 w-full">
        <div className="flex gap-4 items-center min-w-0 pr-24">
          <img 
            src={mod.iconUrl} 
            alt={mod.name} 
            className="w-14 h-14 rounded-xl bg-black object-cover transition-colors select-none cursor-pointer"
            draggable={false}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`https://modrinth.com/project/${mod.name.toLowerCase().replace(/ /g, '-')}`, '_blank');
            }}
            onMouseEnter={() => setIsTitleHovered(true)}
            onMouseLeave={() => setIsTitleHovered(false)}
          />
          <div className="flex flex-col justify-center gap-0.5">
            <div 
              className="flex items-center gap-1.5 cursor-pointer w-fit"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://modrinth.com/project/${mod.name.toLowerCase().replace(/ /g, '-')}`, '_blank');
              }}
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
              <h4 className={`text-white font-semibold text-base line-clamp-1 transition-colors group-hover:text-[#FE5000] ${isTitleHovered ? 'text-[#FE5000] underline' : ''}`}>
                {mod.name}
              </h4>
              <ExternalLink className={`w-3.5 h-3.5 text-[#FE5000] transition-opacity shrink-0 ${isTitleHovered ? 'opacity-100' : 'opacity-0'}`} />
            </div>
            
            {/* Subline: Author */}
            <div 
              className="flex items-center gap-1.5 text-white/40 text-xs w-fit group/author cursor-pointer mt-0.5"
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://modrinth.com/user/${mod.author}`, '_blank');
              }}
            >
              <span className="truncate transition-colors group-hover/author:text-[#FE5000] group-hover/author:underline">
                {mod.author}
              </span>
              <ExternalLink className="w-3 h-3 text-[#FE5000] transition-opacity opacity-0 group-hover/author:opacity-100 shrink-0" />
            </div>
          </div>
        </div>
        
        {/* Add button & Version Select Group (Absolute positioned) */}
        <div 
          className={`absolute top-0 right-0 flex items-center ml-2 rounded-full overflow-hidden border border-transparent transition-all flex-shrink-0 shadow-sm z-30 ${
            isAdded 
              ? "bg-[#FE5000] text-white" 
              : "bg-black text-white group-hover:bg-[#FE5000] group-hover:text-white"
          }`}
          onClick={(e) => e.stopPropagation()} // Prevent card click when interacting with buttons
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

          {/* Divider */}
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
      </div>

      <p className="text-sm text-white/60 line-clamp-2 relative z-10 mt-1 leading-relaxed">
        {mod.description}
      </p>

      {/* Footer tags (Categories + Icons) */}
      <div className="flex items-end justify-between mt-auto pt-2 relative z-10 gap-2">
        {/* Categories tags using shadcn Badge (Secondary variant) */}
        <div className="flex flex-wrap gap-2">
          {mod.categories.slice(0, 2).map(cat => (
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
          {mod.categories.length > 2 && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="inline-flex cursor-help" onClick={(e) => e.stopPropagation()}>
                    <Badge 
                      variant="secondary" 
                      className="bg-black/50 hover:bg-black text-white/60 hover:text-white rounded-md text-[10px] uppercase tracking-wider font-medium border border-transparent transition-colors cursor-help"
                    >
                      <Plus className="w-2.5 h-2.5 mr-0.5" />
                      {mod.categories.length - 2}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="bg-[#1E1E1E] text-white border-[#333] shadow-xl p-2 z-50">
                  <div className="flex flex-wrap gap-2 max-w-[200px]">
                    {mod.categories.slice(2).map(cat => (
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
        
        {/* Provider Icon(s) */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(mod.provider === "all" || mod.provider === "modrinth") && (
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <img src="/social/modrinth.svg" alt="Modrinth" title="Modrinth" className="w-3.5 h-3.5 object-contain shrink-0 select-none pointer-events-none" draggable={false} />
            </div>
          )}
          {(mod.provider === "all" || mod.provider === "curseforge") && (
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <img src="/social/curseforge.svg" alt="CurseForge" title="CurseForge" className="w-3.5 h-3.5 object-contain shrink-0 select-none pointer-events-none" draggable={false} />
            </div>
          )}
          {mod.provider === "custom" && (
            <div title="Custom Source" className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <PlusCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            </div>
          )}
          {mod.provider === "local_override" && (
            <div title="Local Override" className="flex items-center justify-center w-6 h-6 rounded-md bg-black/40 border border-white/5 opacity-60 group-hover:opacity-100 transition-opacity">
              <FileBraces className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
