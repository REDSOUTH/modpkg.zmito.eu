import React, { forwardRef } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ActionButtonColor = "zinc" | "orange" | "red" | "blue" | "emerald" | "amber";

export interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label?: React.ReactNode;
  tooltip?: React.ReactNode;
  tooltipSide?: "top" | "bottom" | "left" | "right";
  tooltipSideOffset?: number;
  color?: ActionButtonColor;
  size?: "sm" | "md" | "lg";
  height?: string;
  fullWidth?: boolean;
}

const colorStyles: Record<ActionButtonColor, string> = {
  zinc: "hover:border-zinc-400 dark:hover:border-zinc-500 hover:text-foreground",
  orange: "hover:border-[#FE5000] hover:text-[#FE5000]",
  red: "hover:border-red-500 hover:text-red-500",
  blue: "hover:border-blue-500 hover:text-blue-500",
  emerald: "hover:border-emerald-500 hover:text-emerald-500",
  amber: "hover:border-amber-400 hover:text-amber-400",
};

export const ActionButton = forwardRef<HTMLButtonElement, ActionButtonProps>(
  (
    {
      icon,
      label,
      children,
      tooltip,
      tooltipSide = "top",
      tooltipSideOffset = 4,
      color = "zinc",
      size = "md",
      height,
      fullWidth = false,
      className,
      type = "button",
      disabled,
      ...props
    },
    ref
  ) => {
    const textContent = label ?? children;
    const hasText = textContent !== undefined && textContent !== null && textContent !== "";

    // Sizing logic
    let sizeClasses = "";
    if (size === "sm") {
      sizeClasses = hasText ? "h-8 px-2.5 text-xs gap-1.5" : "h-8 w-8";
    } else if (size === "lg") {
      sizeClasses = hasText ? "h-11 px-4 text-xs font-semibold gap-2" : "h-11 w-11";
    } else {
      // default / md
      sizeClasses = hasText ? "h-9 px-3 text-xs font-medium gap-1.5" : "h-9 w-9";
    }

    // Explicit height override support
    let heightClass = "";
    if (height) {
      if (hasText) {
        heightClass = height;
      } else {
        const widthMatch = height.match(/h-(\[?[0-9a-zA-Z%.\-_]+\]?)/);
        const wClass = widthMatch ? `w-${widthMatch[1]}` : "";
        heightClass = `${height} ${wClass}`.trim();
      }
    }

    const buttonElement = (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={cn(
          "rounded-xl border-2 border-border bg-muted dark:bg-[#141414] text-muted-foreground hover:bg-transparent",
          "flex items-center justify-center shrink-0 transition-all cursor-pointer select-none",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          colorStyles[color],
          sizeClasses,
          heightClass,
          fullWidth && "w-full",
          className
        )}
        {...props}
      >
        {icon}
        {hasText && <span>{textContent}</span>}
      </button>
    );

    if (!tooltip) {
      return buttonElement;
    }

    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{buttonElement}</TooltipTrigger>
          <TooltipContent side={tooltipSide} sideOffset={tooltipSideOffset} className="text-xs">
            {typeof tooltip === "string" ? <p>{tooltip}</p> : tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }
);

ActionButton.displayName = "ActionButton";
