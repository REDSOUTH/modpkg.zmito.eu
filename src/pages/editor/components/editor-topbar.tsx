import { Package, ChevronRight, Copy, Check, ChevronDown, Search, Plus, Settings } from "lucide-react";
import { useState, useRef, useEffect, MouseEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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

interface UserProject {
  id: string;
  name: string;
}

export default function EditorTopbar({ onOpenSettings }: EditorTopbarProps) {
  const { packSettings, packagesList, switchPack, setIsCreatePackModalOpen, loaders } = usePack();
  const [copied, setCopied] = useState<boolean>(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>("");

  const dropdownRef = useRef<HTMLLIElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: globalThis.MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProjectDropdownOpen(false);
      }
    }
    if (isProjectDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProjectDropdownOpen]);

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

  const filteredProjects = packagesList.filter(p =>
    p.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const handleSelectProject = (packId: string) => {
    switchPack(packId);
    setIsProjectDropdownOpen(false);
  };

  const handleCreateNewProject = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsProjectDropdownOpen(false);
    setIsCreatePackModalOpen(true);
    onOpenSettings(null, true);
  };

  return (
    <div className="h-14 border-b border-[#1E1E1E] bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 flex items-center justify-between px-6 sticky top-[65px] z-40">
      
      {/* Breadcrumbs & Project Switcher */}
      <Breadcrumb>
        <BreadcrumbList className="text-sm sm:gap-2">
          <BreadcrumbItem>
            <Package className="w-4 h-4 text-[#FE5000]" />
          </BreadcrumbItem>
          
          <BreadcrumbItem className="relative" ref={dropdownRef}>
            <div className="flex items-center gap-1">
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

              {/* Componentized Package Dropdown Selector */}
              <PackageDropdownSelector
                mode="topbar"
                onCreateNewPack={handleCreateNewProject}
              />
            </div>
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

      {/* Right actions (Pack Settings & New Package buttons) */}
      <div className="flex items-center gap-2.5">
        <button 
          onClick={() => onOpenSettings()}
          className="bg-[#1E1E1E] hover:bg-[#282828] text-white/80 hover:text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-colors flex items-center gap-2"
        >
          <Settings className="w-3.5 h-3.5 text-white/50" />
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
