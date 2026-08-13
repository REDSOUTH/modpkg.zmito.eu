import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Compass, FileUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ViewSwitcherProps {
  activeView: string;
  onViewChange: (view: string) => void;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ViewSwitcher({
  activeView,
  onViewChange,
  showLabel = true,
  label = "View",
  className,
}: ViewSwitcherProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {showLabel && (
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <TooltipProvider delayDuration={150}>
        <Tabs value={activeView} onValueChange={(val) => val && onViewChange(val)} className="w-full">
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
      </TooltipProvider>
    </div>
  );
}
