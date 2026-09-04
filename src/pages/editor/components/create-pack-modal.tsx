import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Package, Check, Sparkles } from "lucide-react";
import { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { usePack, generateRandomPackId } from "@/context/pack-context";

const sanitizeSlug = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
};

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="text-xs font-semibold text-white/50 uppercase tracking-wider">{children}</label>;
}

export default function CreatePackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { createPack, getMinecraftVersions, getLoaders } = usePack();

  const [name, setName] = useState<string>("MODPKG");
  const [id, setId] = useState<string>("");
  const [isIdCustomized, setIsIdCustomized] = useState<boolean>(false);
  const [mcVersion, setMcVersion] = useState<string>("1.20.4");
  const [loader, setLoader] = useState<string>("fabric");
  const [version, setVersion] = useState<string>("v1.0.0");
  const [description, setDescription] = useState<string>("Mi modpack personalizado creado con MODPKG");

  const [showAllMcVersions, setShowAllMcVersions] = useState<boolean>(false);
  const [showAllLoaders, setShowAllLoaders] = useState<boolean>(false);

  const mcVersionsList = getMinecraftVersions(showAllMcVersions);
  const loadersList = getLoaders(showAllLoaders);

  useEffect(() => {
    if (isOpen) {
      const generatedId = generateRandomPackId();
      setName("MODPKG");
      setId(generatedId);
      setIsIdCustomized(false);
      const availableMc = getMinecraftVersions(false);
      setMcVersion(availableMc[0] || "1.20.4");
      setLoader("fabric");
      setVersion("v1.0.0");
      setDescription("Mi modpack personalizado creado con MODPKG");
    }
  }, [isOpen]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (!isIdCustomized) {
      const slug = sanitizeSlug(newName);
      setId(slug ? `modpkg-${slug}` : generateRandomPackId());
    }
  };

  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsIdCustomized(true);
    const cleaned = sanitizeSlug(e.target.value);
    setId(cleaned);
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    createPack({
      id: id.trim() || generateRandomPackId(),
      name: name.trim(),
      mcVersion,
      loader,
      version: version.trim() || "v1.0.0",
      description: description.trim() || "Mi modpack personalizado creado con MODPKG",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-[#0A0A0A] border-[#1E1E1E] text-white max-w-lg rounded-2xl p-0 gap-0 overflow-hidden shadow-2xl">
        {/* Header */}
        <DialogHeader className="p-6 pb-4 border-b border-[#1E1E1E] flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FE5000]/10 border border-[#FE5000]/20 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-[#FE5000]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-white">Create New MODPKG</DialogTitle>
              <p className="text-xs text-white/50 mt-0.5">Configure the basic settings for your new modpack</p>
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <div className="p-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Pack Name</FieldLabel>
              <Input 
                autoFocus
                value={name}
                onChange={handleNameChange}
                placeholder="e.g. MODPKG"
                className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-[#FE5000]"
              />
            </div>

            {/* Pack ID */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Pack ID</FieldLabel>
              <Input 
                value={id}
                onChange={handleIdChange}
                placeholder="e.g. modpkg-x9a2k8"
                className="bg-[#1E1E1E] border-[#1E1E1E] text-white font-mono text-xs h-11 rounded-xl focus-visible:border-[#FE5000]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Initial Version */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Initial Version</FieldLabel>
              <Input 
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                placeholder="v1.0.0"
                className="bg-[#1E1E1E] border-[#1E1E1E] text-white h-11 rounded-xl focus-visible:border-[#FE5000]"
              />
            </div>

            {/* Minecraft Version */}
            <div className="flex flex-col gap-2 col-span-2">
              <div className="flex items-center justify-between">
                <FieldLabel>Minecraft</FieldLabel>
                <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowAllMcVersions(!showAllMcVersions)}>
                  <Checkbox id="create-show-all-mc" checked={showAllMcVersions} onCheckedChange={(c) => setShowAllMcVersions(!!c)} className="w-3.5 h-3.5 border-white/30 data-[state=checked]:bg-[#FE5000] data-[state=checked]:border-[#FE5000]" />
                  <label htmlFor="create-show-all-mc" className="text-[10px] text-white/50 cursor-pointer select-none">All</label>
                </div>
              </div>
              <Select value={mcVersion} onValueChange={setMcVersion}>
                <SelectTrigger className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-11 rounded-xl">
                  <SelectValue placeholder="1.20.4" />
                </SelectTrigger>
                <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl max-h-60 custom-scrollbar">
                  {mcVersionsList.map((ver) => (
                    <SelectItem key={ver} value={ver} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                      {ver}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loader */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <FieldLabel>Mod Loader</FieldLabel>
              <div className="flex items-center gap-1.5 cursor-pointer" onClick={() => setShowAllLoaders(!showAllLoaders)}>
                <Checkbox id="create-show-all-loaders" checked={showAllLoaders} onCheckedChange={(c) => setShowAllLoaders(!!c)} className="w-3.5 h-3.5 border-white/30 data-[state=checked]:bg-[#FE5000] data-[state=checked]:border-[#FE5000]" />
                <label htmlFor="create-show-all-loaders" className="text-[10px] text-white/50 cursor-pointer select-none">All Loaders</label>
              </div>
            </div>
            <Select value={loader} onValueChange={setLoader}>
              <SelectTrigger className="bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-11 rounded-xl">
                <SelectValue placeholder="Fabric" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl">
                {loadersList.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="focus:bg-[#1E1E1E] focus:text-[#FE5000]">
                    {l.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 px-6 border-t border-[#1E1E1E] bg-[#0A0A0A] flex justify-end items-center gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-5 h-11 border-0">
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={handleCreate}
            disabled={!name.trim()}
            className="bg-[#FE5000] hover:bg-[#E04700] text-white font-semibold rounded-xl px-6 h-11 border-0 gap-2"
          >
            <Check className="w-4 h-4" />
            <span>Create MODPKG</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
