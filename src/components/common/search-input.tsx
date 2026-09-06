import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  showLabel?: boolean;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
  label = "SEARCH",
  showLabel = true,
  className,
}: SearchInputProps) {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {showLabel && label && (
        <h3 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest pl-1">
          {label}
        </h3>
      )}
      <div className="relative flex items-center w-full">
        <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none shrink-0" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-muted dark:bg-[#1E1E1E] text-foreground text-xs rounded-xl pl-9 pr-8 py-2.5 border-2 border-border/60 focus:border-[#FE5000] focus:outline-none placeholder:text-muted-foreground transition-colors h-10"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute right-2.5 p-1 rounded-lg text-muted-foreground hover:text-foreground transition-colors"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
