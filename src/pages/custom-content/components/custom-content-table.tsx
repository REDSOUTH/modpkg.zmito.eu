import { CustomContentItem } from "@/types";
import { ContentTypeBadge } from "@/components/common/content-type-icon";
import { StorageBadge } from "@/components/common/storage-badge";
import { Plus, Copy, Check, Trash2, Pencil, ExternalLink } from "lucide-react";
import { useState, MouseEvent } from "react";
import { usePack } from "@/context/pack-context";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from "framer-motion";

export interface CustomContentTableProps {
  items: CustomContentItem[];
  onDelete: (id: string) => void;
  onEdit: (item: CustomContentItem) => void;
}

export function CustomContentTable({ items, onDelete, onEdit }: CustomContentTableProps) {
  const { addContent, installedContent } = usePack();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyUrl = (e: MouseEvent, id: string, url: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleAdd = (e: MouseEvent, item: CustomContentItem) => {
    e.stopPropagation();
    addContent({
      id: item.id,
      name: item.name,
      provider: "custom",
      iconUrl: "",
      versionId: "custom",
      versionName: "Custom URL",
      contentType: item.contentType,
    });
  };

  const renderBadgeOverflow = (listString?: string, defaultBadge = "Any") => {
    if (!listString || listString === "Any" || listString === "all") {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-[#1E1E1E] text-white/60 border-0 whitespace-nowrap">
          {defaultBadge}
        </span>
      );
    }

    const itemsList = listString.split(",").map((s) => s.trim()).filter(Boolean);
    if (itemsList.length === 0) {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-[#1E1E1E] text-white/60 border-0 whitespace-nowrap">
          {defaultBadge}
        </span>
      );
    }

    const first = itemsList[0];
    const extraCount = itemsList.length - 1;

    return (
      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono bg-[#1E1E1E] text-white/90 border-0 whitespace-nowrap">
          {first}
        </span>

        {extraCount > 0 && (
          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#1E1E1E] text-white/60 hover:text-white cursor-pointer border-0 whitespace-nowrap">
                  +{extraCount} more
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-[#1E1E1E] border border-white/10 text-white font-medium text-xs shadow-xl">
                <div className="flex flex-col gap-1">
                  {itemsList.map((it, idx) => (
                    <span key={idx} className="font-mono">{it}</span>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1E1E1E] bg-[#121212]/80 text-[11px] font-bold text-white/40 uppercase tracking-wider">
            <th className="py-4 px-6 min-w-[220px]">Resource Name</th>
            <th className="py-4 px-4 min-w-[130px]">Type</th>
            <th className="py-4 px-4 min-w-[130px]">Loaders</th>
            <th className="py-4 px-4 min-w-[140px]">MC Versions</th>
            <th className="py-4 px-4 min-w-[170px]">Storage Source</th>
            <th className="py-4 px-4 min-w-[220px]">Download URL</th>
            <th className="py-4 px-6 text-right min-w-[220px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E1E1E] text-xs">
          {items.map((item) => {
            const isAdded = installedContent.some((i) => i.id === item.id);
            const isCopied = copiedId === item.id;

            return (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="hover:bg-[#1E1E1E]/40 transition-colors group"
              >
                {/* Name & Author & Target Path */}
                <td className="py-4 px-6">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2 text-[11px] text-white/50">
                      <span>By <strong className="text-white/80">{item.author || "Unknown"}</strong></span>
                      {item.targetPath && (
                        <span className="font-mono text-[11px] text-amber-400/90">
                          ({item.targetPath})
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Content Type Badge */}
                <td className="py-4 px-4">
                  <ContentTypeBadge type={item.contentType} />
                </td>

                {/* Loaders Column */}
                <td className="py-4 px-4">
                  {renderBadgeOverflow(item.loader, "All Loaders")}
                </td>

                {/* MC Versions Column */}
                <td className="py-4 px-4">
                  {renderBadgeOverflow(item.mcVersion, "All Versions")}
                </td>

                {/* Storage Location */}
                <td className="py-4 px-4">
                  <StorageBadge storageType={item.storageLocation} />
                </td>

                {/* Download URL */}
                <td className="py-4 px-4">
                  <div className="bg-[#1E1E1E]/60 border border-white/5 rounded-xl px-3 py-1.5 flex items-center justify-between gap-2 max-w-xs text-white/70 font-mono text-[11px]">
                    <span className="truncate">{item.downloadUrl}</span>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleCopyUrl(e, item.id, item.downloadUrl)}
                        className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        title="Copy URL"
                      >
                        {isCopied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <a
                        href={item.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="p-1 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </td>

                {/* Actions */}
                <td className="py-4 px-6 text-right whitespace-nowrap">
                  <div className="flex items-center justify-end gap-2">
                    {/* Edit Pencil Button */}
                    <button
                      onClick={() => onEdit(item)}
                      title="Edit Resource"
                      className="h-8 w-8 rounded-xl border border-[#1E1E1E] bg-[#1E1E1E] text-white/70 hover:border-blue-500 hover:text-blue-400 hover:bg-blue-500/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete Trash Button */}
                    <button
                      onClick={() => onDelete(item.id)}
                      title="Delete Resource"
                      className="h-8 w-8 rounded-xl border border-[#1E1E1E] bg-[#1E1E1E] text-white/70 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Add to Package Toggle Button */}
                    <button
                      onClick={(e) => handleToggleAdd(e, item)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 active:scale-95 ${
                        isAdded
                          ? "bg-blue-500 text-white"
                          : "bg-[#1E1E1E] text-white/80 hover:bg-blue-500 hover:text-white border border-transparent"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add to Package</span>
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
