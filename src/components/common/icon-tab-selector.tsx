import * as React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export interface IconTabOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  activeColorClass?: string;
}

export interface IconTabSelectorProps {
  label?: string;
  showLabel?: boolean;
  value: string;
  onValueChange: (value: string) => void;
  options: IconTabOption[];
  className?: string;
}

export function IconTabSelector({
  label,
  showLabel = true,
  value,
  onValueChange,
  options,
  className,
}: IconTabSelectorProps) {
  return (
    <div className={cn("flex flex-col gap-2.5 w-full", className)}>
      {showLabel && label && (
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <TooltipProvider delayDuration={150}>
        <Tabs value={value} onValueChange={(val) => val && onValueChange(val)} className="w-full">
          <TabsList className="bg-muted dark:bg-[#1E1E1E] border border-border/50 dark:border-0 rounded-xl p-1 gap-1 flex w-full h-11">
            {options.map((option) => {
              const isActive = value === option.id;
              return (
                <Tooltip key={option.id}>
                  <TooltipTrigger asChild>
                    <TabsTrigger
                      value={option.id}
                      className={cn(
                        "flex-1 h-9 rounded-lg transition-all duration-200 border-0 flex items-center justify-center",
                        isActive
                          ? "bg-white dark:bg-[#333333] text-foreground dark:text-white opacity-100 shadow-sm"
                          : "bg-transparent text-muted-foreground opacity-50 hover:opacity-100"
                      )}
                    >
                      {option.icon}
                    </TabsTrigger>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    sideOffset={10}
                    className="font-medium shadow-xl"
                  >
                    <p className={option.activeColorClass || "text-white"}>{option.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TabsList>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
