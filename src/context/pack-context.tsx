import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { PackSettings, Loader, MojangVersion, ModrinthLoaderTag, PackContextType, InstalledItem } from "@/types";

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

const generateRandomId = (): string => {
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `modpkg-${randomStr}`;
};

export function PackProvider({ children }: { children: ReactNode }) {
  const [packSettings, setPackSettings] = useState<PackSettings>({
    id: generateRandomId(),
    name: "MODPKG",
    mcVersion: "1.20.4",
    loader: "fabric",
    versions: ["v1.0.0"],
    currentVersion: "v1.0.0",
    description: "Mi modpack personalizado creado con MODPKG"
  });

  const [rawMcVersions, setRawMcVersions] = useState<MojangVersion[]>([]);
  const [rawLoaders, setRawLoaders] = useState<ModrinthLoaderTag[]>([]);
  const [isLoadingVersions, setIsLoadingVersions] = useState<boolean>(true);
  const [installedContent, setInstalledContent] = useState<InstalledItem[]>([]);

  // Fetch real Minecraft versions from Mojang API
  useEffect(() => {
    async function fetchMojangVersions() {
      try {
        const res = await fetch("https://piston-meta.mojang.com/mc/game/version_manifest_v2.json");
        if (res.ok) {
          const data = await res.json();
          const versionsList: MojangVersion[] = data.versions || [];
          setRawMcVersions(versionsList);
          
          // Auto select the latest release version from Mojang
          const latestRelease = data.latest?.release || versionsList.find(v => v.type === "release")?.id;
          if (latestRelease) {
            setPackSettings(prev => ({
              ...prev,
              mcVersion: latestRelease
            }));
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

  // Helper to get formatted MC versions based on showAll parameter
  const getMinecraftVersions = (showAll = false): string[] => {
    if (rawMcVersions.length === 0) {
      return DEFAULT_RELEASE_VERSIONS;
    }
    if (showAll) {
      return rawMcVersions.map(v => v.id);
    }
    // Default: Only 'release' versions
    return rawMcVersions
      .filter(v => v.type === "release")
      .map(v => v.id);
  };

  // Helper to get formatted Loaders based on showAll parameter
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
    // Default: Only main release loaders (fabric, forge, neoforge, quilt)
    const mainLoaders = ["fabric", "forge", "neoforge", "quilt"];
    return DEFAULT_LOADERS.filter(l => mainLoaders.includes(l.id));
  };

  const updatePackSettings = (newSettings: Partial<PackSettings>) => {
    setPackSettings(prev => ({
      ...prev,
      ...newSettings
    }));
  };

  const createNewVersion = (versionName: string, copyFromVersion = "empty") => {
    const trimmed = versionName.trim();
    if (!trimmed) return;
    setPackSettings(prev => {
      const exists = prev.versions.includes(trimmed);
      const updatedVersions = exists ? prev.versions : [...prev.versions, trimmed];
      
      console.log(`[Version Created] Name: ${trimmed}, Source: ${copyFromVersion}`);
      
      return {
        ...prev,
        versions: updatedVersions,
        currentVersion: trimmed
      };
    });
  };

  const deleteVersion = (versionToDelete: string) => {
    setPackSettings(prev => {
      if (prev.versions.length <= 1) return prev;
      const filteredVersions = prev.versions.filter(v => v !== versionToDelete);
      const nextCurrentVersion = prev.currentVersion === versionToDelete 
        ? filteredVersions[0] 
        : prev.currentVersion;

      return {
        ...prev,
        versions: filteredVersions,
        currentVersion: nextCurrentVersion
      };
    });
  };

  const addContent = (item: InstalledItem) => {
    setInstalledContent(prev => {
      // Check if already installed
      if (prev.some(i => i.id === item.id)) {
        // If it exists, we might want to update the versionId
        return prev.map(i => i.id === item.id ? { ...i, versionId: item.versionId } : i);
      }
      return [...prev, item];
    });
    console.log(`[PackContext] Added content: ${item.name} (${item.versionId})`);
  };

  const removeContent = (id: string) => {
    setInstalledContent(prev => prev.filter(i => i.id !== id));
    console.log(`[PackContext] Removed content ID: ${id}`);
  };

  return (
    <PackContext.Provider
      value={{
        packSettings,
        updatePackSettings,
        createNewVersion,
        deleteVersion,
        getMinecraftVersions,
        getLoaders,
        loaders: getLoaders(false),
        isLoadingVersions,
        installedContent,
        addContent,
        removeContent
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
