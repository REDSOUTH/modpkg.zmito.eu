import * as React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Package, PlusCircle, FileSliders } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ResourceOptionsSectionProps {
  context?: "standalone" | "editor"; // "standalone" (My Resources library) or "editor" (Active modpack package)
  accentColor?: "blue" | "amber";
  resourceType?: "content" | "file";
  showAddToPackage?: boolean;
  
  // Active package option
  addToPackage?: boolean;
  onAddToPackageChange?: (checked: boolean) => void;

  // Library option
  saveToLibrary?: boolean;
  onSaveToLibraryChange?: (checked: boolean) => void;

  // Cloud sync option
  saveToCloud?: boolean;
  onSaveToCloudChange?: (checked: boolean) => void;
  isLoggedIn?: boolean;

  className?: string;
}

export function ResourceOptionsSection({
  context = "standalone",
  accentColor = "blue",
  resourceType = "content",
  showAddToPackage = true,
  addToPackage = false,
  onAddToPackageChange,
  saveToLibrary = true,
  onSaveToLibraryChange,
  saveToCloud = false,
  onSaveToCloudChange,
  isLoggedIn = false,
  className,
}: ResourceOptionsSectionProps) {
  const isStandalone = context === "standalone";

  // Accent color classes
  const checkboxCheckedClass = accentColor === "amber"
    ? "data-[state=checked]:bg-amber-400 data-[state=checked]:border-amber-400 data-[state=checked]:text-black"
    : "data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500";

  const iconColorClass = accentColor === "amber" ? "text-amber-400" : "text-blue-400";

  const libraryTitle = "Save to My Resources";
  const LibraryIcon = resourceType === "content" ? PlusCircle : FileSliders;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
        Storage & Options
      </label>

      <div className="flex flex-col gap-2.5">
        {/* Editor-only option: Add directly to active package */}
        {!isStandalone && showAddToPackage && onAddToPackageChange && (
          <div
            onClick={() => onAddToPackageChange(!addToPackage)}
            className="flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl cursor-pointer hover:bg-[#1E1E1E] transition-colors"
          >
            <Checkbox
              checked={addToPackage}
              onCheckedChange={(checked) => onAddToPackageChange(!!checked)}
              className={cn("border-white/20", checkboxCheckedClass)}
            />
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 shrink-0 text-[#FE5000]" />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white">Add directly to current package</span>
                <span className="text-[11px] text-white/50">Install to active modpkg version list</span>
              </div>
            </div>
          </div>
        )}

        {/* Editor-only option: Save in My Resources library */}
        {!isStandalone && onSaveToLibraryChange && (
          <div
            onClick={() => onSaveToLibraryChange(!saveToLibrary)}
            className="flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl cursor-pointer hover:bg-[#1E1E1E] transition-colors"
          >
            <Checkbox
              checked={saveToLibrary}
              onCheckedChange={(checked) => onSaveToLibraryChange(!!checked)}
              className={cn("border-white/20", checkboxCheckedClass)}
            />
            <div className="flex items-center gap-2.5">
              <LibraryIcon className={cn("w-4 h-4 shrink-0", iconColorClass)} />
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white">{libraryTitle}</span>
                <span className="text-[11px] text-white/50">Make accessible across all your modpkgs</span>
              </div>
            </div>
          </div>
        )}

        {/* Always visible: Save to REDSOUTH Account Cloud Sync */}
        {onSaveToCloudChange && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div
                  onClick={() => {
                    if (isLoggedIn) onSaveToCloudChange(!saveToCloud);
                  }}
                  className={cn(
                    "flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl transition-colors",
                    isLoggedIn ? "cursor-pointer hover:bg-[#1E1E1E]" : "opacity-50 cursor-not-allowed"
                  )}
                >
                  <Checkbox
                    disabled={!isLoggedIn}
                    checked={saveToCloud && isLoggedIn}
                    onCheckedChange={(checked) => {
                      if (isLoggedIn) onSaveToCloudChange(!!checked);
                    }}
                    className={cn("border-white/20 disabled:cursor-not-allowed", checkboxCheckedClass)}
                  />
                  <div className="flex items-center gap-2.5">
                    <img src="/redsouth/logo-colored.svg" alt="REDSOUTH Account" className="w-4 h-4 object-contain shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Save to REDSOUTH Account</span>
                      <span className="text-[11px] text-white/50">
                        {isLoggedIn ? "Sync across your REDSOUTH devices" : "Sign in to sync across devices"}
                      </span>
                    </div>
                  </div>
                </div>
              </TooltipTrigger>
              {!isLoggedIn && (
                <TooltipContent side="top" sideOffset={8} className="bg-[#1E1E1E] border border-white/10 text-white font-medium text-xs shadow-xl max-w-xs">
                  <p>Sign in to your REDSOUTH Account to sync resources across devices.</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
