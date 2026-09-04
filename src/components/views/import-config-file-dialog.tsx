import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSliders, Download, Search, Check, Folder, X } from "lucide-react";
import { useState, useEffect } from "react";
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

const TYPE_FILTERS: { id: string; label: string }[] = [
  { id: "all", label: "All" },
  { id: "config", label: "Config" },
  { id: "script", label: "Script" },
  { id: "data", label: "Data" },
  { id: "multimedia", label: "Multimedia" },
  { id: "other", label: "Other" },
];

export function ImportConfigFileDialog({ isOpen, onClose, onImport }: ImportConfigFileDialogProps) {
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
      <DialogContent hideClose className="w-[95vw] max-w-xl bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">

        {/* Dialog Header */}
        <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-3.5 shrink-0 space-y-0">
          <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center shrink-0">
            <Download className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex flex-col text-left justify-center min-w-0 flex-1">
            <DialogTitle className="text-white text-base font-bold leading-tight">
              Import Custom File
            </DialogTitle>
            <p className="text-xs text-white/50 mt-0.5">
              Choose a custom file or asset from your My Resources library
            </p>
          </div>
        </DialogHeader>

        {/* Search & Type Filters */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1E1E1E] flex flex-col gap-3 shrink-0 bg-[#0E0E0E]">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search custom files by name or path..."
              className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-10 rounded-xl pl-9 pr-8 text-xs focus-visible:border-amber-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-white/40 hover:text-white transition-colors"
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
                    : "text-white/60 hover:text-white bg-[#1E1E1E] hover:bg-white/10"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Files List */}
        <ScrollArea className="max-h-[320px] w-full [&>div>div]:!block [&>div]:!block">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-white/40 px-6 text-center">
              {items.length === 0 ? (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-[#1E1E1E] flex items-center justify-center text-white/30 mb-1">
                    <FileSliders className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-semibold text-white/70">No custom files in library</span>
                  <span className="text-xs text-white/40 max-w-xs">
                    You haven't saved any custom files in My Resources yet.
                  </span>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-xl bg-[#1E1E1E] flex items-center justify-center text-white/30 mb-1">
                    <Search className="w-5 h-5" />
                  </div>
                  <span className="text-sm font-semibold text-white/70">No files found</span>
                  <span className="text-xs text-white/40">
                    No files match your search or selected filter.
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
                        : "bg-[#141414] border-[#1E1E1E] hover:bg-[#1A1A1A] hover:border-white/10"
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
                      <span className="text-sm font-semibold text-white truncate leading-tight" title={item.name}>
                        {item.name}
                      </span>
                      <span className="text-xs font-mono text-white/50 truncate flex items-center gap-1.5 mt-1" title={item.targetPath}>
                        <Folder className="w-3 h-3 text-white/30 shrink-0" />
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
                        {itemType}
                      </span>

                      <StorageBadge storageType={item.storageLocation} />

                      {/* Selection Radio Indicator */}
                      <div
                        className={cn(
                          "w-5 h-5 rounded-full border flex items-center justify-center transition-all ml-1 shrink-0",
                          isSelected
                            ? "border-amber-400 bg-amber-400 text-black"
                            : "border-white/20 bg-transparent text-transparent"
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
          <div className="px-5 py-4 border-t border-[#1E1E1E] shrink-0 bg-[#0E0E0E] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-white/60 uppercase tracking-wider block">
                Destination Path in Package
              </label>
              {overridePath !== selected.targetPath && (
                <button
                  type="button"
                  onClick={() => setOverridePath(selected.targetPath)}
                  className="text-[11px] text-amber-400 hover:underline cursor-pointer"
                >
                  Reset ({selected.targetPath})
                </button>
              )}
            </div>
            <Input
              value={overridePath}
              onChange={(e) => setOverridePath(e.target.value)}
              placeholder={selected.targetPath}
              className="bg-[#181818] border-[#2A2A2A] text-white h-10 rounded-xl font-mono text-xs focus-visible:border-amber-400"
            />
            <p className="text-[11px] text-white/40">
              The imported file will be placed at this relative path inside your modpack package.
            </p>
          </div>
        )}

        {/* Dialog Footer */}
        <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-end gap-3 shrink-0">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-10 border-0 cursor-pointer">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={!selected}
            className="bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-5 h-10 font-semibold active:scale-95 transition-all disabled:opacity-40 cursor-pointer shadow-none"
          >
            <Download className="w-4 h-4 mr-2" />
            Import to Package
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
