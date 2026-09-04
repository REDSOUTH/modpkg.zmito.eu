import * as React from "react";
import { Box, Paintbrush, Glasses, Braces, Map, FileBraces, FileText, Code2, FileJson, Image, File } from "lucide-react";
import { cn } from "@/lib/utils";
import { CardContentType } from "@/pages/editor/components/mod-card";
import { CustomFileType } from "@/types";

export interface ContentTypeIconProps extends React.HTMLAttributes<HTMLDivElement> {
  type: CardContentType | string;
  iconClassName?: string;
}

export function normalizeContentType(type: string): CardContentType {
  const t = type.toLowerCase();
  if (t === "mods" || t === "mod") return "mod";
  if (t === "resourcepacks" || t === "resourcepack" || t === "textures" || t === "texture") return "resourcepack";
  if (t === "shaders" || t === "shader") return "shader";
  if (t === "datapacks" || t === "datapack") return "datapack";
  if (t === "worlds" || t === "world") return "world";
  if (t === "overrides" || t === "override") return "override";
  return "mod";
}

export function ContentTypeIcon({ type, className, iconClassName, ...props }: ContentTypeIconProps) {
  const rawType = (type || "").toLowerCase();
  const normalized = normalizeContentType(type);

  const getIcon = () => {
    switch (rawType) {
      case "config":
        return <FileText className={cn("w-3.5 h-3.5 text-blue-400 shrink-0", iconClassName)} />;
      case "script":
        return <Code2 className={cn("w-3.5 h-3.5 text-purple-400 shrink-0", iconClassName)} />;
      case "data":
        return <FileJson className={cn("w-3.5 h-3.5 text-emerald-400 shrink-0", iconClassName)} />;
      case "multimedia":
      case "image":
        return <Image className={cn("w-3.5 h-3.5 text-pink-400 shrink-0", iconClassName)} />;
      case "other":
        return <File className={cn("w-3.5 h-3.5 text-amber-400 shrink-0", iconClassName)} />;
      default:
        break;
    }

    switch (normalized) {
      case "mod":
        return <Box className={cn("w-3.5 h-3.5 text-[#FE5000] shrink-0", iconClassName)} />;
      case "resourcepack":
        return <Paintbrush className={cn("w-3.5 h-3.5 text-blue-400 shrink-0", iconClassName)} />;
      case "shader":
        return <Glasses className={cn("w-3.5 h-3.5 text-purple-400 shrink-0", iconClassName)} />;
      case "datapack":
        return <Braces className={cn("w-3.5 h-3.5 text-emerald-400 shrink-0", iconClassName)} />;
      case "world":
        return <Map className={cn("w-3.5 h-3.5 text-cyan-400 shrink-0", iconClassName)} />;
      case "override":
        return <FileBraces className={cn("w-3.5 h-3.5 text-amber-400 shrink-0", iconClassName)} />;
      default:
        return <FileText className={cn("w-3.5 h-3.5 text-white/50 shrink-0", iconClassName)} />;
    }
  };

  return (
    <div className={cn("shrink-0 flex items-center justify-center h-3.5 w-3.5", className)} {...props}>
      {getIcon()}
    </div>
  );
}

export interface ContentTypeBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: CardContentType | string;
  showLabel?: boolean;
}

export function ContentTypeBadge({ type, showLabel = true, className, ...props }: ContentTypeBadgeProps) {
  const normalized = normalizeContentType(type);
  const labels: Record<CardContentType, string> = {
    mod: "Mod",
    resourcepack: "Resourcepack",
    shader: "Shader",
    datapack: "Datapack",
    world: "World",
    override: "Override"
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E1E1E] text-white/90 border-0 whitespace-nowrap",
        className
      )} 
      {...props}
    >
      <ContentTypeIcon type={normalized} />
      {showLabel && <span className="whitespace-nowrap">{labels[normalized] || normalized}</span>}
    </div>
  );
}

// ==========================================
// File Type Icon & Badge (Custom Files)
// ==========================================

export interface FileTypeIconProps extends React.HTMLAttributes<HTMLDivElement> {
  type: CustomFileType | string;
  iconClassName?: string;
}

export function FileTypeIcon({ type, className, iconClassName, ...props }: FileTypeIconProps) {
  const t = (type || "other").toLowerCase();
  const getIcon = () => {
    switch (t) {
      case "config":
        return <FileText className={cn("w-3.5 h-3.5 text-blue-400 shrink-0", iconClassName)} />;
      case "script":
        return <Code2 className={cn("w-3.5 h-3.5 text-purple-400 shrink-0", iconClassName)} />;
      case "data":
        return <FileJson className={cn("w-3.5 h-3.5 text-emerald-400 shrink-0", iconClassName)} />;
      case "multimedia":
      case "image":
        return <Image className={cn("w-3.5 h-3.5 text-pink-400 shrink-0", iconClassName)} />;
      default:
        return <File className={cn("w-3.5 h-3.5 text-amber-400 shrink-0", iconClassName)} />;
    }
  };

  return (
    <div className={cn("shrink-0 flex items-center justify-center h-3.5 w-3.5", className)} {...props}>
      {getIcon()}
    </div>
  );
}

export interface FileTypeBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  type: CustomFileType | string;
  showLabel?: boolean;
}

export function FileTypeBadge({ type, showLabel = true, className, ...props }: FileTypeBadgeProps) {
  const t = (type || "other").toLowerCase();
  const labels: Record<string, string> = {
    config: "Config",
    script: "Script",
    data: "Data",
    image: "Image",
    other: "Other",
  };

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E1E1E] text-white/90 border-0 whitespace-nowrap",
        className
      )} 
      {...props}
    >
      <FileTypeIcon type={t} />
      {showLabel && <span className="whitespace-nowrap">{labels[t] || t}</span>}
    </div>
  );
}
