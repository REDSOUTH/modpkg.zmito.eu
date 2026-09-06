import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Globe, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProviderSelectorProps {
  provider: string;
  onProviderChange: (provider: string) => void;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ProviderSelector({
  provider,
  onProviderChange,
  showLabel = true,
  label = "Source Provider",
  className,
}: ProviderSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {showLabel && (
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <TooltipProvider delayDuration={150}>
        <Tabs value={provider} onValueChange={(val) => val && onProviderChange(val)} className="w-full">
          <TabsList className="bg-muted/70 dark:bg-[#1E1E1E] border border-border/50 dark:border-0 rounded-xl p-1 gap-1 flex w-full h-11">
            
            {/* All Sources */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="all" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    provider === 'all' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <Globe className="w-4 h-4 text-foreground dark:text-white" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                <p>All Sources</p>
              </TooltipContent>
            </Tooltip>

            {/* Modrinth */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="modrinth" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    provider === 'modrinth' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src="/social/modrinth.svg" alt="Modrinth" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 text-[#45D66F] font-medium shadow-xl">
                <p>Modrinth</p>
              </TooltipContent>
            </Tooltip>

            {/* CurseForge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="curseforge" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    provider === 'curseforge' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <img src="/social/curseforge.svg" alt="CurseForge" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 text-[#F16436] font-medium shadow-xl">
                <p>CurseForge</p>
              </TooltipContent>
            </Tooltip>

            {/* Custom */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="custom" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    provider === 'custom' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 text-blue-400 font-medium shadow-xl">
                <p>Custom Source</p>
              </TooltipContent>
            </Tooltip>

          </TabsList>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
