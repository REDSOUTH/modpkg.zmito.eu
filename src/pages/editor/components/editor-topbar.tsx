import { Package, ChevronRight, Copy, Check } from "lucide-react";
import { useState, MouseEvent } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { usePack } from "@/context/pack-context";
import { EditorTopbarProps } from "@/types";

export default function EditorTopbar({ onOpenSettings }: EditorTopbarProps) {
  const { packSettings, loaders } = usePack();
  const [copied, setCopied] = useState<boolean>(false);

  const loaderObj = loaders.find(l => l.id === packSettings.loader);
  const loaderName = loaderObj ? loaderObj.name : packSettings.loader;

  const handleCopyId = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (packSettings?.id) {
      navigator.clipboard.writeText(packSettings.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="h-14 border-b border-[#1E1E1E] bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 flex items-center justify-between px-6 sticky top-[65px] z-40">
      
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:gap-2">
          <BreadcrumbItem>
            <Package className="w-4 h-4 text-[#FE5000]" />
          </BreadcrumbItem>
          
          <BreadcrumbItem>
            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <BreadcrumbPage 
                    onClick={() => onOpenSettings("name")}
                    className="font-semibold text-white cursor-pointer hover:text-[#FE5000] hover:underline transition-colors"
                  >
                    {packSettings.name}
                  </BreadcrumbPage>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8} className="bg-[#1E1E1E] border-0 text-white shadow-xl p-2.5 flex items-center gap-2 rounded-xl">
                  <span className="text-xs font-mono text-white/70">ID: {packSettings.id}</span>
                  <button 
                    onClick={handleCopyId}
                    className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                    title="Copy Pack ID"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-white/20">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("mcVersion")}
              className="text-white/60 hover:text-[#FE5000] hover:underline cursor-pointer font-normal transition-colors"
            >
              Minecraft {packSettings.mcVersion}
            </BreadcrumbPage>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-white/20">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("loader")}
              className="text-white/60 hover:text-[#FE5000] hover:underline cursor-pointer font-normal transition-colors"
            >
              {loaderName}
            </BreadcrumbPage>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-white/20">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("version")}
              className="text-white/60 hover:text-[#FE5000] cursor-pointer font-mono text-xs bg-[#1E1E1E] px-2 py-0.5 rounded border border-white/5 hover:border-[#FE5000]/50 transition-colors"
            >
              {packSettings.currentVersion}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions (Pack Settings button) */}
      <div className="flex items-center gap-3">
        <button 
          onClick={() => onOpenSettings()}
          className="bg-[#FE5000] hover:bg-[#E04700] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-[#FE5000] hover:outline-offset-[3px] active:scale-95 duration-200"
        >
          Pack Settings
        </button>
      </div>

    </div>
  );
}
