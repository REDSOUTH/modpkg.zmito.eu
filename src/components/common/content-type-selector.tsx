import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { cn } from "@/lib/utils";

export interface ContentTypeSelectorProps {
  contentType: string;
  onContentTypeChange: (type: string) => void;
  provider?: string;
  showLabel?: boolean;
  label?: string;
  className?: string;
}

export function ContentTypeSelector({
  contentType,
  onContentTypeChange,
  provider = "all",
  showLabel = true,
  label = "Content Type",
  className,
}: ContentTypeSelectorProps) {
  const isModrinthOnly = provider === "modrinth";

  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {showLabel && (
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <TooltipProvider delayDuration={150}>
        <Tabs value={contentType} onValueChange={(val) => val && onContentTypeChange(val)} className="w-full">
          <TabsList className="bg-muted/70 dark:bg-[#1E1E1E] border border-border/50 dark:border-0 rounded-xl p-1 gap-1 flex w-full h-11">
            
            {/* Mods */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="mods" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    contentType === 'mods' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <ContentTypeIcon type="mod" iconClassName="w-4 h-4" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                <p>Mods</p>
              </TooltipContent>
            </Tooltip>

            {/* Resourcepacks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="textures" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    contentType === 'textures' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <ContentTypeIcon type="resourcepack" iconClassName="w-4 h-4" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                <p>Resourcepacks</p>
              </TooltipContent>
            </Tooltip>

            {/* Shaders */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="shaders" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    contentType === 'shaders' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <ContentTypeIcon type="shader" iconClassName="w-4 h-4" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                <p>Shaders</p>
              </TooltipContent>
            </Tooltip>

            {/* Datapacks */}
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger 
                  value="datapacks" 
                  className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                    contentType === 'datapacks' 
                      ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                      : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                  }`}
                >
                  <ContentTypeIcon type="datapack" iconClassName="w-4 h-4" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                <p>Datapacks</p>
              </TooltipContent>
            </Tooltip>

            {/* Worlds (Only shown if not Modrinth only) */}
            {!isModrinthOnly && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <TabsTrigger 
                    value="worlds" 
                    className={`flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center ${
                      contentType === 'worlds' 
                        ? 'bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm' 
                        : 'bg-transparent text-muted-foreground opacity-50 hover:opacity-100'
                    }`}
                  >
                    <ContentTypeIcon type="world" iconClassName="w-4 h-4" />
                  </TabsTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={10} className="border-0 font-medium shadow-xl">
                  <p>Worlds</p>
                </TooltipContent>
              </Tooltip>
            )}

          </TabsList>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
