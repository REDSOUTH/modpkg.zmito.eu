import { Package, ChevronRight, Copy, Check, Plus, Settings } from "lucide-react";
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
import { PackageDropdownSelector } from "@/components/common/package-dropdown-selector";
import { EditorTopbarProps } from "@/types";

export default function EditorTopbar({ onOpenSettings }: EditorTopbarProps) {
  const { packSettings, setIsCreatePackModalOpen, loaders } = usePack();
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

  const handleCreateNewProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsCreatePackModalOpen(true);
    onOpenSettings(null, true);
  };

  return (
    <div className="h-14 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between px-6 sticky top-[65px] z-40">
      
      {/* Breadcrumbs & Project Switcher */}
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:gap-2">
          <BreadcrumbItem>
            <Package className="w-4 h-4 text-[#FE5000]" />
          </BreadcrumbItem>
          
          <BreadcrumbItem className="relative">
            <div className="flex items-center gap-1">
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <BreadcrumbPage 
                      onClick={() => onOpenSettings("name")}
                      className="font-semibold text-foreground cursor-pointer hover:text-[#FE5000] hover:underline transition-colors"
                    >
                      {packSettings.name}
                    </BreadcrumbPage>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" sideOffset={8} className="border-0 shadow-xl p-2.5 flex items-center gap-2 rounded-xl">
                    <span className="text-xs font-mono text-muted-foreground">ID: {packSettings.id}</span>
                    <button 
                      onClick={handleCopyId}
                      className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                      title="Copy Pack ID"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Componentized Package Dropdown Selector */}
              <PackageDropdownSelector
                mode="topbar"
                onCreateNewPack={handleCreateNewProject}
              />
            </div>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-muted-foreground/40">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("mcVersion")}
              className="text-muted-foreground hover:text-[#FE5000] hover:underline cursor-pointer font-normal transition-colors"
            >
              Minecraft {packSettings.mcVersion}
            </BreadcrumbPage>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-muted-foreground/40">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("loader")}
              className="text-muted-foreground hover:text-[#FE5000] hover:underline cursor-pointer font-normal transition-colors"
            >
              {loaderName}
            </BreadcrumbPage>
          </BreadcrumbItem>
          
          <BreadcrumbSeparator className="text-muted-foreground/40">
            <ChevronRight className="w-4 h-4" />
          </BreadcrumbSeparator>
          
          <BreadcrumbItem>
            <BreadcrumbPage 
              onClick={() => onOpenSettings("version")}
              className="text-muted-foreground hover:text-[#FE5000] cursor-pointer font-mono text-xs bg-muted px-2 py-0.5 rounded border-2 border-border/60 hover:border-[#FE5000]/60 transition-colors"
            >
              {packSettings.currentVersion}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Right actions (Pack Settings & New Package buttons) */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => onOpenSettings()}
          className="bg-muted dark:bg-[#1E1E1E] hover:bg-muted/80 dark:hover:bg-[#252525] text-foreground dark:text-white/80 hover:text-foreground dark:hover:text-white text-xs font-medium px-3.5 py-2 rounded-xl ring-1 ring-inset ring-border/40 dark:ring-0 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <Settings className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Package Settings</span>
        </button>

        <button 
          onClick={handleCreateNewProject}
          className="bg-[#FE5000] hover:bg-[#E04700] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-[#FE5000] hover:outline-offset-[3px] active:scale-95 duration-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New MODPKG</span>
        </button>
      </div>

    </div>
  );
}
