import { CustomFileItem } from "@/types";
import { StorageBadge } from "@/components/common/storage-badge";
import { FileTypeBadge } from "@/components/common/content-type-icon";
import { Pencil, Trash2, FileSliders, Code2, Globe } from "lucide-react";
import { motion } from "framer-motion";

// ── Content mode badge ────────────────────────────────────────────────────────

function ContentBadge({ item }: { item: CustomFileItem }) {
  if (item.sourceUrl) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400/10 text-amber-400">
        <Globe className="w-3 h-3" />
        URL
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#1E1E1E] text-white/60">
      <Code2 className="w-3 h-3" />
      Inline
    </span>
  );
}

// ── Main table ────────────────────────────────────────────────────────────────

export interface ConfigFilesTableProps {
  items: CustomFileItem[];
  onDelete: (id: string) => void;
  onEdit: (item: CustomFileItem) => void;
}

export function ConfigFilesTable({ items, onDelete, onEdit }: ConfigFilesTableProps) {
  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-[#1E1E1E] bg-[#0A0A0A] shadow-2xl">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#1E1E1E] bg-[#121212]/80 text-[11px] font-bold text-white/40 uppercase tracking-wider">
            <th className="py-4 px-6 min-w-[220px]">Name</th>
            <th className="py-4 px-4 min-w-[200px]">Target Path</th>
            <th className="py-4 px-4 min-w-[110px]">Type</th>
            <th className="py-4 px-4 min-w-[100px]">Content</th>
            <th className="py-4 px-4 min-w-[170px]">Storage</th>
            <th className="py-4 px-6 text-right min-w-[130px]">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#1E1E1E] text-xs">
          {items.map((item) => (
            <motion.tr
              key={item.id}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="hover:bg-[#1E1E1E]/40 transition-colors group"
            >
              {/* Name */}
              <td className="py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                    <FileSliders className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <span className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors truncate max-w-[180px]">
                    {item.name}
                  </span>
                </div>
              </td>

              {/* Target Path */}
              <td className="py-4 px-4">
                <span className="font-mono text-[11px] text-white/70 bg-[#1E1E1E] px-2.5 py-1 rounded-lg inline-block max-w-[180px] truncate">
                  {item.targetPath}
                </span>
              </td>

              {/* File Type */}
              <td className="py-4 px-4">
                <FileTypeBadge type={item.type} />
              </td>

              {/* Content mode */}
              <td className="py-4 px-4">
                <ContentBadge item={item} />
              </td>

              {/* Storage */}
              <td className="py-4 px-4">
                <StorageBadge storageType={item.storageLocation} />
              </td>

              {/* Actions */}
              <td className="py-4 px-6 text-right whitespace-nowrap">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(item)}
                    title="Edit"
                    className="h-8 w-8 rounded-xl border border-[#1E1E1E] bg-[#1E1E1E] text-white/70 hover:border-amber-400/50 hover:text-amber-400 hover:bg-amber-400/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDelete(item.id)}
                    title="Delete"
                    className="h-8 w-8 rounded-xl border border-[#1E1E1E] bg-[#1E1E1E] text-white/70 hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center shrink-0 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
