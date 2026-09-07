import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ContentTypeIcon } from "@/components/common/content-type-icon";
import { CustomStorageType } from "@/components/common/storage-badge";
import { PackageDropdownSelector } from "@/components/common/package-dropdown-selector";
import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { PlusCircle, Pencil, Check, Sparkles, Package, Globe, AlertTriangle, Trash2, X } from "lucide-react";
import { useState, useEffect, ChangeEvent } from "react";
import { useTranslation } from "react-i18next";
import { 
  saveCustomContentItem, 
  updateCustomContentItem, 
  deleteCustomContentItem, 
  getCustomContentItems,
  getPackageCustomContentItems,
  savePackageCustomContentItem,
  updatePackageCustomContentItem,
  deletePackageCustomContentItem
} from "@/lib/storage/custom-content-storage";
import { CustomContentItem } from "@/types";
import { ResourceOptionsSection } from "@/components/views/resource-options-section";
import { usePack } from "@/context/pack-context";

export interface AddCustomContentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdded?: (newItem: CustomContentItem) => void;
  onUpdated?: (updatedItem: CustomContentItem) => void;
  onDeleted?: (itemId: string) => void;
  editItem?: CustomContentItem | any | null;
  isLoggedIn?: boolean;
  defaultAddToPackage?: boolean;
  defaultSaveAsCommon?: boolean;
  context?: "standalone" | "editor";
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
  onDeleted,
  editItem,
  isLoggedIn = false,
  defaultAddToPackage = false,
  defaultSaveAsCommon = true,
  context = "standalone",
}: AddCustomContentDialogProps) {
  const { t } = useTranslation();
  const { packSettings, getMinecraftVersions, getLoaders, addContent, removeContent } = usePack();

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

  // Active package version & loader compatibility check
  const currentPkgMcVersion = packSettings.mcVersion || "1.20.1";
  const currentPkgLoader = packSettings.loader || "Any";

  const isMcCompatibleWithPkg = selectedMcVersions.includes("Any") || selectedMcVersions.includes(currentPkgMcVersion);
  const isLoaderCompatibleWithPkg = selectedLoaders.includes("Any") || selectedLoaders.map(l => l.toLowerCase()).includes(currentPkgLoader.toLowerCase());
  const isCompatibleWithCurrentPkg = isMcCompatibleWithPkg && isLoaderCompatibleWithPkg;
  const isOrphanedSave = context === "editor" && !isCompatibleWithCurrentPkg && !saveAsCommon;

  useEffect(() => {
    if (isOpen) {
      if (editItem) {
        setName(editItem.name);
        setDownloadUrl(editItem.downloadUrl);
        setContentType(editItem.contentType);
        setAuthor(editItem.author || "");
        
        const rawL = editItem.loader || "Any";
        if (rawL === "Any" || rawL.toLowerCase() === "all" || !rawL) {
          setSelectedLoaders(["Any"]);
        } else {
          const loaderMap: Record<string, string> = { fabric: "Fabric", forge: "Forge", neoforge: "NeoForge", quilt: "Quilt" };
          const parsedLoaders = rawL.split(",").map((s: string) => {
            const trimmed = s.trim();
            return loaderMap[trimmed.toLowerCase()] || (trimmed.charAt(0).toUpperCase() + trimmed.slice(1));
          });
          setSelectedLoaders(parsedLoaders);
        }

        const rawV = editItem.mcVersion || "Any";
        if (rawV === "Any" || rawV.toLowerCase() === "all" || !rawV) {
          setSelectedMcVersions(["Any"]);
        } else {
          const parsedVersions = rawV.split(",").map((s: string) => s.trim());
          setSelectedMcVersions(parsedVersions);
        }

        setTargetPath(editItem.targetPath || "config/options.txt");
        setSaveToCloud(editItem.storageLocation === "account_cloud");
        setAddToPackage(defaultAddToPackage);
        setSaveAsCommon(defaultSaveAsCommon);
        setDetectedTypeNote(null);
      } else {
        setName("");
        setDownloadUrl("");
        setContentType("mod");
        setAuthor("");
        const rawLoader = packSettings.loader && packSettings.loader !== "Any" ? packSettings.loader : "Any";
        const loaderMap: Record<string, string> = { fabric: "Fabric", forge: "Forge", neoforge: "NeoForge", quilt: "Quilt" };
        const initLoader = loaderMap[rawLoader.toLowerCase()] || (rawLoader.charAt(0).toUpperCase() + rawLoader.slice(1));
        const initVersion = packSettings.mcVersion || "1.20.1";
        setSelectedLoaders([initLoader]);
        setSelectedMcVersions([initVersion]);
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
          setDetectedTypeNote(t("addCustomContent.detectedMod"));
        } else if (url.toLowerCase().includes("shader") || url.toLowerCase().includes("complementary")) {
          handleTypeChange("shader");
          setDetectedTypeNote(t("addCustomContent.detectedShader"));
        } else if (url.toLowerCase().includes("texture") || url.toLowerCase().includes("resourcepack") || url.toLowerCase().endsWith(".zip")) {
          handleTypeChange("resourcepack");
          setDetectedTypeNote(t("addCustomContent.detectedResourcepack"));
        } else {
          setDetectedTypeNote(null);
        }
      }
    } else {
      setDetectedTypeNote(null);
    }
  };

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);

  const handlePromptDelete = () => {
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!editItem) return;
    const globalItems = getCustomContentItems();
    const isGlobal = globalItems.some(i => i.id === editItem.id);

    if (isGlobal) {
      deleteCustomContentItem(editItem.id);
    } else {
      deletePackageCustomContentItem(packSettings.id, editItem.id);
    }
    removeContent(editItem.id);

    onDeleted?.(editItem.id);
    setIsConfirmDeleteOpen(false);
    onClose();
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

    let targetItem: CustomContentItem | null = null;

    if (editItem) {
      const isCurrentlyGlobal = getCustomContentItems().some(i => i.id === editItem.id);
      const isCurrentlyPkgOnly = getPackageCustomContentItems(packSettings.id).some(i => i.id === editItem.id);

      if (saveAsCommon) {
        if (isCurrentlyGlobal) {
          const updated = updateCustomContentItem(editItem.id, payload);
          targetItem = updated || { ...editItem, ...payload };
          if (targetItem) onUpdated?.(targetItem);
        } else if (isCurrentlyPkgOnly) {
          deletePackageCustomContentItem(packSettings.id, editItem.id);
          targetItem = saveCustomContentItem(payload);
          if (targetItem) onUpdated?.(targetItem);
        } else {
          targetItem = saveCustomContentItem(payload);
          if (targetItem) onAdded?.(targetItem);
        }
      } else {
        if (isCurrentlyPkgOnly) {
          const updated = updatePackageCustomContentItem(packSettings.id, editItem.id, payload);
          targetItem = updated || { ...editItem, ...payload };
          if (targetItem) onUpdated?.(targetItem);
        } else if (isCurrentlyGlobal) {
          deleteCustomContentItem(editItem.id);
          targetItem = savePackageCustomContentItem(packSettings.id, payload);
          if (targetItem) onUpdated?.(targetItem);
        } else {
          targetItem = savePackageCustomContentItem(packSettings.id, payload);
          if (targetItem) onAdded?.(targetItem);
        }
      }
    } else {
      if (saveAsCommon) {
        targetItem = saveCustomContentItem(payload);
        onAdded?.(targetItem);
      } else {
        targetItem = savePackageCustomContentItem(packSettings.id, payload);
        onAdded?.(targetItem);
      }
    }

    // 3. Handle active package installation ("Add directly to current package")
    if (context === "editor" || addToPackage) {
      if (addToPackage && isCompatibleWithCurrentPkg) {
        const itemId = targetItem?.id || editItem?.id || `custom-pkg-${Date.now()}`;
        addContent({
          id: itemId,
          name: payload.name,
          provider: "custom",
          iconUrl: "",
          versionId: "custom",
          versionName: "Custom URL",
          contentType: payload.contentType,
          downloadUrl: payload.downloadUrl,
          author: payload.author,
          mcVersion: payload.mcVersion,
          loader: payload.loader,
          targetPath: payload.targetPath,
          storageLocation: payload.storageLocation,
          isPackageOnly: !saveAsCommon,
        });
      } else if (!addToPackage && editItem?.id) {
        removeContent(editItem.id);
      }
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose 
        className="dialog-accent-blue sm:max-w-4xl bg-card border border-border p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl text-foreground"
      >
        
        <DialogHeader className="p-5 px-6 border-b border-border flex flex-row items-center justify-between shrink-0 space-y-0">
          <div className="flex items-center gap-4">
            {editItem ? (
              <Pencil className="w-8 h-8 text-blue-400 shrink-0" />
            ) : (
              <PlusCircle className="w-8 h-8 text-blue-400 shrink-0" />
            )}
            <div className="flex flex-col text-left justify-center">
              <DialogTitle className="text-foreground text-lg font-bold leading-tight">
                {editItem ? t("addCustomContent.editTitle") : t("addCustomContent.createTitle")}
              </DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                {editItem ? t("addCustomContent.editSubtitle") : t("addCustomContent.createSubtitle")}
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

        {/* Scrollable Content Body with Radix ScrollArea */}
        <ScrollArea className="max-h-[75vh] w-full">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Resource Details */}
            <div className="flex flex-col gap-4">
              
              {/* Download URL */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("addCustomContent.downloadUrl")}
                </label>
                <Input 
                  autoFocus={!editItem}
                  value={downloadUrl}
                  onChange={handleUrlChange}
                  placeholder="https://example.com/file.jar"
                  className="bg-muted/70 border-border text-foreground h-11 rounded-xl focus-visible:border-blue-500"
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
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("addCustomContent.name")}
                </label>
                <Input 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Custom OptiFine"
                  className="bg-muted/70 border-border text-foreground h-11 rounded-xl focus-visible:border-blue-500"
                />
              </div>

              {/* Content Type */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("addCustomContent.contentType")}
                </label>
                <Select value={contentType} onValueChange={handleTypeChange}>
                  <SelectTrigger className="bg-muted/70 border-2 border-border text-foreground focus:ring-0 focus:border-blue-500 h-11 rounded-xl">
                    <div className="flex items-center gap-2">
                      <ContentTypeIcon type={contentType} />
                      <span>{t(`myResources.types.${contentType}`, { defaultValue: contentType })}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-2 border-border text-popover-foreground rounded-xl">
                    <SelectItem value="mod" className="focus:bg-muted focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="mod" />
                        <span>{t("myResources.types.mod")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="resourcepack" className="focus:bg-muted focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="resourcepack" />
                        <span>{t("myResources.types.resourcepack")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="shader" className="focus:bg-muted focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="shader" />
                        <span>{t("myResources.types.shader")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="datapack" className="focus:bg-muted focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="datapack" />
                        <span>{t("myResources.types.datapack")}</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="world" className="focus:bg-muted focus:text-blue-400">
                      <div className="flex items-center gap-2">
                        <ContentTypeIcon type="world" />
                        <span>{t("myResources.types.world")}</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Author */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {t("addCustomContent.author")}
                </label>
                <Input 
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="e.g. sp614x"
                  className="bg-muted/70 border-border text-foreground h-11 rounded-xl focus-visible:border-blue-500"
                />
              </div>

              {/* Destination & Sync Options */}
              <ResourceOptionsSection
                context={context}
                accentColor="blue"
                resourceType="content"
                showAddToPackage={!editItem}
                addToPackage={addToPackage}
                onAddToPackageChange={setAddToPackage}
                saveToLibrary={saveAsCommon}
                onSaveToLibraryChange={setSaveAsCommon}
                saveToCloud={saveToCloud}
                onSaveToCloudChange={setSaveToCloud}
                isLoggedIn={isLoggedIn}
              />

              {isOrphanedSave ? (
                <div className="flex items-center gap-2.5 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>
                    {t("addCustomContent.incompatibleCannotSave", {
                      loaders: selectedLoaders.join(", "),
                      versions: selectedMcVersions.join(", "),
                      currentLoader: currentPkgLoader,
                      currentVersion: currentPkgMcVersion
                    })}
                  </span>
                </div>
              ) : (!isCompatibleWithCurrentPkg && context === "editor") ? (
                <div className="flex items-center gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>
                    {t("addCustomContent.incompatibleWarning", {
                      loaders: selectedLoaders.join(", "),
                      versions: selectedMcVersions.join(", "),
                      currentLoader: currentPkgLoader,
                      currentVersion: currentPkgMcVersion
                    })}
                  </span>
                </div>
              ) : null}

            </div>

            {/* Right Column: Compatibility Filters */}
            <div className="flex flex-col gap-5 border-l border-border pl-0 md:pl-6">
              
              {/* Supported Mod Loaders (Modrinth API) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("addCustomContent.supportedLoaders")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllLoaders(!showAllLoaders)}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    {showAllLoaders ? t("addCustomContent.standardLoaders") : t("addCustomContent.showAllLoaders")}
                  </button>
                </div>

                <ScrollArea className="max-h-36 pr-2">
                  <div className="flex items-center gap-2 flex-wrap py-1">
                    <button
                      type="button"
                      onClick={toggleAllLoaders}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                        selectedLoaders.includes("Any")
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {t("addCustomContent.allLoaders")}
                    </button>
                    {loadersList.map((ldr: { id: string; name: string }) => {
                      const isSelected = selectedLoaders.includes(ldr.name);
                      return (
                        <button
                          key={ldr.id}
                          type="button"
                          onClick={() => toggleLoader(ldr.name)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                            isSelected && !selectedLoaders.includes("Any")
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-muted text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {ldr.name}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

              {/* Supported MC Versions (Mojang API) */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {t("addCustomContent.supportedMc")}
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAllMcVersions(!showAllMcVersions)}
                    className="text-[11px] text-blue-400 hover:underline font-semibold"
                  >
                    {showAllMcVersions ? t("addCustomContent.standardVersions") : t("addCustomContent.showAllVersions")}
                  </button>
                </div>

                <ScrollArea className="max-h-52 pr-2">
                  <div className="flex items-center gap-2 flex-wrap py-1">
                    <button
                      type="button"
                      onClick={() => toggleMcVersion("Any")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                        selectedMcVersions.includes("Any")
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-muted text-muted-foreground border-border hover:text-foreground"
                      }`}
                    >
                      {t("addCustomContent.allVersions")}
                    </button>
                    {mcVersionsList.map((ver: string) => {
                      const isSelected = selectedMcVersions.includes(ver);
                      return (
                        <button
                          key={ver}
                          type="button"
                          onClick={() => toggleMcVersion(ver)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-xl transition-all border ${
                            isSelected && !selectedMcVersions.includes("Any")
                              ? "bg-blue-500 text-white border-blue-500"
                              : "bg-muted text-muted-foreground border-border hover:text-foreground"
                          }`}
                        >
                          {ver}
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>

            </div>

          </div>
        </ScrollArea>

        {/* Footer matching PackSettingsModal style */}
        <DialogFooter className="p-4 px-6 border-t border-border bg-card flex sm:justify-between items-center gap-3 shrink-0">
          {editItem ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handlePromptDelete}
              className="h-11 rounded-xl bg-muted dark:bg-[#1E1E1E] text-muted-foreground hover:text-red-400 hover:bg-red-500/10 ring-1 ring-inset ring-border/40 dark:ring-0 hover:ring-2 hover:ring-red-500/60 px-4 font-semibold text-xs transition-all shrink-0 gap-2 flex items-center cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t("common.delete")}</span>
            </Button>
          ) : (
            <div />
          )}

          <Button 
            onClick={handleSave} 
            disabled={!name.trim() || !downloadUrl.trim() || isOrphanedSave}
            className="bg-blue-500 text-white hover:bg-blue-600 rounded-xl px-6 h-11 font-semibold outline outline-2 outline-transparent hover:outline-blue-500/50 hover:outline-offset-2 active:scale-95 transition-all disabled:opacity-40"
          >
            {editItem ? t("addCustomContent.updateBtn") : t("addCustomContent.createBtn")}
          </Button>
        </DialogFooter>

      </DialogContent>

      {/* Confirmation Dialog for Deleting Custom Content */}
      <DeleteConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title={t("addCustomContent.deleteTitle")}
        itemName={name}
      />
    </Dialog>
  );
}
