import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export interface PathCopyBoxProps {
  value: string;
  showOpenLink?: boolean;
  className?: string;
}

export function PathCopyBox({ value, showOpenLink = false, className = "" }: PathCopyBoxProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className={`bg-[#1E1E1E]/60 border border-white/5 rounded-xl pl-3 pr-1.5 py-1 flex items-center justify-between gap-2 max-w-xs text-white/70 font-mono text-[11px] ${className}`}>
      <span className="truncate">{value}</span>
      <div className="flex items-center gap-0.5 shrink-0">
        <TooltipProvider delayDuration={150}>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </TooltipTrigger>
            <TooltipContent side="top" className="bg-[#1E1E1E] text-white border-[#333] shadow-xl text-xs py-1 px-2">
              {isCopied ? "Copied!" : "Copy path"}
            </TooltipContent>
          </Tooltip>

          {showOpenLink && (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors flex items-center justify-center"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1E1E1E] text-white border-[#333] shadow-xl text-xs py-1 px-2">
                Open URL
              </TooltipContent>
            </Tooltip>
          )}
        </TooltipProvider>
      </div>
    </div>
  );
}
