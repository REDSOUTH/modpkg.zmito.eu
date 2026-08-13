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
import { EditorTopbarProps } from "@/types";

interface UserProject {
  id: string;
  name: string;
}

export default function EditorTopbar({ onOpenSettings }: EditorTopbarProps) {
  const { packSettings, updatePackSettings, loaders } = usePack();
  const [copied, setCopied] = useState<boolean>(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState<boolean>(false);
  const [projectSearchQuery, setProjectSearchQuery] = useState<string>("");

  const dropdownRef = useRef<HTMLLIElement>(null);

  // Mock list of user projects
  const [userProjects, setUserProjects] = useState<UserProject[]>([
    { id: packSettings.id, name: packSettings.name },
    { id: "modpkg-cobblemon", name: "Cobblemon SMP" },
    { id: "modpkg-create", name: "Create & Magic" },
    { id: "modpkg-vanilla", name: "Vanilla+ Performance" },
  ]);

  // Keep current pack in list if name changes
  useEffect(() => {
    setUserProjects(prev => {
      if (prev.some(p => p.id === packSettings.id)) {
        return prev.map(p => p.id === packSettings.id ? { ...p, name: packSettings.name } : p);
      }
      return [{ id: packSettings.id, name: packSettings.name }, ...prev];
    });
  }, [packSettings.id, packSettings.name]);

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

  const filteredProjects = userProjects.filter(p =>
    p.name.toLowerCase().includes(projectSearchQuery.toLowerCase())
  );

  const handleSelectProject = (project: UserProject) => {
    updatePackSettings({ id: project.id, name: project.name });
    setIsProjectDropdownOpen(false);
  };

  const handleCreateNewProject = () => {
    setIsProjectDropdownOpen(false);
    onOpenSettings("name");
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

              {/* Ghost Button to open project dropdown */}
              <button
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className={`p-1 rounded-lg transition-colors flex items-center justify-center ${
                  isProjectDropdownOpen 
                    ? "bg-white/10 text-white" 
                    : "text-white/40 hover:text-white hover:bg-white/10"
                }`}
                title="Switch package"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isProjectDropdownOpen ? "rotate-180 text-[#FE5000]" : ""}`} />
              </button>
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {isProjectDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="absolute top-full left-0 mt-2 w-72 bg-[#0A0A0A] border-2 border-[#1E1E1E] rounded-2xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl flex flex-col"
                >
                  {/* Search Bar */}
                  <div className="relative flex items-center px-1 py-1">
                    <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Search package..."
                      value={projectSearchQuery}
                      onChange={(e) => setProjectSearchQuery(e.target.value)}
                      className="w-full bg-[#1E1E1E] text-white text-xs rounded-xl pl-8 pr-3 py-2 border border-transparent focus:border-[#FE5000] focus:outline-none placeholder:text-white/40 transition-colors"
                      autoFocus
                    />
                  </div>

                  {/* Separator */}
                  <Separator className="bg-[#1E1E1E] my-1.5" />

                  {/* Projects List */}
                  <ScrollArea className="max-h-48 custom-scrollbar">
                    <div className="flex flex-col gap-0.5 p-0.5">
                      {filteredProjects.length === 0 ? (
                        <div className="text-xs text-white/40 px-3 py-3 text-center">
                          No packages found
                        </div>
                      ) : (
                        filteredProjects.map((p) => {
                          const isActive = p.id === packSettings.id;
                          return (
                            <button
                              key={p.id}
                              onClick={() => handleSelectProject(p)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors ${
                                isActive
                                  ? "bg-[#FE5000]/10 text-[#FE5000] font-medium"
                                  : "text-white/80 hover:bg-[#1E1E1E] hover:text-white"
                              }`}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <img src="/logo.svg" alt="MODPKG" className="w-4 h-4 object-contain shrink-0" />
                                <span className="truncate">{p.name}</span>
                              </div>
                              {isActive && <Check className="w-3.5 h-3.5 text-[#FE5000] shrink-0" />}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </ScrollArea>

                  {/* Separator */}
                  <Separator className="bg-[#1E1E1E] my-1.5" />

                  {/* Create New MODPKG Button */}
                  <button
                    onClick={handleCreateNewProject}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FE5000] hover:bg-[#FE5000]/10 transition-colors text-left"
                  >
                    <Plus className="w-4 h-4 shrink-0 text-[#FE5000]" />
                    <span>Create new MODPKG</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
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
          onClick={() => onOpenSettings("name")}
          className="bg-[#FE5000] hover:bg-[#E04700] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-[#FE5000] hover:outline-offset-[3px] active:scale-95 duration-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>New Package</span>
        </button>
      </div>

    </div>
  );
}
