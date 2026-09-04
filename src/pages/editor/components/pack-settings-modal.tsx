import { DeleteConfirmDialog } from "@/components/common/delete-confirm-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Check, X, FilePlus, Copy, Trash2, Settings, Package } from "lucide-react";
import { useState, useEffect, useRef, ChangeEvent, KeyboardEvent } from "react";
import { usePack } from "@/context/pack-context";
import { PackSettingsModalProps, FieldLabelProps } from "@/types";

function FieldLabel({ children }: FieldLabelProps) {
  return <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{children}</label>;
}

const sanitizeSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
};

export default function PackSettingsModal({ isOpen, onClose, focusField, isCreateMode: propIsCreateMode = false }: PackSettingsModalProps) {
  const { 
    packSettings, 
    packagesList, 
    createPack, 
    deletePack,
    updatePackSettings, 
    createNewVersion, 
    deleteVersion, 
    getMinecraftVersions, 
    getLoaders 
  } = usePack();

  const nameInputRef = useRef<HTMLInputElement>(null);
  const versionTriggerRef = useRef<HTMLButtonElement>(null);
  const mcVersionTriggerRef = useRef<HTMLButtonElement>(null);
  const loaderTriggerRef = useRef<HTMLButtonElement>(null);

  const isFirstPack = packagesList.length === 0;
  const isCreateMode = propIsCreateMode || isFirstPack;

  const [name, setName] = useState<string>("MODPKG");
  const [id, setId] = useState<string>("");
  const [isIdCustomized, setIsIdCustomized] = useState<boolean>(false);
  const [mcVersion, setMcVersion] = useState<string>("1.20.4");
  const [loader, setLoader] = useState<string>("fabric");
  const [currentVersion, setCurrentVersion] = useState<string>("v1.0.0");

  const [showAllMcVersions, setShowAllMcVersions] = useState<boolean>(false);
  const [showAllLoaders, setShowAllLoaders] = useState<boolean>(false);

  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false);
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [copySourceVersion, setCopySourceVersion] = useState<string>("empty");

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);
  const [isConfirmDeletePackOpen, setIsConfirmDeletePackOpen] = useState<boolean>(false);

  const mcVersionsList = getMinecraftVersions(showAllMcVersions);
  const loadersList = getLoaders(showAllLoaders);

  // Sync modal form with packSettings or reset defaults for Create Mode
  useEffect(() => {
    if (isOpen) {
      if (isCreateMode) {
        const availableMc = getMinecraftVersions(false);
        const randomSuffix = Math.random().toString(36).substring(2, 7);
        setName("MODPKG");
        setId(`modpkg-${randomSuffix}`);
        setIsIdCustomized(false);
        setMcVersion(availableMc[0] || "1.20.4");
        setLoader("fabric");
        setCurrentVersion("v1.0.0");
        setIsCreatingVersion(false);
      } else {
        setName(packSettings.name);
        setId(packSettings.id);
        setIsIdCustomized(false);
        setMcVersion(packSettings.mcVersion);
        setLoader(packSettings.loader);
        setCurrentVersion(packSettings.currentVersion);
        setIsCreatingVersion(false);
        setNewVersionName("");
        setCopySourceVersion("empty");
      }

      setTimeout(() => {
        if (focusField === "name" && nameInputRef.current) {
          nameInputRef.current.focus();
          nameInputRef.current.select();
        } else if (focusField === "version" && versionTriggerRef.current) {
          versionTriggerRef.current.focus();
          versionTriggerRef.current.click();
        } else if (focusField === "mcVersion" && mcVersionTriggerRef.current) {
          mcVersionTriggerRef.current.focus();
          mcVersionTriggerRef.current.click();
        } else if (focusField === "loader" && loaderTriggerRef.current) {
          loaderTriggerRef.current.focus();
          loaderTriggerRef.current.click();
        }
      }, 150);
    }
  }, [isOpen, focusField, isCreateMode]);

  const handleSave = () => {
    if (!name.trim()) return;
    if (isCreateMode) {
      createPack({
        id: id.trim(),
        name: name.trim(),
        mcVersion,
        loader,
        version: currentVersion.trim() || "v1.0.0",
        description: "Mi modpack personalizado creado con MODPKG",
      });
    } else {
      updatePackSettings({
        name: name.trim() || packSettings.name,
        id: id.trim() || packSettings.id,
        mcVersion,
        loader,
        currentVersion
      });
    }
    onClose();
  };

  const handleConfirmNewVersion = () => {
    if (newVersionName.trim()) {
      createNewVersion(newVersionName, copySourceVersion);
      setCurrentVersion(newVersionName.trim());
    }
    setIsCreatingVersion(false);
    setNewVersionName("");
    setCopySourceVersion("empty");
  };

  const handlePromptDelete = (ver: string) => {
    setVersionToDelete(ver);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (versionToDelete) {
      deleteVersion(versionToDelete);
    }
    setIsConfirmDeleteOpen(false);
    setVersionToDelete(null);
  };

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!isIdCustomized) {
      const slug = sanitizeSlug(val);
      setId(slug || "modpkg");
    }
  };

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeSlug(e.target.value);
    setId(cleaned);
    setIsIdCustomized(true);
  };

  return (
    <>
      <Dialog 
        open={isOpen} 
        onOpenChange={(open) => {
          if (!open && isFirstPack) return;
          if (!open) onClose();
        }}
      >
        <DialogContent 
          hideClose
          onPointerDownOutside={(e) => isFirstPack && e.preventDefault()}
          onEscapeKeyDown={(e) => isFirstPack && e.preventDefault()}
          onInteractOutside={(e) => isFirstPack && e.preventDefault()}
          className="sm:max-w-xl bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl"
        >
          <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-4 space-y-0">
            {isCreateMode ? (
              <Package className="w-8 h-8 text-[#FE5000] shrink-0" />
            ) : (
              <Settings className="w-8 h-8 text-[#FE5000] shrink-0" />
            )}
            <div className="flex flex-col text-left justify-center">
              <DialogTitle className="text-white text-lg font-bold leading-tight">
                {isCreateMode ? "Create New MODPKG" : "Pack Settings"}
              </DialogTitle>
              <p className="text-xs text-white/50 mt-0.5">
                {isCreateMode ? "Configure basic settings for your new modpack" : "Main configuration and version management for your modpack"}
              </p>
            </div>
          </DialogHeader>

          <div className="p-6 flex flex-col gap-5">
            {/* Name & ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <FieldLabel>Modpack Name</FieldLabel>
                <Input 
                  ref={nameInputRef}
                  value={name}
                  onChange={handleNameChange}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="e.g. MODPKG"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-[#FE5000]"
                />
              </div>

              <div className="flex flex-col gap-2">
                <FieldLabel>Pack ID</FieldLabel>
                <Input 
                  value={id}
                  onChange={handleIdChange}
                  onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                  placeholder="e.g. modpkg-x9a2k8"
                  className="bg-[#1E1E1E] border-[#1E1E1E] text-white font-mono text-xs h-11 rounded-xl focus-visible:border-[#FE5000]"
                />
              </div>
            </div>

            {/* Version */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Pack Version (Editing)</FieldLabel>
              {isCreatingVersion ? (
                <div className="flex flex-col gap-3 p-4 bg-[#1E1E1E]/60 border border-[#333333] rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Create New Version</span>
                    <button 
                      onClick={() => setIsCreatingVersion(false)}
                      className="text-white/40 hover:text-white transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-white/50">Version Tag / Name</label>
                    <Input 
                      autoFocus
                      value={newVersionName}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        const cleaned = e.target.value
                          .toLowerCase()
                          .replace(/\s+/g, "-")
                          .replace(/[^a-z0-9.-]/g, "");
                        setNewVersionName(cleaned);
                      }}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === "Enter" && newVersionName.trim()) {
                          e.preventDefault();
                          handleConfirmNewVersion();
                        }
                      }}
                      placeholder="e.g. v1.0.0"
                      className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-10 rounded-xl focus-visible:border-[#FE5000]"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-medium text-white/50">Initial Content</label>
                    <Select value={copySourceVersion} onValueChange={setCopySourceVersion}>
                      <SelectTrigger className="bg-[#1E1E1E] border border-[#333333] text-white h-10 rounded-xl">
                        <SelectValue placeholder="Select content source" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0A0A0A] border border-[#333333] text-white rounded-xl">
                        <SelectItem value="empty" className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                          <div className="flex items-center gap-2">
                            <FilePlus className="w-3.5 h-3.5 text-white/60" />
                            <span>Empty (Fresh Start)</span>
                          </div>
                        </SelectItem>
                        {packSettings.versions.map((ver) => (
                          <SelectItem key={ver} value={ver} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                            <div className="flex items-center gap-2">
                              <Copy className="w-3.5 h-3.5 text-white/60" />
                              <span>Copy from {ver}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    onClick={handleConfirmNewVersion}
                    disabled={!newVersionName.trim()}
                    className="w-full bg-[#FE5000] hover:bg-[#E04700] text-white rounded-xl h-10 font-semibold gap-2 mt-1 border-0"
                  >
                    <Check className="w-4 h-4 text-white" />
                    Create {newVersionName.trim() ? newVersionName.trim() : "Version"}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Select value={currentVersion} onValueChange={setCurrentVersion}>
                    <SelectTrigger 
                      ref={versionTriggerRef}
                      className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-11 rounded-xl flex-1"
                    >
                      <SelectValue placeholder="Select version" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl">
                      {packSettings.versions.map((ver) => (
                        <SelectItem key={ver} value={ver} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                          {ver}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    title="Create new version"
                    onClick={() => setIsCreatingVersion(true)}
                    className="h-11 w-11 rounded-xl border-2 border-[#1E1E1E] bg-[#1E1E1E] text-white hover:border-[#FE5000] hover:text-[#FE5000] hover:bg-transparent transition-colors shrink-0"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                  {packSettings.versions.length > 1 && (
                    <Button 
                      variant="outline" 
                      size="icon" 
                      title={`Delete version ${currentVersion}`}
                      onClick={() => handlePromptDelete(currentVersion)}
                      className="h-11 w-11 rounded-xl border-2 border-[#1E1E1E] bg-[#1E1E1E] text-white hover:border-[#FE5000] hover:text-[#FE5000] hover:bg-transparent transition-colors shrink-0"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Minecraft Version */}
              <div className="flex flex-col gap-2">
                <FieldLabel>Minecraft</FieldLabel>
                <Select value={mcVersion} onValueChange={setMcVersion}>
                  <SelectTrigger 
                    ref={mcVersionTriggerRef}
                    className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-11 rounded-xl"
                  >
                    <SelectValue placeholder="Select version" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {mcVersionsList.map((v) => (
                      <SelectItem key={v} value={v} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox 
                    id="show-all-mc" 
                    checked={showAllMcVersions} 
                    onCheckedChange={(checked: boolean | "indeterminate") => setShowAllMcVersions(!!checked)} 
                    className="border-[#333333] data-[state=checked]:bg-[#FE5000] data-[state=checked]:border-[#FE5000]"
                  />
                  <label htmlFor="show-all-mc" className="text-[11px] text-white/50 cursor-pointer select-none">
                    Show all Minecraft versions
                  </label>
                </div>
              </div>

              {/* Loader */}
              <div className="flex flex-col gap-2">
                <FieldLabel>Loader</FieldLabel>
                <Select value={loader} onValueChange={setLoader}>
                  <SelectTrigger 
                    ref={loaderTriggerRef}
                    className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-11 rounded-xl"
                  >
                    <SelectValue placeholder="Select loader" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl max-h-60 overflow-y-auto custom-scrollbar">
                    {loadersList.map((l) => (
                      <SelectItem key={l.id} value={l.id} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox 
                    id="show-all-loaders" 
                    checked={showAllLoaders} 
                    onCheckedChange={(checked: boolean | "indeterminate") => setShowAllLoaders(!!checked)} 
                    className="border-[#333333] data-[state=checked]:bg-[#FE5000] data-[state=checked]:border-[#FE5000]"
                  />
                  <label htmlFor="show-all-loaders" className="text-[11px] text-white/50 cursor-pointer select-none">
                    Show all loaders
                  </label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-between items-center gap-3">
            {!isFirstPack && !isCreateMode ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfirmDeletePackOpen(true)}
                className="h-11 rounded-xl border-2 border-[#1E1E1E] bg-[#1E1E1E] text-white hover:border-[#FE5000] hover:text-[#FE5000] hover:bg-transparent px-4 font-semibold text-xs transition-colors shrink-0 gap-2 flex items-center"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete package</span>
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
              {!isFirstPack && (
                <DialogClose asChild>
                  <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11">
                    Cancel
                  </Button>
                </DialogClose>
              )}
              <Button 
                onClick={handleSave}
                disabled={!name.trim()}
                className="bg-[#FE5000] text-white hover:bg-[#E04700] rounded-xl px-5 h-11 font-semibold outline outline-2 outline-transparent hover:outline-[#FE5000]/50 hover:outline-offset-2 active:scale-95 transition-all disabled:opacity-40"
              >
                {isCreateMode ? "Create MODPKG" : "Save Changes"}
              </Button>
            </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deleting Version */}
      <DeleteConfirmDialog
        isOpen={isConfirmDeleteOpen}
        onClose={() => setIsConfirmDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Version"
        itemName={`Version ${versionToDelete}`}
      />

      {/* Confirmation Dialog for Deleting MODPKG */}
      <DeleteConfirmDialog
        isOpen={isConfirmDeletePackOpen}
        onClose={() => setIsConfirmDeletePackOpen(false)}
        onConfirm={() => {
          setIsConfirmDeletePackOpen(false);
          deletePack(packSettings.id);
          onClose();
        }}
        title="Delete Package"
        itemName={packSettings.name}
        description={`Are you sure you want to delete ${packSettings.name} (${packSettings.id})? All custom files and installed content associated with this package will be removed. This action cannot be undone.`}
      />
    </>
  );
}
