import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Check, X, FilePlus, Copy, Trash2, Settings } from "lucide-react";
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

export default function PackSettingsModal({ isOpen, onClose, focusField }: PackSettingsModalProps) {
  const { packSettings, updatePackSettings, createNewVersion, deleteVersion, getMinecraftVersions, getLoaders } = usePack();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const versionTriggerRef = useRef<HTMLButtonElement>(null);
  const mcVersionTriggerRef = useRef<HTMLButtonElement>(null);
  const loaderTriggerRef = useRef<HTMLButtonElement>(null);

  const [name, setName] = useState<string>(packSettings.name);
  const [id, setId] = useState<string>(packSettings.id);
  const [isIdCustomized, setIsIdCustomized] = useState<boolean>(false);
  const [mcVersion, setMcVersion] = useState<string>(packSettings.mcVersion);
  const [loader, setLoader] = useState<string>(packSettings.loader);
  const [currentVersion, setCurrentVersion] = useState<string>(packSettings.currentVersion);

  const [showAllMcVersions, setShowAllMcVersions] = useState<boolean>(false);
  const [showAllLoaders, setShowAllLoaders] = useState<boolean>(false);

  const [isCreatingVersion, setIsCreatingVersion] = useState<boolean>(false);
  const [newVersionName, setNewVersionName] = useState<string>("");
  const [copySourceVersion, setCopySourceVersion] = useState<string>("empty");

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState<boolean>(false);
  const [versionToDelete, setVersionToDelete] = useState<string | null>(null);

  const mcVersionsList = getMinecraftVersions(showAllMcVersions);
  const loadersList = getLoaders(showAllLoaders);

  // Sync modal form with packSettings when opened and move real focus
  useEffect(() => {
    if (isOpen) {
      setName(packSettings.name);
      setId(packSettings.id);
      setIsIdCustomized(false);
      setMcVersion(packSettings.mcVersion);
      setLoader(packSettings.loader);
      setCurrentVersion(packSettings.currentVersion);
      setIsCreatingVersion(false);
      setNewVersionName("");
      setCopySourceVersion("empty");

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
  }, [isOpen, focusField]);

  const handleSave = () => {
    updatePackSettings({
      name: name.trim() || packSettings.name,
      id: id.trim() || packSettings.id,
      mcVersion,
      loader,
      currentVersion
    });
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
      setId(slug);
    }
  };

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    const cleaned = sanitizeSlug(e.target.value);
    setId(cleaned);
    setIsIdCustomized(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent hideClose className="sm:max-w-xl bg-[#0A0A0A] border border-[#1E1E1E] p-0 gap-0 overflow-hidden shadow-2xl rounded-2xl">
          
          <DialogHeader className="p-5 px-6 border-b border-[#1E1E1E] flex flex-row items-center gap-4">
            <Settings className="w-8 h-8 text-[#FE5000] shrink-0" />
            <div className="flex flex-col text-left justify-center -mt-[2px]">
              <DialogTitle className="text-white text-lg font-bold leading-tight">Pack Settings</DialogTitle>
              <p className="text-xs text-white/50 mt-0.5">Main configuration and version management for your modpack</p>
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

          <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex sm:justify-end gap-3">
            <DialogClose asChild>
              <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11">
                Cancel
              </Button>
            </DialogClose>
            <Button 
              onClick={handleSave}
              className="bg-[#FE5000] text-white hover:bg-[#E04700] rounded-xl px-5 h-11 font-semibold outline outline-2 outline-transparent hover:outline-[#FE5000]/50 hover:outline-offset-2 active:scale-95 transition-all"
            >
              Save Changes
            </Button>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deleting Version */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className="sm:max-w-lg bg-[#0A0A0A] border-2 border-[#1E1E1E] p-6 gap-4 overflow-hidden shadow-2xl rounded-2xl">
          <DialogHeader className="gap-2 p-0">
            <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-[#FE5000]" />
              <span>Delete Version</span>
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-sm text-white/70">
            Are you sure you want to delete version <strong className="text-white font-mono">{versionToDelete}</strong>? This action cannot be undone.
          </p>

          <DialogFooter className="flex sm:justify-end gap-2 pt-2">
            <Button 
              variant="ghost" 
              onClick={() => setIsConfirmDeleteOpen(false)}
              className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-4 h-10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-[#FE5000] hover:bg-[#E04700] text-white rounded-xl px-4 h-10 font-semibold border-0 outline outline-2 outline-transparent hover:outline-[#FE5000]/50 hover:outline-offset-2 transition-all"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
