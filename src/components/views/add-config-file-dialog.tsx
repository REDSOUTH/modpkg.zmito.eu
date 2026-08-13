import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileSliders, Pencil, Upload, Globe, Code2, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { FileTypeIcon } from "@/components/common/content-type-icon";
import {
  saveCustomFileItem,
  updateCustomFileItem,
  CUSTOM_FILE_TYPES,
  detectFileType,
  detectMonacoLanguage,
} from "@/lib/storage/config-files-storage";
import { CustomFileItem, CustomFileType, CustomStorageLocation } from "@/types";

export interface AddConfigFileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (item: CustomFileItem) => void;
  onUpdated?: (item: CustomFileItem) => void;
  editItem?: CustomFileItem | null;
  isLoggedIn?: boolean;
}

type ContentMode = "edit" | "upload" | "url";

const MODE_TABS: { id: ContentMode; label: string; icon: React.ReactNode }[] = [
  { id: "edit", label: "Edit", icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: "upload", label: "Upload", icon: <Upload className="w-3.5 h-3.5" /> },
  { id: "url", label: "URL", icon: <Globe className="w-3.5 h-3.5" /> },
];

export function AddConfigFileDialog({
  isOpen,
  onClose,
  onAdded,
  onUpdated,
  editItem,
  isLoggedIn = false,
}: AddConfigFileDialogProps) {
  const [name, setName] = useState("");
  const [targetPath, setTargetPath] = useState("/");
  const [type, setType] = useState<CustomFileType>("config");
  const [contentMode, setContentMode] = useState<ContentMode>("edit");
  const [content, setContent] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [saveToCloud, setSaveToCloud] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const monacoLang = detectMonacoLanguage(targetPath);

  // Reset form on open
  useEffect(() => {
    if (!isOpen) return;
    if (editItem) {
      setName(editItem.name);
      setTargetPath(editItem.targetPath);
      setType(editItem.type);
      setContent(editItem.content ?? "");
      setSourceUrl(editItem.sourceUrl ?? "");
      setSaveToCloud(editItem.storageLocation === "account_cloud");
      setContentMode(editItem.sourceUrl ? "url" : "edit");
      setUploadFileName(null);
    } else {
      setName("");
      setTargetPath("/");
      setType("config");
      setContentMode("edit");
      setContent("");
      setSourceUrl("");
      setSaveToCloud(false);
      setUploadFileName(null);
    }
  }, [isOpen, editItem]);

  // Auto-detect type from path extension
  const handlePathChange = (value: string) => {
    setTargetPath(value);
    const filename = value.split("/").pop() ?? "";
    if (filename.includes(".")) {
      setType(detectFileType(filename));
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFileName(file.name);
    if (!name) setName(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    // Auto-set target path from filename
    if (targetPath === "/" || targetPath === "") {
      setTargetPath(`/${file.name}`);
    }
    setType(detectFileType(file.name));
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setContent(text ?? "");
      setContentMode("edit");
    };
    reader.readAsText(file);
    // clear input to allow re-selecting same file
    e.target.value = "";
  };

  const isValid = !!name.trim() && !!targetPath.trim() &&
    (contentMode === "edit" ? !!content.trim() : contentMode === "url" ? !!sourceUrl.trim() : !!content.trim());

  const handleSave = () => {
    if (!isValid) return;
    const storageLocation: CustomStorageLocation = saveToCloud && isLoggedIn ? "account_cloud" : "local_browser";

    const payload = {
      name: name.trim(),
      targetPath: targetPath.trim() || "/",
      type,
      content: contentMode !== "url" ? content : undefined,
      sourceUrl: contentMode === "url" ? sourceUrl.trim() : undefined,
      storageLocation,
    };

    if (editItem) {
      const updated = updateCustomFileItem(editItem.id, payload);
      if (updated) onUpdated?.(updated);
    } else {
      const created = saveCustomFileItem(payload);
      onAdded?.(created);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="sm:max-w-4xl bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">

        {/* Header */}
        <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-4 shrink-0">
          {editItem ? (
            <Pencil className="w-8 h-8 text-amber-400 shrink-0" />
          ) : (
            <FileSliders className="w-8 h-8 text-amber-400 shrink-0" />
          )}
          <div className="flex flex-col text-left justify-center -mt-[2px]">
            <DialogTitle className="text-white text-lg font-bold leading-tight">
              {editItem ? "Edit Custom File" : "Add Custom File"}
            </DialogTitle>
            <p className="text-xs text-white/50 mt-0.5">
              {editItem
                ? "Modify this custom file's name, path and content"
                : "Add a reusable custom file to your library"}
            </p>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="max-h-[75vh] w-full">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Column */}
            <div className="flex flex-col gap-4">

              {/* Friendly Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Display Name
                </label>
                <Input
                  autoFocus={!editItem}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder='e.g. "My Graphics Settings"'
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-amber-400"
                />
              </div>

              {/* Target Path */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Target Path in Package
                </label>
                <Input
                  value={targetPath}
                  onChange={(e) => handlePathChange(e.target.value)}
                  placeholder="/options.txt"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl font-mono text-sm focus-visible:border-amber-400"
                />
                <p className="text-[11px] text-white/40">
                  Root-relative path where the file will be placed in the package (e.g. <span className="font-mono text-white/60">/config/options.txt</span>)
                </p>
              </div>

              {/* File Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">File Type</label>
                <Select value={type} onValueChange={(v) => setType(v as CustomFileType)}>
                  <SelectTrigger className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-amber-400 h-11 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileTypeIcon type={type} />
                      <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl">
                    {CUSTOM_FILE_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value} className="focus:bg-[#1E1E1E] focus:text-amber-400">
                        <div className="flex items-center gap-2">
                          <FileTypeIcon type={t.value} />
                          <span>{t.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Storage */}
              <div className="flex flex-col gap-2 mt-1">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Storage</label>
                <div className="flex flex-col gap-2">

                  {/* Local Storage */}
                  <div
                    onClick={() => setSaveToCloud(false)}
                    className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${
                      !saveToCloud
                        ? "bg-amber-400/10 border-amber-400/30"
                        : "bg-[#1E1E1E]/60 border-white/5 hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${!saveToCloud ? "border-amber-400 bg-amber-400" : "border-white/30"}`}>
                      {!saveToCloud && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Local Browser</span>
                      <span className="text-[11px] text-white/50">Saved in this browser only</span>
                    </div>
                  </div>

                  {/* REDSOUTH Account */}
                  <TooltipProvider delayDuration={150}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          onClick={() => { if (isLoggedIn) setSaveToCloud(true); }}
                          className={`flex items-center gap-3 p-3 border rounded-xl transition-colors ${
                            !isLoggedIn
                              ? "opacity-50 cursor-not-allowed bg-[#1E1E1E]/60 border-white/5"
                              : saveToCloud
                              ? "bg-[#FE5000]/10 border-[#FE5000]/30 cursor-pointer"
                              : "bg-[#1E1E1E]/60 border-white/5 cursor-pointer hover:bg-[#1E1E1E]"
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${saveToCloud && isLoggedIn ? "border-[#FE5000] bg-[#FE5000]" : "border-white/30"}`}>
                            {saveToCloud && isLoggedIn && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                          </div>
                          <div className="flex items-center gap-2.5">
                            <img src="/redsouth/logo-colored.svg" alt="REDSOUTH" className="w-4 h-4 object-contain shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-semibold text-white">REDSOUTH Account</span>
                              <span className="text-[11px] text-white/50">
                                {isLoggedIn ? "Sync across your devices" : "Sign in to sync across devices"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      {!isLoggedIn && (
                        <TooltipContent side="top" sideOffset={8} className="bg-[#1E1E1E] border border-white/10 text-white font-medium text-xs shadow-xl max-w-xs">
                          <p>Sign in to your REDSOUTH Account to sync config files across devices.</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                  </TooltipProvider>

                </div>
              </div>

            </div>

            {/* Right Column — Content */}
            <div className="flex flex-col gap-4 border-l border-[#1E1E1E] pl-0 md:pl-6">

              {/* Content Mode Tabs */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Content</label>

                {/* Mode toggle pills */}
                <div className="flex items-center gap-1.5 bg-[#1E1E1E]/60 p-1 rounded-xl w-fit">
                  {MODE_TABS.map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setContentMode(tab.id)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                        contentMode === tab.id
                          ? "bg-amber-400 text-black shadow-sm"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      {tab.icon}
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Edit mode — Monaco editor */}
                {contentMode === "edit" && (
                  <div className="rounded-xl overflow-hidden border border-[#1E1E1E] bg-[#1E1E1E]">
                    <Editor
                      height="340px"
                      language={monacoLang}
                      value={content}
                      onChange={(v) => setContent(v ?? "")}
                      theme="vs-dark"
                      options={{
                        fontSize: 12,
                        fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "line",
                        padding: { top: 8, bottom: 8 },
                        wordWrap: "on",
                        overviewRulerLanes: 0,
                        hideCursorInOverviewRuler: true,
                        scrollbar: { verticalScrollbarSize: 6, horizontalScrollbarSize: 6 },
                      }}
                    />
                  </div>
                )}

                {/* Upload mode */}
                {contentMode === "upload" && (
                  <div className="flex flex-col gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center justify-center gap-2 w-full h-36 rounded-xl border-2 border-dashed border-[#1E1E1E] hover:border-amber-400/50 bg-[#1E1E1E]/30 hover:bg-amber-400/5 transition-all cursor-pointer text-white/50 hover:text-amber-400"
                    >
                      <Upload className="w-6 h-6" />
                      <span className="text-xs font-semibold">Click to upload a file</span>
                      <span className="text-[11px]">Any text-based file</span>
                    </button>
                    {uploadFileName && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-amber-400/10 border border-amber-400/20 rounded-xl">
                        <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="text-xs text-white/80 font-mono truncate">{uploadFileName}</span>
                      </div>
                    )}
                    {content && (
                      <div className="rounded-xl overflow-hidden border border-[#1E1E1E]">
                        <Editor
                          height="200px"
                          language={monacoLang}
                          value={content}
                          onChange={(v) => setContent(v ?? "")}
                          theme="vs-dark"
                          options={{
                            fontSize: 12,
                            minimap: { enabled: false },
                            scrollBeyondLastLine: false,
                            lineNumbers: "on",
                            padding: { top: 8, bottom: 8 },
                            wordWrap: "on",
                            scrollbar: { verticalScrollbarSize: 6 },
                          }}
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* URL mode */}
                {contentMode === "url" && (
                  <div className="flex flex-col gap-2">
                    <Input
                      autoFocus
                      value={sourceUrl}
                      onChange={(e) => setSourceUrl(e.target.value)}
                      placeholder="https://example.com/options.txt"
                      className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl font-mono text-sm focus-visible:border-amber-400"
                    />
                    <p className="text-[11px] text-white/40">
                      The file will be downloaded from this URL when the package is exported or applied.
                    </p>
                    {sourceUrl && (
                      <a
                        href={sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 w-fit"
                      >
                        <Globe className="w-3 h-3" />
                        Open URL in new tab
                      </a>
                    )}
                  </div>
                )}

              </div>

            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-end gap-3 shrink-0">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11 border-0">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSave}
            disabled={!isValid}
            className="bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-5 h-11 font-semibold outline outline-2 outline-transparent hover:outline-amber-400/50 hover:outline-offset-2 active:scale-95 transition-all disabled:opacity-40"
          >
            {editItem ? "Update Custom File" : "Save Custom File"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
