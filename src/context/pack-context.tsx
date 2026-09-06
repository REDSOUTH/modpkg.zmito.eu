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
      const curVer = current.currentVersion || "v1.0.0";

      if (!data.releases) {
        data.releases = {};
      }

      if (!data.releases[curVer]) {
        data.releases[curVer] = {
          releaseId: curVer,
          minecraft: current.mcVersion,
          loader: {
            type: current.loader,
            version: current.loaderVersion || "latest",
          },
          installedContent: data.installedContent || [],
          customFiles: data.customFiles || [],
          publishedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      // Ensure all versions in current.versions exist in releases
      (current.versions || [curVer]).forEach(v => {
        if (!data.releases![v]) {
          data.releases![v] = {
            releaseId: v,
            minecraft: current.mcVersion,
            loader: { type: current.loader, version: current.loaderVersion || "latest" },
            installedContent: v === curVer ? [...(data.installedContent || [])] : [],
            customFiles: v === curVer ? [...(data.customFiles || [])] : [],
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
      });
      savePackData(current.id, data);

      const activeRelease = data.releases[curVer];
      setInstalledContent(activeRelease.installedContent || []);
      setCustomFiles(activeRelease.customFiles || []);
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
    const initialRelease = {
      releaseId: newVersion,
      minecraft: newPack.mcVersion,
      loader: {
        type: newPack.loader,
        version: newPack.loaderVersion || "latest",
      },
      installedContent: [],
      customFiles: [],
      publishedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const emptyData: PackExclusiveData = {
      id: newId,
      installedContent: [],
      customContent: [],
      customFiles: [],
      releases: {
        [newVersion]: initialRelease,
      },
    };
    savePackData(newId, emptyData);

    setActivePackId(newId);
    setPackSettings(newPack);
    setInstalledContent([]);
    setCustomFiles([]);
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
    const curVer = target.currentVersion || "v1.0.0";
    if (!data.releases) data.releases = {};
    if (!data.releases[curVer]) {
      data.releases[curVer] = {
        releaseId: curVer,
        minecraft: target.mcVersion,
        loader: { type: target.loader, version: target.loaderVersion || "latest" },
        installedContent: data.installedContent || [],
        customFiles: data.customFiles || [],
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      savePackData(packId, data);
    }
    const activeRel = data.releases[curVer];
    setInstalledContent(activeRel.installedContent || []);
    setCustomFiles(activeRel.customFiles || []);
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
      setCustomFiles([]);
      setIsCreatePackModalOpen(true);
    }
  };

  const updatePackSettings = (newSettings: Partial<PackSettings>) => {
    setPackSettings(prev => {
      const prevVersion = prev.currentVersion;
      const newVersion = newSettings.currentVersion ?? prevVersion;
      const isSwitchingVersion = newVersion !== prevVersion;

      if (activePackId) {
        const packData = getPackData(activePackId);
        if (!packData.releases) packData.releases = {};

        // 1. Save current active version state
        packData.releases[prevVersion] = {
          ...(packData.releases[prevVersion] || {
            releaseId: prevVersion,
            minecraft: prev.mcVersion,
            loader: { type: prev.loader, version: prev.loaderVersion || "latest" },
          }),
          installedContent: installedContent,
          customFiles: customFiles,
          updatedAt: new Date().toISOString(),
        };

        // 2. If switching to new version, load its contents
        if (isSwitchingVersion) {
          const targetRelease = packData.releases[newVersion] || {
            releaseId: newVersion,
            minecraft: newSettings.mcVersion || prev.mcVersion,
            loader: {
              type: newSettings.loader || prev.loader,
              version: prev.loaderVersion || "latest",
            },
            installedContent: [],
            customFiles: [],
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          packData.releases[newVersion] = targetRelease;
          packData.installedContent = targetRelease.installedContent || [];
          packData.customFiles = targetRelease.customFiles || [];

          setInstalledContent(targetRelease.installedContent || []);
          setCustomFiles(targetRelease.customFiles || []);
        } else {
          // Updating settings on the same version
          if (newSettings.mcVersion) packData.releases[prevVersion].minecraft = newSettings.mcVersion;
          if (newSettings.loader) {
            packData.releases[prevVersion].loader = {
              type: newSettings.loader,
              version: prev.loaderVersion || "latest",
            };
          }
        }

        savePackData(activePackId, packData);
      }

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

    let newContent: InstalledItem[] = [];
    let newFiles: CustomFileItem[] = [];

    if (activePackId) {
      const packData = getPackData(activePackId);
      if (!packData.releases) packData.releases = {};

      // 1. Save current active version first
      const currentVer = packSettings.currentVersion;
      packData.releases[currentVer] = {
        ...(packData.releases[currentVer] || {
          releaseId: currentVer,
          minecraft: packSettings.mcVersion,
          loader: { type: packSettings.loader, version: packSettings.loaderVersion || "latest" },
        }),
        installedContent: installedContent,
        customFiles: customFiles,
        updatedAt: new Date().toISOString(),
      };

      // 2. Resolve content for new version based on copyFromVersion
      if (copyFromVersion && copyFromVersion !== "empty") {
        if (copyFromVersion === currentVer) {
          newContent = JSON.parse(JSON.stringify(installedContent || []));
          newFiles = JSON.parse(JSON.stringify(customFiles || []));
        } else if (packData.releases[copyFromVersion]) {
          newContent = JSON.parse(JSON.stringify(packData.releases[copyFromVersion].installedContent || []));
          newFiles = JSON.parse(JSON.stringify(packData.releases[copyFromVersion].customFiles || []));
        }
      }

      // 3. Create and save release for new version
      packData.releases[trimmed] = {
        releaseId: trimmed,
        minecraft: packSettings.mcVersion,
        loader: {
          type: packSettings.loader,
          version: packSettings.loaderVersion || "latest",
        },
        installedContent: newContent,
        customFiles: newFiles,
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      packData.installedContent = newContent;
      packData.customFiles = newFiles;

      savePackData(activePackId, packData);
    }

    // 4. Update memory states
    setInstalledContent(newContent);
    setCustomFiles(newFiles);

    setPackSettings(prev => {
      const exists = prev.versions.includes(trimmed);
      const updatedVersions = exists ? prev.versions : [...prev.versions, trimmed];

      const updated = {
        ...prev,
        versions: updatedVersions,
        currentVersion: trimmed,
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

      if (activePackId) {
        const packData = getPackData(activePackId);
        if (packData.releases && packData.releases[versionToDelete]) {
          delete packData.releases[versionToDelete];
        }

        if (prev.currentVersion === versionToDelete) {
          const nextRelease = packData.releases?.[nextCurrentVersion];
          const nextContent = nextRelease?.installedContent || [];
          const nextFiles = nextRelease?.customFiles || [];
          packData.installedContent = nextContent;
          packData.customFiles = nextFiles;
          setInstalledContent(nextContent);
          setCustomFiles(nextFiles);
        }
        savePackData(activePackId, packData);
      }

      const updated = {
        ...prev,
        versions: filteredVersions,
        currentVersion: nextCurrentVersion,
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
        const curVer = packSettings.currentVersion || "v1.0.0";
        if (!packData.releases) packData.releases = {};
        if (!packData.releases[curVer]) {
          packData.releases[curVer] = {
            releaseId: curVer,
            minecraft: packSettings.mcVersion,
            loader: { type: packSettings.loader, version: packSettings.loaderVersion || "latest" },
            installedContent: updated,
            customFiles: customFiles,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          packData.releases[curVer].installedContent = updated;
          packData.releases[curVer].updatedAt = new Date().toISOString();
        }
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
        const curVer = packSettings.currentVersion || "v1.0.0";
        if (!packData.releases) packData.releases = {};
        if (packData.releases[curVer]) {
          packData.releases[curVer].installedContent = updated;
          packData.releases[curVer].updatedAt = new Date().toISOString();
        }
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
        const curVer = packSettings.currentVersion || "v1.0.0";
        if (!packData.releases) packData.releases = {};
        if (!packData.releases[curVer]) {
          packData.releases[curVer] = {
            releaseId: curVer,
            minecraft: packSettings.mcVersion,
            loader: { type: packSettings.loader, version: packSettings.loaderVersion || "latest" },
            installedContent: installedContent,
            customFiles: updated,
            publishedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        } else {
          packData.releases[curVer].customFiles = updated;
          packData.releases[curVer].updatedAt = new Date().toISOString();
        }
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
        const curVer = packSettings.currentVersion || "v1.0.0";
        if (!packData.releases) packData.releases = {};
        if (packData.releases[curVer]) {
          packData.releases[curVer].customFiles = updated;
          packData.releases[curVer].updatedAt = new Date().toISOString();
        }
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
        const curVer = packSettings.currentVersion || "v1.0.0";
        if (!packData.releases) packData.releases = {};
        if (packData.releases[curVer]) {
          packData.releases[curVer].customFiles = updated;
          packData.releases[curVer].updatedAt = new Date().toISOString();
        }
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
