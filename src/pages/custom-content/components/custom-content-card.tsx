import { CustomContentItem } from "@/types";
import { ContentTypeBadge } from "@/components/common/content-type-icon";
import { StorageBadge } from "@/components/common/storage-badge";
import { ProviderIcon } from "@/components/common/provider-icon";
import { Plus, Copy, Check, Trash2, ExternalLink } from "lucide-react";
import { useState, MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import { usePack } from "@/context/pack-context";
import { motion } from "framer-motion";

export interface CustomContentCardProps {
  item: CustomContentItem;
  onDelete: (id: string) => void;
}

export function CustomContentCard({ item, onDelete }: CustomContentCardProps) {
  const { t } = useTranslation();
  const { addContent, installedContent } = usePack();
  const [copied, setCopied] = useState<boolean>(false);

  const isAdded = installedContent.some(i => i.id === item.id);

  const handleCopyUrl = (e: MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(item.downloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAdd = (e: MouseEvent) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-card border border-border hover:border-[#FE5000]/40 rounded-2xl p-5 flex flex-col justify-between gap-4 transition-all shadow-sm group hover:shadow-md relative overflow-hidden"
    >
      {/* Top Header info */}
      <div className="flex flex-col gap-2.5 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ContentTypeBadge type={item.contentType} />
            <StorageBadge storageType={item.storageLocation} showLabel={false} />
          </div>
          <ProviderIcon provider="custom" size="sm" />
        </div>

        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-foreground font-bold text-base truncate block w-full group-hover:text-[#FE5000] transition-colors">
            {item.name}
          </h3>
          <p className="text-xs text-muted-foreground truncate">
            By <span className="text-foreground font-semibold">{item.author || "Unknown"}</span>
          </p>
        </div>

        <div className="bg-muted/60 border border-border rounded-xl p-2.5 flex items-center justify-between gap-2 text-xs text-muted-foreground font-mono truncate">
          <span className="truncate">{item.downloadUrl}</span>
          <button
            onClick={handleCopyUrl}
            className="p-1 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors shrink-0"
            title="Copy URL"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
        <a
          href={item.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Open Link</span>
        </a>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onDelete(item.id)}
            className="p-2 rounded-xl text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
            title={t("common.delete")}
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <button
            onClick={handleToggleAdd}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer ${
              isAdded
                ? "bg-[#FE5000] text-white shadow-md shadow-[#FE5000]/20"
                : "bg-muted text-foreground hover:bg-[#FE5000] hover:text-white border border-border"
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
      </div>
    </motion.div>
  );
}
