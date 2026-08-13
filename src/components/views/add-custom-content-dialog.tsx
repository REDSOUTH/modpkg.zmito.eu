import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { CustomStorageType } from "@/components/common/storage-badge";
import { PlusCircle, Pencil, Check, Sparkles, Package, Globe } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { saveCustomContentItem, updateCustomContentItem } from "@/lib/storage/custom-content-storage";
import { CustomContentItem } from "@/types";
import { usePack } from "@/context/pack-context";

export interface AddCustomContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (newItem: CustomContentItem) => void;
  onUpdated?: (updatedItem: CustomContentItem) => void;
  editItem?: CustomContentItem | null;
  isLoggedIn?: boolean;
  defaultAddToPackage?: boolean;
  defaultSaveAsCommon?: boolean;
}

export const sanitizeLinuxPath = (str: string): string => {
  return str
    .replace(/\\/g, "/")
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9/._-]/g, "")
    .replace(/\/+/g, "/");
};

const extractFilename = (url: string): string => {
  if (!url) return "options.txt";
  const cleanUrl = url.split("?")[0];
  const lastSegment = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
  return lastSegment && lastSegment.includes(".") ? lastSegment : "options.txt";
};

export function AddCustomContentDialog({ 
  isOpen, 
  onClose, 
  onAdded, 
  onUpdated,
  editItem,
  isLoggedIn = false,
  defaultAddToPackage = false,
  defaultSaveAsCommon = true,
}: AddCustomContentDialogProps) {
  const { packSettings, getMinecraftVersions, getLoaders, addContent } = usePack();

  const [name, setName] = useState<string>("");
  const [downloadUrl, setDownloadUrl] = useState<string>("");
  const [contentType, setContentType] = useState<string>("mod");
  const [author, setAuthor] = useState<string>("");
  const [selectedLoaders, setSelectedLoaders] = useState<string[]>(["Any"]);
  const [selectedMcVersions, setSelectedMcVersions] = useState<string[]>(["Any"]);
  
  const [showAllMcVersions, setShowAllMcVersions] = useState<boolean>(false);
  const [showAllLoaders, setShowAllLoaders] = useState<boolean>(false);

  const [targetPath, setTargetPath] = useState<string>("config/options.txt");
  const [addToPackage, setAddToPackage] = useState<boolean>(defaultAddToPackage);
  const [saveAsCommon, setSaveAsCommon] = useState<boolean>(defaultSaveAsCommon);
  const [saveToCloud, setSaveToCloud] = useState<boolean>(false);
  const [detectedTypeNote, setDetectedTypeNote] = useState<string | null>(null);

  const mcVersionsList = getMinecraftVersions(showAllMcVersions);
  const loadersList = getLoaders(showAllLoaders);

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name);
        setDownloadUrl(editItem.downloadUrl);
        setContentType(editItem.contentType);
        setAuthor(editItem.author || "");
        
        const l = editItem.loader ? editItem.loader.split(", ").map(s => s.trim()) : ["Any"];
        setSelectedLoaders(l);

        const v = editItem.mcVersion ? editItem.mcVersion.split(", ").map(s => s.trim()) : ["Any"];
        setSelectedMcVersions(v);

        setTargetPath(editItem.targetPath || "config/options.txt");
        setSaveToCloud(editItem.storageLocation === "account_cloud");
        setAddToPackage(false);
        setSaveAsCommon(true);
        setDetectedTypeNote(null);
      } else {
        setName("");
        setDownloadUrl("");
        setContentType("mod");
        setAuthor("");
        setSelectedLoaders(["Any"]);
        setSelectedMcVersions([packSettings.mcVersion || "1.20.1"]);
        setShowAllMcVersions(false);
        setShowAllLoaders(false);
        setTargetPath("config/options.txt");
        setSaveToCloud(isLoggedIn);
        setAddToPackage(defaultAddToPackage);
        setSaveAsCommon(defaultSaveAsCommon);
        setDetectedTypeNote(null);
      }
    }
  }, [isOpen, editItem, packSettings, isLoggedIn, defaultAddToPackage, defaultSaveAsCommon]);

  const handleTypeChange = (type: string) => {
    setContentType(type);
    if (type === "override" && !targetPath) {
      const filename = extractFilename(downloadUrl);
      setTargetPath(sanitizeLinuxPath(`config/${filename}`));
    }
  };

  const toggleLoader = (loaderName: string) => {
    if (loaderName === "Any") {
      setSelectedLoaders(["Any"]);
      return;
    }

    let next = selectedLoaders.filter(l => l !== "Any");
    if (next.includes(loaderName)) {
      next = next.filter(l => l !== loaderName);
    } else {
      next.push(loaderName);
    }

    if (next.length === 0) {
      setSelectedLoaders(["Any"]);
    } else {
      setSelectedLoaders(next);
    }
  };

  const toggleAllLoaders = () => {
    setSelectedLoaders(["Any"]);
  };

  const toggleMcVersion = (ver: string) => {
    if (ver === "Any") {
      setSelectedMcVersions(["Any"]);
      return;
    }

    let next = selectedMcVersions.filter(v => v !== "Any");
    if (next.includes(ver)) {
      next = next.filter(v => v !== ver);
    } else {
      next.push(ver);
    }

    if (next.length === 0) {
      setSelectedMcVersions(["Any"]);
    } else {
      setSelectedMcVersions(next);
    }
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setDownloadUrl(url);

    if (url) {
      const filename = url.substring(url.lastIndexOf("/") + 1).split("?")[0];
      if (filename && !name) {
        const cleanName = filename.replace(/\.(jar|zip|json|nbt|cfg|txt)$/i, "").replace(/[-_]/g, " ");
        setName(cleanName);
      }

      if (contentType === "override" && filename) {
        setTargetPath(sanitizeLinuxPath(`config/${filename}`));
      }

      if (!editItem) {
        if (url.toLowerCase().endsWith(".jar")) {
          handleTypeChange("mod");
          setDetectedTypeNote("Auto-detected as Mod");
        } else if (url.toLowerCase().includes("shader") || url.toLowerCase().includes("complementary")) {
          handleTypeChange("shader");
          setDetectedTypeNote("Auto-detected as Shader");
        } else if (url.toLowerCase().includes("texture") || url.toLowerCase().includes("resourcepack") || url.toLowerCase().endsWith(".zip")) {
          handleTypeChange("resourcepack");
          setDetectedTypeNote("Auto-detected as Resourcepack");
        } else {
          setDetectedTypeNote(null);
        }
      }
    } else {
      setDetectedTypeNote(null);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !downloadUrl.trim()) return;

    const storageLocation: CustomStorageType = (saveToCloud && isLoggedIn) ? "account_cloud" : "local_browser";

    const payload = {
      name: name.trim(),
      downloadUrl: downloadUrl.trim(),
      contentType,
      author: author.trim() || "Unknown",
      mcVersion: selectedMcVersions.join(", "),
      loader: selectedLoaders.join(", "),
      targetPath: contentType === "override" ? sanitizeLinuxPath(targetPath.trim()) : undefined,
      storageLocation,
    };

    let targetItem: CustomContentItem;

    if (editItem) {
      const updated = updateCustomContentItem(editItem.id, payload);
      targetItem = updated || { ...editItem, ...payload };
      if (updated) onUpdated?.(updated);
    } else {
      targetItem = saveCustomContentItem(payload);
      onAdded?.(targetItem);
    }

    // Add to active package if checked
    if (addToPackage) {
      addContent({
        id: targetItem.id,
        name: targetItem.name,
        provider: "custom",
        iconUrl: "",
        versionId: "custom",
        versionName: "Custom URL",
        contentType: targetItem.contentType,
      });
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="sm:max-w-4xl bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">
        
        {/* Header */}
        <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-4 shrink-0">
          {editItem ? (
            <Pencil className="w-8 h-8 text-blue-400 shrink-0" />
          ) : (
            <PlusCircle className="w-8 h-8 text-blue-400 shrink-0" />
          )}
          <div className="flex flex-col text-left justify-center -mt-[2px]">
            <DialogTitle className="text-white text-lg font-bold leading-tight">
              {editItem ? "Edit Custom Content" : "Add Custom Content"}
            </DialogTitle>
            <p className="text-xs text-white/50 mt-0.5">
              {editItem ? "Modify custom content properties and compatibility settings" : "Register a custom provider download URL or local file override"}
            </p>
          </div>
        </DialogHeader>

        {/* Scrollable Content Body with Radix ScrollArea */}
        <ScrollArea className="max-h-[75vh] w-full">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Resource Details */}
            <div className="flex flex-col gap-4">
              
              {/* Download URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Download URL / Direct Link
                </label>
                <Input 
                  autoFocus={!editItem}
                  value={downloadUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/file.jar"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-blue-500"
                />
                {detectedTypeNote && (
                  <span className="text-[11px] text-blue-400 flex items-center gap-1 mt-0.5">
                    <Sparkles className="w-3 h-3" />
                    {detectedTypeNote}
                  </span>
                )}
              </div>

              {/* Resource Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Resource Name</label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Custom OptiFine"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-blue-500"
                />
              </div>

              {/* Content Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">Content Type</label>
                <Select value={contentType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-blue-500 h-11 rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl">
                    <SelectItem value="mod" className="focus:bg-[#1E1E1E] focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="mod" />
                        <span>Mod</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="resourcepack" className="focus:bg-[#1E1E1E] focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="resourcepack" />
                        <span>Resourcepack</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="shader" className="focus:bg-[#1E1E1E] focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="shader" />
                        <span>Shader</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="datapack" className="focus:bg-[#1E1E1E] focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="datapack" />
                        <span>Datapack</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="world" className="focus:bg-[#1E1E1E] focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="world" />
                        <span>World</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                  Author (Optional)
                </label>
                <Input 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. sp614x"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-blue-500"
                />
              </div>

              {/* Destination Options */}
              <div className="flex flex-col gap-2.5 mt-2">
                
                {/* Add to Active Package Checkbox */}
                <div 
                  onClick={() => setAddToPackage(!addToPackage)}
                  className="flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl cursor-pointer hover:bg-[#1E1E1E] transition-colors"
                >
                  <Checkbox
                    checked={addToPackage}
                    onCheckedChange={(checked) => setAddToPackage(!!checked)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-white/20"
                  />
                  <div className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Add directly to current package</span>
                      <span className="text-[11px] text-white/50">Install to active modpack version list</span>
                    </div>
                  </div>
                </div>

                {/* Save in Custom Content Checkbox */}
                <div 
                  onClick={() => setSaveAsCommon(!saveAsCommon)}
                  className="flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl cursor-pointer hover:bg-[#1E1E1E] transition-colors"
                >
                  <Checkbox
                    checked={saveAsCommon}
                    onCheckedChange={(checked) => setSaveAsCommon(!!checked)}
                    className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-white/20"
                  />
                  <div className="flex items-center gap-2.5">
                    <PlusCircle className="w-4 h-4 text-blue-400 shrink-0" />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">Save in Custom Content</span>
                      <span className="text-[11px] text-white/50">Make accessible across all your modpacks</span>
                    </div>
                  </div>
                </div>

                {/* REDSOUTH Account Sync Checkbox */}
                <TooltipProvider delayDuration={150}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div 
                        onClick={() => {
                          if (isLoggedIn) setSaveToCloud(!saveToCloud);
                        }}
                        className={`flex items-center gap-3 p-3 bg-[#1E1E1E]/60 border border-white/5 rounded-xl transition-colors ${
                          isLoggedIn 
                            ? "cursor-pointer hover:bg-[#1E1E1E]" 
                            : "opacity-50 cursor-not-allowed"
                        }`}
                      >
                        <Checkbox
                          disabled={!isLoggedIn}
                          checked={saveToCloud && isLoggedIn}
                          onCheckedChange={(checked) => {
                            if (isLoggedIn) setSaveToCloud(!!checked);
                          }}
                          className="data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500 border-white/20 disabled:cursor-not-allowed"
                        />
                        <div className="flex items-center gap-2.5">
                          <img src="/redsouth/logo-colored.svg" alt="REDSOUTH Account" className="w-4 h-4 object-contain shrink-0" />
                          <div className="flex flex-col text-left">
                            <span className="text-xs font-semibold text-white">Save to REDSOUTH Account</span>
                            <span className="text-[11px] text-white/50">
                              {isLoggedIn 
                                ? "Sync across your REDSOUTH devices" 
                                : "Sign in to sync across devices"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </TooltipTrigger>
                    {!isLoggedIn && (
                      <TooltipContent side="top" sideOffset={8} className="bg-[#1E1E1E] border border-white/10 text-white font-medium text-xs shadow-xl max-w-xs">
                        <p>Sign in to your REDSOUTH Account to sync resources across devices.</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>

              </div>

            </div>

            {/* Right Column: Compatibility Filters */}
            <div className="flex flex-col gap-5 border-l border-[#1E1E1E] pl-0 md:pl-6">
              
              {/* Supported Mod Loaders (Modrinth API) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Supported Loader(s)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllLoaders(!showAllLoaders)}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    {showAllLoaders ? "Standard loaders" : "+ Show all loaders"}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap max-h-52 overflow-y-auto custom-scrollbar pr-1">
                  <button
                    type="button"
                    onClick={toggleAllLoaders}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      selectedLoaders.includes("Any")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-[#1E1E1E] text-white/60 border-transparent hover:text-white"
                    }`}
                  >
                    All Loaders
                  </button>
                  {loadersList.map((ldr) => {
                    const isSelected = selectedLoaders.includes(ldr.name);
                    return (
                      <button
                        key={ldr.id}
                        type="button"
                        onClick={() => toggleLoader(ldr.name)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                          isSelected && !selectedLoaders.includes("Any")
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-[#1E1E1E] text-white/60 border-transparent hover:text-white"
                        }`}
                      >
                        {ldr.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supported MC Versions (Mojang API) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">
                    Supported MC Version(s)
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllMcVersions(!showAllMcVersions)}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    {showAllMcVersions ? "Standard versions" : "+ Show all versions"}
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-wrap max-h-64 overflow-y-auto custom-scrollbar pr-1">
                  <button
                    type="button"
                    onClick={() => toggleMcVersion("Any")}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                      selectedMcVersions.includes("Any")
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-[#1E1E1E] text-white/60 border-transparent hover:text-white"
                    }`}
                  >
                    All Versions
                  </button>
                  {mcVersionsList.map((ver) => {
                    const isSelected = selectedMcVersions.includes(ver);
                    return (
                      <button
                        key={ver}
                        type="button"
                        onClick={() => toggleMcVersion(ver)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                          isSelected && !selectedMcVersions.includes("Any")
                            ? "bg-blue-500 text-white border-blue-500"
                            : "bg-[#1E1E1E] text-white/60 border-transparent hover:text-white"
                        }`}
                      >
                        {ver}
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

          </div>
        </ScrollArea>

        {/* Footer matching PackSettingsModal style */}
        <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-end gap-3 shrink-0">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11 border-0">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || !downloadUrl.trim()}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-xl px-5 h-11 font-semibold outline outline-2 outline-transparent hover:outline-blue-500/50 hover:outline-offset-2 active:scale-95 transition-all disabled:opacity-40"
          >
            {editItem ? "Update Custom Content" : "Add Custom Content"}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
