import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  showArrow?: boolean;
  arrowClassName?: string;
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, sideOffset = 6, showArrow = true, arrowClassName, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        "z-50 rounded-md bg-popover text-popover-foreground border border-border dark:border-[#333333] px-3 py-1.5 text-xs shadow-xl animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]",
        className
      )}
      {...props}
    >
      {children}
      {showArrow && (
        <TooltipPrimitive.Arrow asChild>
          <svg
            viewBox="0 0 30 10"
            width={12}
            height={6}
            className={cn("fill-popover dark:fill-[#1E1E1E] overflow-visible -translate-y-px", arrowClassName)}
          >
            <path
              d="M 0 0 L 15 10 L 30 0"
              className="fill-popover dark:fill-[#1E1E1E] stroke-border dark:stroke-[#333333]"
              vectorEffect="non-scaling-stroke"
              strokeWidth={1}
              strokeLinejoin="round"
            />
          </svg>
        </TooltipPrimitive.Arrow>
      )}
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
