import { useState, useEffect, useRef } from "react";
import { 
  FileSliders, 
  Code2, 
  Upload, 
  Globe, 
  Save, 
  RotateCcw, 
  Trash2, 
  ExternalLink, 
  Check, 
  Pencil, 
  Plus,
  Layers,
  FileCode,
  X
} from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { FileTypeIcon } from "@/components/common/content-type-icon";
import { StorageBadge } from "@/components/common/storage-badge";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { AddConfigFileDialog } from "@/components/views/add-config-file-dialog";
import { usePack } from "@/context/pack-context";
import { CustomFileItem, CustomFileType } from "@/types";
import { 
  CUSTOM_FILE_TYPES, 
  detectFileType, 
  detectMonacoLanguage 
} from "@/lib/storage/config-files-storage";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type ContentMode = "edit" | "upload" | "url";

const MODE_TABS: { id: ContentMode; label: string; icon: React.ReactNode }[] = [
  { id: "edit", label: "Edit", icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: "upload", label: "Upload", icon: <Upload className="w-3.5 h-3.5" /> },
  { id: "url", label: "URL", icon: <Globe className="w-3.5 h-3.5" /> },
];

const getUrlMediaType = (url: string, fileType?: CustomFileType): "image" | "video" | "audio" | "other" => {
  if (fileType === "multimedia") return "image";
  const clean = url.split("?")[0].toLowerCase();
  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(clean)) return "image";
  if (/\.(mp4|webm|ogv)$/i.test(clean)) return "video";
  if (/\.(mp3|wav|ogg)$/i.test(clean)) return "audio";
  return "other";
};

export interface CustomFilesWorkspaceProps {
  selectedFileId: string | null;
  onSelectFile: (id: string | null) => void;
  onOpenAddDialog: () => void;
}

export function CustomFilesWorkspace({
  selectedFileId,
  onSelectFile,
  onOpenAddDialog,
}: CustomFilesWorkspaceProps) {
  const { customFiles, updateCustomFile, removeCustomFile } = usePack();

  const file = customFiles.find((f) => f.id === selectedFileId) || null;

  // Local draft state
  const [draftName, setDraftName] = useState<string>("");
  const [draftTargetPath, setDraftTargetPath] = useState<string>("");
  const [draftType, setDraftType] = useState<CustomFileType>("config");
  const [draftContentMode, setDraftContentMode] = useState<ContentMode>("edit");
  const [draftContent, setDraftContent] = useState<string>("");
  const [draftSourceUrl, setDraftSourceUrl] = useState<string>("");
  const [isSavedRecently, setIsSavedRecently] = useState<boolean>(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState<boolean>(false);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync draft state whenever selected file changes
  useEffect(() => {
    if (file) {
      setDraftName(file.name);
      setDraftTargetPath(file.targetPath);
      setDraftType(file.type);
      setDraftContent(file.content ?? "");
      setDraftSourceUrl(file.sourceUrl ?? "");
      setDraftContentMode(file.sourceUrl ? "url" : "edit");
      setUploadFileName(null);
      setIsSavedRecently(false);
    } else {
      setDraftName("");
      setDraftTargetPath("");
      setDraftType("config");
      setDraftContent("");
      setDraftSourceUrl("");
      setDraftContentMode("edit");
      setUploadFileName(null);
      setIsSavedRecently(false);
    }
  }, [file?.id]);

  const monacoLang = detectMonacoLanguage(draftTargetPath);
  const mediaType = getUrlMediaType(draftSourceUrl, draftType);

  const isDirty = file
    ? draftName !== file.name ||
      draftTargetPath !== file.targetPath ||
      draftType !== file.type ||
      draftContent !== (file.content ?? "") ||
      draftSourceUrl !== (file.sourceUrl ?? "")
    : false;

  const handleSave = () => {
    if (!file) return;
    const updated: CustomFileItem = {
      ...file,
      name: draftName.trim() || file.name,
      targetPath: draftTargetPath.trim() || "/",
      type: draftType,
      content: draftContentMode !== "url" ? draftContent : undefined,
      sourceUrl: draftContentMode === "url" ? draftSourceUrl.trim() : undefined,
      updatedAt: new Date().toISOString(),
    };
    updateCustomFile(updated);
    setIsSavedRecently(true);
    setTimeout(() => setIsSavedRecently(false), 2000);
  };

  const handleReset = () => {
    if (file) {
      setDraftName(file.name);
      setDraftTargetPath(file.targetPath);
      setDraftType(file.type);
      setDraftContent(file.content ?? "");
      setDraftSourceUrl(file.sourceUrl ?? "");
      setDraftContentMode(file.sourceUrl ? "url" : "edit");
      setUploadFileName(null);
    }
  };

  const handleDelete = () => {
    if (file) {
      removeCustomFile(file.id);
      setIsConfirmDeleteOpen(false);
      onSelectFile(null);
    }
  };

  const handleUrlChange = (value: string) => {
    setDraftSourceUrl(value);
    const cleanUrl = value.trim().split("?")[0].split("#")[0];
    if (!cleanUrl) return;

    const segments = cleanUrl.split("/").filter(Boolean);
    const filename = segments[segments.length - 1];

    if (filename && filename.includes(".")) {
      const detected = detectFileType(filename);
      const isMedia = /\.(png|jpe?g|gif|webp|svg|ico|bmp|mp4|webm|ogv|mp3|wav|ogg)$/i.test(filename);
      const effectiveType = isMedia ? "multimedia" : detected;

      setDraftType(effectiveType);

      if (!draftName || draftName === "New File" || (file && draftName === file.name)) {
        setDraftName(filename);
      }
      if (!draftTargetPath || draftTargetPath === "/" || (file && draftTargetPath === file.targetPath)) {
        setDraftTargetPath(`/${filename}`);
      }
    }
  };

  // Drag & drop file upload
  const processFile = (f: File) => {
    setUploadFileName(f.name);
    if (!draftName) setDraftName(f.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    if (draftTargetPath === "/" || draftTargetPath === "") {
      const detected = detectFileType(f.name);
      setDraftType(detected);
      setDraftTargetPath(`config/${f.name}`);
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setDraftContent(text);
      setDraftContentMode("edit");
    };
    reader.readAsText(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) processFile(dropped);
  };

  // When no file is selected
  if (!file) {
    return (
      <div className="flex-1 min-w-0 bg-[#0A0A0A] flex flex-col items-center justify-center p-8 text-center min-h-[calc(100vh-121px)]">
        <Empty className="max-w-md">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="bg-amber-400/10 border border-amber-400/20 text-amber-400">
              <FileSliders className="w-7 h-7" />
            </EmptyMedia>
            <EmptyTitle className="text-white text-xl font-bold">
              {customFiles.length === 0 ? "No Custom Files in this Package" : "No Custom File Selected"}
            </EmptyTitle>
            <EmptyDescription className="text-white/50 text-xs">
              {customFiles.length === 0
                ? "Add configuration files, scripts, data, or multimedia overrides directly into your modpack package."
                : "Select a custom file from the sidebar to inspect and edit its content, or add a new one."}
            </EmptyDescription>
          </EmptyHeader>
          <Button
            onClick={onOpenAddDialog}
            className="bg-amber-400 text-black hover:bg-amber-300 rounded-xl px-5 h-11 font-semibold outline outline-2 outline-transparent hover:outline-amber-400/50 hover:outline-offset-2 active:scale-95 transition-all mt-4"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Custom File
          </Button>
        </Empty>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0 bg-[#0A0A0A] flex flex-col min-h-[calc(100vh-121px)] h-[calc(100vh-121px)] overflow-hidden">
      {/* Top Header Bar */}
      <div className="p-3.5 px-6 border-b border-[#1E1E1E] bg-[#0E0E0E] flex items-center justify-between gap-4 shrink-0 flex-wrap">
        {/* Left: Icon, Name and Target Path inputs (tightly together) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl bg-[#1E1E1E] border border-white/5 flex items-center justify-center shrink-0">
            <FileTypeIcon type={draftType} />
          </div>

          <div className="flex flex-col min-w-0 flex-1 max-w-md">
            <input
              type="text"
              value={draftName}
              onChange={(e) => setDraftName(e.target.value)}
              placeholder="File name"
              className="bg-transparent text-white font-bold text-sm leading-tight focus:bg-[#1E1E1E] px-1.5 py-0.5 rounded-md border border-transparent focus:border-amber-400/50 focus:outline-none transition-all truncate"
            />
            <input
              type="text"
              value={draftTargetPath}
              onChange={(e) => {
                setDraftTargetPath(e.target.value);
                const filename = e.target.value.split("/").pop() ?? "";
                if (filename.includes(".")) {
                  const detected = detectFileType(filename);
                  setDraftType(detected);
                }
              }}
              placeholder="/config/options.txt"
              className="bg-transparent text-white/45 font-mono text-[11px] leading-tight focus:bg-[#1E1E1E] px-1.5 py-0.5 rounded-md border border-transparent focus:border-amber-400/50 focus:outline-none transition-all w-80 truncate"
            />
          </div>
        </div>

        {/* Right: Content Mode Tabs, Storage Badge & Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Content Mode Tabs */}
          {draftType === "multimedia" ? (
            <div className="flex items-center gap-1.5 bg-[#1E1E1E]/60 p-1 rounded-xl">
              <span className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-amber-400 text-black shadow-sm">
                <Globe className="w-3.5 h-3.5" />
                URL
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-[#1E1E1E]/60 p-1 rounded-xl border border-white/5">
              {MODE_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setDraftContentMode(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all cursor-pointer",
                    draftContentMode === tab.id
                      ? "bg-amber-400 text-black shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  )}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="h-4 w-px bg-white/10 mx-1" />

          <StorageBadge storageType={file.storageLocation} />

          <div className="h-4 w-px bg-white/10 mx-1" />

          {isDirty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl text-xs h-9 px-3 gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSave}
            disabled={!isDirty && !isSavedRecently}
            className={cn(
              "rounded-xl text-xs font-semibold h-9 px-4 gap-1.5 transition-all cursor-pointer",
              isSavedRecently
                ? "bg-emerald-500 text-white"
                : "bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-40"
            )}
          >
            {isSavedRecently ? (
              <>
                <Check className="w-3.5 h-3.5" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </>
            )}
          </Button>

          <TooltipProvider delayDuration={150}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="h-9 w-9 rounded-xl text-white/60 hover:text-white hover:bg-[#1E1E1E] cursor-pointer"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1E1E1E] text-white text-xs border border-[#333]">
                Edit Full Details
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  className="h-9 w-9 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1E1E1E] text-white text-xs border border-[#333]">
                Delete Custom File
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSelectFile(null)}
                  className="h-9 w-9 rounded-xl text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-[#1E1E1E] text-white text-xs border border-[#333]">
                Close File
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Editor Main Content Area */}
      <div className="flex-1 min-h-0 relative flex flex-col overflow-hidden bg-[#0A0A0A]">
        {/* EDIT MODE: Monaco Code Editor */}
        {draftContentMode === "edit" && draftType !== "multimedia" && (
          <div className="flex-1 w-full h-full">
            <Editor
              height="100%"
              language={monacoLang}
              value={draftContent}
              onChange={(v) => setDraftContent(v ?? "")}
              theme="vs-dark"
              options={{
                automaticLayout: true,
                fontSize: 13,
                tabSize: 2,
                fontFamily: "'JetBrains Mono', 'Cascadia Code', Consolas, monospace",
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                lineNumbers: "on",
                renderLineHighlight: "all",
                padding: { top: 8, bottom: 8 },
                wordWrap: "on",
                scrollbar: { verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
              }}
            />
          </div>
        )}

        {/* UPLOAD MODE */}
        {draftContentMode === "upload" && draftType !== "multimedia" && (
          <div className="flex-1 p-6 flex flex-col gap-4 overflow-y-auto custom-scrollbar">
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.json,.yaml,.yml,.toml,.ini,.properties,.cfg,.conf,.log,.md,.js,.ts,.html,.css,.java,.py,.sh,.cmd,.bat,.mcmeta,.nbt"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) processFile(f);
              }}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                "flex flex-col items-center justify-center gap-3 w-full h-44 rounded-2xl border-2 border-dashed transition-all cursor-pointer select-none",
                isDragging
                  ? "border-amber-400 bg-amber-400/10 text-amber-400 scale-[0.99]"
                  : "border-[#1E1E1E] hover:border-amber-400/50 bg-[#121212] hover:bg-amber-400/5 text-white/50 hover:text-amber-400"
              )}
            >
              <Upload className={cn("w-8 h-8", isDragging && "animate-bounce")} />
              <div className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-white/80">
                  {isDragging ? "Drop file to upload" : "Click or drag & drop to replace file content"}
                </span>
                <span className="text-xs text-white/40">JSON, YAML, TOML, TXT, Config, Scripts, etc.</span>
              </div>
            </button>

            {uploadFileName && (
              <div className="flex items-center gap-2 px-4 py-2.5 bg-amber-400/10 border border-amber-400/20 rounded-xl w-fit">
                <Check className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-xs text-white/90 font-mono">{uploadFileName}</span>
              </div>
            )}

            {draftContent && (
              <div className="flex-1 min-h-[360px] rounded-2xl overflow-hidden border border-[#1E1E1E] bg-[#121212]">
                <Editor
                  height="360px"
                  language={monacoLang}
                  value={draftContent}
                  onChange={(v) => setDraftContent(v ?? "")}
                  theme="vs-dark"
                  options={{
                    automaticLayout: true,
                    fontSize: 12,
                    tabSize: 2,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: "on",
                    padding: { top: 8, bottom: 8 },
                    wordWrap: "on",
                  }}
                />
              </div>
            )}
          </div>
        )}

        {/* URL MODE */}
        {(draftContentMode === "url" || draftType === "multimedia") && (
          <div className="flex-1 p-6 flex flex-col gap-6 max-w-4xl overflow-y-auto custom-scrollbar">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                Direct File URL
              </label>
              <Input
                value={draftSourceUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="https://example.com/asset.png or https://example.com/config.json"
                className="bg-[#141414] border-[#1E1E1E] text-white h-11 rounded-xl font-mono text-sm focus-visible:border-amber-400"
              />
              <p className="text-xs text-white/40">
                Direct downloadable asset URL. Images, audio, and videos will render with preview players below.
              </p>
            </div>

            {draftSourceUrl.trim() && (
              <div className="flex flex-col gap-4">
                <a
                  href={draftSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1.5 w-fit font-semibold"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Open source URL in new tab
                </a>

                {/* Media Preview */}
                {mediaType === "image" && (
                  <div className="flex flex-col gap-2 p-5 bg-[#121212] border border-[#1E1E1E] rounded-2xl">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Image Preview
                    </span>
                    <div className="flex items-center justify-center p-4 bg-black/60 rounded-xl overflow-hidden border border-white/5 min-h-[260px]">
                      <img
                        src={draftSourceUrl}
                        alt="Media Preview"
                        className="max-h-96 object-contain rounded-lg shadow-xl"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  </div>
                )}

                {mediaType === "video" && (
                  <div className="flex flex-col gap-2 p-5 bg-[#121212] border border-[#1E1E1E] rounded-2xl">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Video Preview
                    </span>
                    <div className="flex items-center justify-center p-4 bg-black/60 rounded-xl overflow-hidden border border-white/5">
                      <video src={draftSourceUrl} controls className="max-h-96 w-full rounded-lg shadow-xl" />
                    </div>
                  </div>
                )}

                {mediaType === "audio" && (
                  <div className="flex flex-col gap-2 p-5 bg-[#121212] border border-[#1E1E1E] rounded-2xl">
                    <span className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                      Audio Player
                    </span>
                    <div className="p-4 bg-black/60 rounded-xl border border-white/5">
                      <audio src={draftSourceUrl} controls className="w-full" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Full Edit Modal Dialog */}
      {isEditDialogOpen && (
        <AddConfigFileDialog
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          editItem={file}
          context="editor"
          onUpdated={(updated) => {
            updateCustomFile(updated);
            setIsEditDialogOpen(false);
          }}
          onDeleted={() => {
            removeCustomFile(file.id);
            setIsEditDialogOpen(false);
            onSelectFile(null);
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Custom File"
        itemName={file.name}
      />
    </div>
  );
}
