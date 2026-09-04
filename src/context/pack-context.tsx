import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PackSettings, Loader, MojangVersion, ModrinthLoaderTag, PackContextType, InstalledItem, CustomFileItem } from "@/types";
import { 
  getPackagesIndex, 
  savePackagesIndex, 
  getPackData, 
  savePackData, 
  deletePackStorage,
  PackExclusiveData 
} from "@/lib/storage/package-storage";

const PackContext = createContext<PackContextType | null>(null);

const DEFAULT_RELEASE_VERSIONS = [
  "1.20.4",
  "1.20.2",
  "1.20.1",
  "1.20",
  "1.19.4",
  "1.19.2",
  "1.18.2",
  "1.16.5",
  "1.12.2"
];

const DEFAULT_LOADERS: Loader[] = [
  { id: "fabric", name: "Fabric" },
  { id: "forge", name: "Forge" },
  { id: "neoforge", name: "NeoForge" },
  { id: "quilt", name: "Quilt" }
];

export const generateRandomPackId = (): string => {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `modpkg-${randomStr}`;
};

const DEFAULT_FALLBACK_PACK: PackSettings = {
  id: "modpkg-default",
  name: "MODPKG",
  mcVersion: "1.20.4",
  loader: "fabric",
  versions: ["v1.0.0"],
  currentVersion: "v1.0.0",
  description: "Mi modpack personalizado creado con MODPKG"
};

export function PackProvider({ children }: { children: ReactNode }) {
  const [packagesList, setPackagesList] = useState<PackSettings[]>(() => getPackagesIndex());
  const [activePackId, setActivePackId] = useState<string | null>(() => {
    const list = getPackagesIndex();
    return list.length > 0 ? list[0].id : null;
  });

  const [packSettings, setPackSettings] = useState<PackSettings>(() => {
    const list = getPackagesIndex();
    return list.length > 0 ? list[0] : DEFAULT_FALLBACK_PACK;
  });

  const [installedContent, setInstalledContent] = useState<InstalledItem[]>([]);
  const [customFiles, setCustomFiles] = useState<CustomFileItem[]>([]);
  const [rawMcVersions, setRawMcVersions] = useState<MojangVersion[]>([]);
  const [rawLoaders, setRawLoaders] = useState<ModrinthLoaderTag[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(true);
  const [latestMcRelease, setLatestMcRelease] = useState<string>("1.20.4");
  const [isCreatePackModalOpen, setIsCreatePackModalOpen] = useState<boolean>(false);

  // Load active pack data when activePackId changes
  useEffect(() => {
    if (!activePackId) {
      if (packagesList.length === 0) {
        setIsCreatePackModalOpen(true);
      }
      return;
    }
    const current = packagesList.find(p => p.id === activePackId);
    if (current) {
      setPackSettings(current);
      const data = getPackData(current.id);
      setInstalledContent(data.installedContent || []);
      setCustomFiles(data.customFiles || []);
    }
  }, [activePackId, packagesList]);

  // Fetch real Minecraft versions from Mojang API & Modrinth loaders
  useEffect(() => {
    async function fetchMojangVersions() {
      try {
        const res = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
        if (res.ok) {
          const data = await res.json();
          const versionsList: MojangVersion[] = data.versions || [];
          setRawMcVersions(versionsList);
          
          const latestRelease = data.latest?.release || versionsList.find(v => v.type === "release")?.id;
          if (latestRelease) {
            setLatestMcRelease(latestRelease);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch Mojang version manifest, using defaults:", err);
      } finally {
        setIsLoadingVersions(false);
      }
    }

    async function fetchModrinthLoaders() {
      try {
        const res = await fetch("https://api.modrinth.com/v2/tag/loader");
        if (res.ok) {
          const data = await res.json();
          setRawLoaders(data || []);
        }
      } catch (err) {
        console.warn("Failed to fetch Modrinth loaders, using defaults:", err);
      }
    }

    fetchMojangVersions();
    fetchModrinthLoaders();
  }, []);

  const getMinecraftVersions = (showAll = false): string[] => {
    if (rawMcVersions.length === 0) {
      return DEFAULT_RELEASE_VERSIONS;
    }
    if (showAll) {
      return rawMcVersions.map(v => v.id);
    }
    return rawMcVersions
      .filter(v => v.type === "release")
      .map(v => v.id);
  };

  const getLoaders = (showAll = false): Loader[] => {
    if (rawLoaders.length === 0) {
      return DEFAULT_LOADERS;
    }
    if (showAll) {
      return rawLoaders.map(l => ({
        id: l.name,
        name: l.name.charAt(0).toUpperCase() + l.name.slice(1)
      }));
    }
    const mainLoaders = ["fabric", "forge", "neoforge", "quilt"];
    return DEFAULT_LOADERS.filter(l => mainLoaders.includes(l.id));
  };

  // Create new package
  const createPack = (packData: Omit<PackSettings, "id" | "versions" | "currentVersion"> & { id?: string; version?: string }): PackSettings => {
    const newId = packData.id || generateRandomPackId();
    const newVersion = packData.version || "v1.0.0";
    const newPack: PackSettings = {
      id: newId,
      name: packData.name || "MODPKG",
      mcVersion: packData.mcVersion || latestMcRelease,
      loader: packData.loader || "fabric",
      versions: [newVersion],
      currentVersion: newVersion,
      description: packData.description || "Mi modpack personalizado creado con MODPKG",
    };

    const updatedList = [newPack, ...packagesList];
    setPackagesList(updatedList);
    savePackagesIndex(updatedList);

    // Initialize per-pack storage object
    const emptyData: PackExclusiveData = {
      id: newId,
      installedContent: [],
      customContent: [],
      customFiles: [],
    };
    savePackData(newId, emptyData);

    setActivePackId(newId);
    setPackSettings(newPack);
    setInstalledContent([]);
    setIsCreatePackModalOpen(false);

    return newPack;
  };

  // Switch active pack
  const switchPack = (packId: string) => {
    const target = packagesList.find(p => p.id === packId);
    if (!target) return;
    setActivePackId(packId);
    setPackSettings(target);
    const data = getPackData(packId);
    setInstalledContent(data.installedContent || []);
    setCustomFiles(data.customFiles || []);
  };

  // Delete package
  const deletePack = (packId: string) => {
    const updatedList = packagesList.filter(p => p.id !== packId);
    setPackagesList(updatedList);
    savePackagesIndex(updatedList);
    deletePackStorage(packId);

    if (updatedList.length > 0) {
      switchPack(updatedList[0].id);
    } else {
      setActivePackId(null);
      setPackSettings(DEFAULT_FALLBACK_PACK);
      setInstalledContent([]);
      setIsCreatePackModalOpen(true);
    }
  };

  const updatePackSettings = (newSettings: Partial<PackSettings>) => {
    setPackSettings(prev => {
      const updated = { ...prev, ...newSettings };
      const updatedList = packagesList.map(p => p.id === prev.id ? updated : p);
      setPackagesList(updatedList);
      savePackagesIndex(updatedList);
      return updated;
    });
  };

  const createNewVersion = (versionName: string, copyFromVersion = "empty") => {
    const trimmed = versionName.trim();
    if (!trimmed) return;
    setPackSettings(prev => {
      const exists = prev.versions.includes(trimmed);
      const updatedVersions = exists ? prev.versions : [...prev.versions, trimmed];
      
      const updated = {
        ...prev,
        versions: updatedVersions,
        currentVersion: trimmed
      };
      
      const updatedList = packagesList.map(p => p.id === prev.id ? updated : p);
      setPackagesList(updatedList);
      savePackagesIndex(updatedList);
      
      return updated;
    });
  };

  const deleteVersion = (versionToDelete: string) => {
    setPackSettings(prev => {
      if (prev.versions.length <= 1) return prev;
      const filteredVersions = prev.versions.filter(v => v !== versionToDelete);
      const nextCurrentVersion = prev.currentVersion === versionToDelete 
        ? filteredVersions[0] 
        : prev.currentVersion;

      const updated = {
        ...prev,
        versions: filteredVersions,
        currentVersion: nextCurrentVersion
      };

      const updatedList = packagesList.map(p => p.id === prev.id ? updated : p);
      setPackagesList(updatedList);
      savePackagesIndex(updatedList);

      return updated;
    });
  };

  const addContent = (item: InstalledItem) => {
    setInstalledContent(prev => {
      const updated = prev.some(i => i.id === item.id)
        ? prev.map(i => i.id === item.id ? { ...i, ...item } : i)
        : [...prev, item];
      
      if (activePackId) {
        const packData = getPackData(activePackId);
        packData.installedContent = updated;
        savePackData(activePackId, packData);
      }
      return updated;
    });
  };

  const removeContent = (id: string) => {
    setInstalledContent(prev => {
      const updated = prev.filter(i => i.id !== id);
      if (activePackId) {
        const packData = getPackData(activePackId);
        packData.installedContent = updated;
        savePackData(activePackId, packData);
      }
      return updated;
    });
  };

  const addCustomFile = (file: CustomFileItem) => {
    setCustomFiles(prev => {
      const updated = [file, ...prev.filter(f => f.id !== file.id)];
      if (activePackId) {
        const packData = getPackData(activePackId);
        packData.customFiles = updated;
        savePackData(activePackId, packData);
      }
      return updated;
    });
  };

  const updateCustomFile = (file: CustomFileItem) => {
    setCustomFiles(prev => {
      const updated = prev.map(f => f.id === file.id ? file : f);
      if (activePackId) {
        const packData = getPackData(activePackId);
        packData.customFiles = updated;
        savePackData(activePackId, packData);
      }
      return updated;
    });
  };

  const removeCustomFile = (id: string) => {
    setCustomFiles(prev => {
      const updated = prev.filter(f => f.id !== id);
      if (activePackId) {
        const packData = getPackData(activePackId);
        packData.customFiles = updated;
        savePackData(activePackId, packData);
      }
      return updated;
    });
  };

  return (
    <PackContext.Provider
      value={{
        packSettings,
        packagesList,
        activePackId,
        createPack,
        switchPack,
        deletePack,
        updatePackSettings,
        createNewVersion,
        deleteVersion,
        getMinecraftVersions,
        getLoaders,
        loaders: getLoaders(false),
        isLoadingVersions,
        installedContent,
        addContent,
        removeContent,
        customFiles,
        addCustomFile,
        updateCustomFile,
        removeCustomFile,
        isCreatePackModalOpen,
        setIsCreatePackModalOpen,
      }}
    >
      {children}
    </PackContext.Provider>
  );
}

export function usePack(): PackContextType {
  const context = useContext(PackContext);
  if (!context) {
    throw new Error("usePack must be used within a PackProvider");
  }
  return context;
}
