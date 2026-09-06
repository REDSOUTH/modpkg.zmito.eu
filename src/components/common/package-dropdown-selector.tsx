import { useState, useRef, useEffect, ReactNode } from "react";
import { createPortal } from "react-dom";
import { Search, Check, Plus, ChevronDown, Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { usePack } from "@/context/pack-context";
import { PackSettings } from "@/types";

export interface PackageDropdownSelectorProps {
  mode?: "topbar" | "add-to-pack";
  trigger?: ReactNode | ((isOpen: boolean) => ReactNode);
  itemCompatibility?: {
    mcVersion?: string;
    loader?: string;
  };
  checkIsItemInPack?: (packId: string) => boolean;
  onSelectPack?: (pack: PackSettings, isCurrentlyAdded: boolean) => void;
  onCreateNewPack?: () => void;
  align?: "left" | "right";
  className?: string;
}

export function PackageDropdownSelector({
  mode = "topbar",
  trigger,
  itemCompatibility,
  checkIsItemInPack,
  onSelectPack,
  onCreateNewPack,
  align = "left",
  className = "",
}: PackageDropdownSelectorProps) {
  const { packSettings, packagesList, switchPack } = usePack();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position relative to document body with exact alignment
  const updatePosition = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = dropdownRef.current?.offsetWidth || 320;
      const menuHeight = dropdownRef.current?.offsetHeight || 320;
      
      let left = rect.left + window.scrollX;
      if (align === "right") {
        left = rect.right + window.scrollX - menuWidth;
      }

      // Check if dropdown would overflow bottom of viewport
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      let top = rect.bottom + window.scrollY + 6;

      if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
        top = rect.top + window.scrollY - menuHeight - 6;
      }

      setMenuPosition({
        top: Math.max(12, top),
        left: Math.max(12, left),
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // Re-calculate once mounted to capture exact offsetWidth
      requestAnimationFrame(updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      window.addEventListener("resize", updatePosition);
    }
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const isPackCompatible = (pack: PackSettings): boolean => {
    if (!itemCompatibility) return true;
    const { mcVersion, loader } = itemCompatibility;
    const isMcCompat = !mcVersion || mcVersion === "Any" || mcVersion.split(",").map(v => v.trim()).includes(pack.mcVersion);
    const isLoaderCompat = !loader || loader === "Any" || loader.split(",").map(l => l.trim().toLowerCase()).includes(pack.loader.toLowerCase());
    return isMcCompat && isLoaderCompat;
  };

  const filteredPackages = packagesList.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase());
    if (mode === "add-to-pack") {
      return matchesSearch && isPackCompatible(p);
    }
    return matchesSearch;
  });

  const handleSelect = (pack: PackSettings) => {
    const isCurrentlyAdded = checkIsItemInPack ? checkIsItemInPack(pack.id) : false;
    if (mode === "topbar") {
      switchPack(pack.id);
      setIsOpen(false);
      setSearchQuery("");
    }
    onSelectPack?.(pack, isCurrentlyAdded);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    setSearchQuery("");
    onCreateNewPack?.();
  };

  return (
    <div className={`relative inline-block ${className}`} ref={triggerRef}>
      {/* Trigger Element */}
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {typeof trigger === "function" ? (
          trigger(isOpen)
        ) : trigger ? (
          trigger
        ) : (
          <button
            type="button"
            className={`p-1 rounded-lg transition-colors flex items-center justify-center ${
              isOpen ? "bg-muted text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
            title="Switch package"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180 text-[#FE5000]" : ""}`} />
          </button>
        )}
      </div>

      {/* Floating Menu in Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <motion.div
                ref={dropdownRef}
                initial={{ opacity: 0, scale: 0.95, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: `${menuPosition.top}px`,
                  left: `${menuPosition.left}px`,
                }}
                className="w-80 bg-popover border border-border text-popover-foreground rounded-2xl shadow-2xl p-2 z-[9999] overflow-hidden backdrop-blur-xl flex flex-col"
              >
                {/* Search Bar */}
                <div className="relative flex items-center px-1 py-1">
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder={mode === "add-to-pack" ? "Search compatible pack..." : "Search package..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-muted text-foreground text-xs rounded-xl pl-8 pr-3 py-2 border border-border focus:border-[#FE5000] focus:outline-none placeholder:text-muted-foreground transition-colors"
                    autoFocus
                  />
                </div>

                <Separator className="bg-border dark:bg-[#333333] my-1.5" />

                {/* Packages List */}
                <ScrollArea
                  className="max-h-60 [&>[data-radix-scroll-area-viewport]]:max-h-60 pr-1.5 custom-scrollbar"
                  onWheel={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-col gap-0.5 p-0.5">
                    {filteredPackages.length === 0 ? (
                      <div className="text-xs text-muted-foreground px-3 py-3 text-center">
                        {mode === "add-to-pack" ? "No compatible packages found" : "No packages found"}
                      </div>
                    ) : (
                      filteredPackages.map((p) => {
                        const isItemInPack = mode === "add-to-pack" && checkIsItemInPack ? checkIsItemInPack(p.id) : false;
                        const isCurrentActiveTopbar = mode === "topbar" && p.id === packSettings.id;
                        const isSelected = isItemInPack || isCurrentActiveTopbar;

                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelect(p)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? "bg-[#FE5000]/10 text-[#FE5000] font-medium"
                                : "text-foreground/80 hover:bg-muted hover:text-foreground"
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Package className="w-4 h-4 text-[#FE5000] shrink-0" />
                              <div className="flex flex-col text-left truncate min-w-0">
                                <span className="truncate font-semibold">{p.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono truncate">
                                  {p.loader} · {p.mcVersion} · {p.id}
                                </span>
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-[#FE5000] shrink-0" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </ScrollArea>

                {mode === "topbar" && onCreateNewPack && (
                  <>
                    <Separator className="bg-border dark:bg-[#333333] my-1.5" />
                    <button
                      type="button"
                      onClick={handleCreateNew}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#FE5000] hover:bg-[#FE5000]/10 transition-colors text-left"
                    >
                      <Plus className="w-4 h-4 shrink-0 text-[#FE5000]" />
                      <span>Create new MODPKG</span>
                    </button>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
