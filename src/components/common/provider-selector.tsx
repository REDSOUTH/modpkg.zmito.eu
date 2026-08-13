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
        <h3 className="text-[11px] font-bold text-white/40 uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <TooltipProvider delayDuration={150}>
        <Tabs value={provider} onValueChange={(val) => val && onProviderChange(val)} className="w-full">
          <TabsList className="bg-[#1E1E1E] border-0 rounded-xl p-1 gap-1 flex w-full h-11">
            
            {/* All Sources */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="all" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                    provider === 'all' 
                      ? 'bg-[#333333] opacity-100 shadow-sm' 
                      : 'bg-transparent opacity-40 hover:opacity-80'
                  }`}
                >
                  <Globe className="w-4 h-4 text-white" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-white font-medium shadow-xl">
                <p>All Sources</p>
              </TooltipContent>
            </Tooltip>

            {/* Modrinth */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="modrinth" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                    provider === 'modrinth' 
                      ? 'bg-[#333333] opacity-100 shadow-sm' 
                      : 'bg-transparent opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src="/social/modrinth.svg" alt="Modrinth" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-[#45D66F] font-medium shadow-xl">
                <p>Modrinth</p>
              </TooltipContent>
            </Tooltip>

            {/* CurseForge */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="curseforge" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                    provider === 'curseforge' 
                      ? 'bg-[#333333] opacity-100 shadow-sm' 
                      : 'bg-transparent opacity-40 hover:opacity-80'
                  }`}
                >
                  <img src="/social/curseforge.svg" alt="CurseForge" className="w-4 h-4 object-contain select-none pointer-events-none" draggable={false} />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-[#F16436] font-medium shadow-xl">
                <p>CurseForge</p>
              </TooltipContent>
            </Tooltip>

            {/* Custom */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="custom" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 ${
                    provider === 'custom' 
                      ? 'bg-[#333333] opacity-100 shadow-sm' 
                      : 'bg-transparent opacity-40 hover:opacity-80'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-blue-400" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="bg-[#1E1E1E] border-0 text-blue-400 font-medium shadow-xl">
                <p>Custom Source</p>
              </TooltipContent>
            </Tooltip>

          </TabsList>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
