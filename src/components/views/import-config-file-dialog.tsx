import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSliders, Download, Search, Check, Folder, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getCustomFileItems, detectFileType } from "@/lib/storage/config-files-storage";
import { CustomFileItem } from "@/types";
import { FileTypeIcon } from "@/components/common/content-type-icon";
import { StorageBadge } from "@/components/common/storage-badge";
import { cn } from "@/lib/utils";

export interface ImportConfigFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (item: CustomFileItem, overridePath: string) => void;
}

const TYPE_FILTERS: { id: string; labelKey: string }[] = [
  { id: "all", labelKey: "myResources.types.all" },
  { id: "config", labelKey: "myResources.types.config" },
  { id: "script", labelKey: "myResources.types.script" },
  { id: "data", labelKey: "myResources.types.data" },
  { id: "multimedia", labelKey: "myResources.types.multimedia" },
  { id: "other", labelKey: "myResources.types.other" },
];

export function ImportConfigFileDialog({ isOpen, onClose, onImport }: ImportConfigFileDialogProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<CustomFileItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selected, setSelected] = useState<CustomFileItem | null>(null);
  const [overridePath, setOverridePath] = useState("");

  useEffect(() => {
    if (isOpen) {
      setItems(getCustomFileItems());
      setSearch("");
      setTypeFilter("all");
      setSelected(null);
      setOverridePath("");
    }
  }, [isOpen]);

  const filtered = items.filter((item) => {
    const itemType = item.type || detectFileType(item.name);
    if (typeFilter !== "all" && itemType !== typeFilter) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.targetPath.toLowerCase().includes(q)
    );
  });

  const handleSelect = (item: CustomFileItem) => {
    setSelected(item);
    setOverridePath(item.targetPath);
  };

  const handleImport = () => {
    if (!selected) return;
    onImport(selected, overridePath || selected.targetPath);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="dialog-accent-amber w-[95vw] max-w-xl bg-card border border-border p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl text-foreground">

        {/* Dialog Header */}
        <DialogHeader className="p-5 px-6 border-b border-border flex flex-row items-center justify-between shrink-0 space-y-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex flex-col text-left justify-center min-w-0">
              <DialogTitle className="text-foreground text-base font-bold leading-tight">
                {t("importConfigFile.title")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {t("importConfigFile.subtitle")}
              </p>
            </div>
          </div>
          <DialogClose asChild>
            <button
              type="button"
              onClick={onClose}
              title={t("common.close")}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>

        {/* Search & Type Filters */}
        <div className="px-5 pt-4 pb-3 border-b border-border flex flex-col gap-3 shrink-0 bg-muted/40">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("importConfigFile.searchPlaceholder")}
              className="bg-muted/70 border-border text-foreground h-10 rounded-xl pl-9 pr-8 text-xs focus-visible:border-amber-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-scrollbar">
            {TYPE_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id)}
                className={cn(
                  "text-xs font-semibold px-3 py-1.5 rounded-lg transition-all whitespace-nowrap cursor-pointer select-none",
                  typeFilter === f.id
                    ? "bg-amber-400 text-black shadow-sm"
                    : "text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80"
                )}
              >
                {t(f.labelKey)}
              </button>
            ))}
          </div>
        </div>

        {/* Files List */}
        <ScrollArea className="max-h-[320px] w-full [&>div>div]:!block [&>div]:!block">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-muted-foreground px-6 text-center">
              {items.length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground mb-1">
                    <FileSliders className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {t("importConfigFile.emptyLibraryTitle")}
                  </span>
                  <span className="text-xs text-muted-foreground max-w-xs">
                    {t("importConfigFile.emptyLibraryDesc")}
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground mb-1">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-foreground">
                    {t("importConfigFile.noFilesTitle")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t("importConfigFile.noFilesDesc")}
                  </span>
                </>
              )}
            </div>
          ) : (
            <div className="p-3.5 flex flex-col gap-2">
              {filtered.map((item) => {
                const itemType = item.type || detectFileType(item.name);
                const isSelected = selected?.id === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={cn(
                      "w-full flex items-center gap-3.5 p-3 rounded-xl text-left transition-all cursor-pointer select-none border",
                      isSelected
                        ? "bg-amber-400/10 border-amber-400 shadow-md shadow-amber-400/5"
                        : "bg-card border-border hover:bg-muted/60"
                    )}
                  >
                    {/* Distinctive File Type Icon Container */}
                    <div
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border",
                        itemType === "config" && "bg-blue-500/10 border-blue-500/20 text-blue-400",
                        itemType === "script" && "bg-purple-500/10 border-purple-500/20 text-purple-400",
                        itemType === "data" && "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
                        itemType === "multimedia" && "bg-pink-500/10 border-pink-500/20 text-pink-400",
                        itemType === "other" && "bg-amber-400/10 border-amber-400/20 text-amber-400"
                      )}
                    >
                      <FileTypeIcon type={itemType} iconClassName="w-4 h-4" />
                    </div>

                    {/* File Name and Target Path */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-semibold text-foreground truncate leading-tight" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground truncate flex items-center gap-1.5 mt-1" title={item.targetPath}>
                        <Folder className="w-3 h-3 text-muted-foreground shrink-0" />
                        <span className="truncate">{item.targetPath}</span>
                      </span>
                    </div>

                    {/* Right Metadata: Type Tag + Storage Badge + Radio Selection */}
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider",
                          itemType === "config" && "bg-blue-500/15 text-blue-400 border border-blue-500/25",
                          itemType === "script" && "bg-purple-500/15 text-purple-400 border border-purple-500/25",
                          itemType === "data" && "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25",
                          itemType === "multimedia" && "bg-pink-500/15 text-pink-400 border border-pink-500/25",
                          itemType === "other" && "bg-amber-400/15 text-amber-400 border border-amber-400/25"
                        )}
                      >
                        {t(`myResources.types.${itemType}`, { defaultValue: itemType })}
                      </span>

                      <StorageBadge storageType={item.storageLocation} />

                      {/* Selection Radio Indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all ml-1 shrink-0",
                          isSelected
                            ? "border-amber-400 bg-amber-400 text-black"
                            : "border-border bg-transparent text-transparent"
                        )}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Path Override Section (shown when a file is selected) */}
        {selected && (
          <div className="px-5 py-4 border-t border-border shrink-0 bg-muted/40 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                {t("importConfigFile.destinationPath")}
              </label>
              {overridePath !== selected.targetPath && (
                <button
                  type="button"
                  onClick={() => setOverridePath(selected.targetPath)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  {t("importConfigFile.resetPath", { path: selected.targetPath })}
                </button>
              )}
            </div>
            <Input
              value={overridePath}
              onChange={(e) => setOverridePath(e.target.value)}
              placeholder={selected.targetPath}
              className="bg-muted/70 border-border text-foreground h-10 rounded-xl font-mono text-xs focus-visible:border-amber-400"
            />
            <p className="text-[11px] text-muted-foreground">
              {t("importConfigFile.destinationPathDesc")}
            </p>
          </div>
        )}

        {/* Dialog Footer */}
        <DialogFooter className="p-4 px-6 border-t border-border bg-card flex sm:justify-end gap-3 shrink-0">
          <Button
            onClick={handleImport}
            disabled={!selected}
            className="bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-6 h-10 font-semibold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-none"
          >
            <Download className="w-4 h-4 mr-2" />
            {t("importConfigFile.importBtn")}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
