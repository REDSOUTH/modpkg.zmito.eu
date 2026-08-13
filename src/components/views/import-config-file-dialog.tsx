import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSliders, Download, Search, Code2, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { getCustomFileItems } from "@/lib/storage/config-files-storage";
import { CustomFileItem } from "@/types";

export interface ImportConfigFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (item: CustomFileItem, overridePath: string) => void;
}

export function ImportConfigFileDialog({ isOpen, onClose, onImport }: ImportConfigFileDialogProps) {
  const [items, setItems] = useState<CustomFileItem[]>([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<CustomFileItem | null>(null);
  const [overridePath, setOverridePath] = useState("");

  useEffect(() => {
    if (isOpen) {
      setItems(getCustomFileItems());
      setSearch("");
      setSelected(null);
      setOverridePath("");
    }
  }, [isOpen]);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.targetPath.toLowerCase().includes(search.toLowerCase())
  );

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
      <DialogContent hideClose className="sm:max-w-lg bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">

        {/* Header */}
        <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-4 shrink-0">
          <Download className="w-7 h-7 text-amber-400 shrink-0" />
          <div className="flex flex-col text-left -mt-[2px]">
            <DialogTitle className="text-white text-base font-bold leading-tight">Import Custom File</DialogTitle>
            <p className="text-xs text-white/50 mt-0.5">Choose from your Custom Files library</p>
          </div>
        </DialogHeader>

        {/* Search */}
        <div className="px-5 pt-4 pb-3 border-b border-[#1E1E1E] shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <Input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search custom files..."
              className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-9 rounded-xl pl-9 text-sm focus-visible:border-amber-400"
            />
          </div>
        </div>

        {/* List */}
        <ScrollArea className="max-h-64 w-full">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 text-white/40">
              <FileSliders className="w-8 h-8" />
              <span className="text-sm">
                {items.length === 0 ? "No custom files saved yet" : "No matches found"}
              </span>
            </div>
          ) : (
            <div className="p-3 flex flex-col gap-1">
              {filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelect(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                    selected?.id === item.id
                      ? "bg-amber-400/15 border border-amber-400/30"
                      : "border border-transparent hover:bg-[#1E1E1E] hover:border-white/5"
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-400/10 flex items-center justify-center shrink-0">
                    <FileSliders className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-white truncate">{item.name}</span>
                    <span className="text-[11px] font-mono text-white/50 truncate">{item.targetPath}</span>
                  </div>
                  <div className="ml-auto shrink-0">
                    {item.sourceUrl ? (
                      <Globe className="w-3.5 h-3.5 text-amber-400/60" />
                    ) : (
                      <Code2 className="w-3.5 h-3.5 text-white/30" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Path override (shown when something is selected) */}
        {selected && (
          <div className="px-5 py-4 border-t border-[#1E1E1E] shrink-0">
            <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-1.5 block">
              Target Path in Package
            </label>
            <Input
              value={overridePath}
              onChange={(e) => setOverridePath(e.target.value)}
              placeholder={selected.targetPath}
              className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-9 rounded-xl font-mono text-sm focus-visible:border-amber-400"
            />
            <p className="text-[11px] text-white/40 mt-1">
              Override the default path for this package. Leave as-is to use the default.
            </p>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-end gap-3 shrink-0">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-10 border-0">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleImport}
            disabled={!selected}
            className="bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-5 h-10 font-semibold active:scale-95 transition-all disabled:opacity-40"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Import to Package
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
