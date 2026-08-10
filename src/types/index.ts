/**
 * MODPKG Central Type Definitions & Reusable Interfaces
 */

// ==========================================
// 1. Pack & Context Interfaces
// ==========================================

export type FocusField = "name" | "version" | "mcVersion" | "loader" | null;

export interface PackSettings {
  id: string;
  name: string;
  mcVersion: string;
  loader: string;
  versions: string[];
  currentVersion: string;
  description: string;
}

export interface InstalledItem {
  id: string; // Project ID (CurseForge or Modrinth)
  name: string;
  provider: "modrinth" | "curseforge" | "custom" | "local_override" | "all";
  iconUrl: string;
  versionId: string; // Specific version ID or "latest"
  versionName?: string; // Human-readable version name
  contentType: string;
  path?: string; // Optional path for overrides
}

export interface ModVersion {
  id: string;
  name: string;
  stable: boolean;
  recommended: boolean;
}

export interface Loader {
  id: string;
  name: string;
}

export interface MojangVersion {
  id: string;
  type: "release" | "snapshot" | "old_beta" | "old_alpha" | string;
  url?: string;
  time?: string;
  releaseTime?: string;
}

export interface ModrinthLoaderTag {
  name: string;
  supported_project_types?: string[];
}

export interface PackContextType {
  packSettings: PackSettings;
  updatePackSettings: (newSettings: Partial<PackSettings>) => void;
  createNewVersion: (versionName: string, copyFromVersion?: string) => void;
  deleteVersion: (versionToDelete: string) => void;
  getMinecraftVersions: (showAll?: boolean) => string[];
  getLoaders: (showAll?: boolean) => Loader[];
  loaders: Loader[];
  isLoadingVersions: boolean;
  installedContent: InstalledItem[];
  addContent: (item: InstalledItem) => void;
  removeContent: (id: string) => void;
}

// ==========================================
// 2. Component Props Interfaces
// ==========================================

export interface PackSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  focusField?: FocusField;
}

export interface EditorTopbarProps {
  onOpenSettings: (field?: FocusField) => void;
}

export interface FieldLabelProps {
  children: React.ReactNode;
}

export interface ModCardProps {
  id?: string;
  title: string;
  author: string;
  downloads: string;
  updated: string;
  summary: string;
  icon?: string;
  categories?: string[];
  isInstalled?: boolean;
  provider?: "modrinth" | "curseforge" | "custom";
}

// ==========================================
// 3. Modpack Schema (V1.0 Standard Proposal)
// ==========================================

export interface ModpackFileHashes {
  sha1?: string;
  sha256?: string;
  sha512?: string;
  md5?: string;
}

export interface ModpackEnvironment {
  client?: "required" | "optional" | "unsupported";
  server?: "required" | "optional" | "unsupported";
}

export interface ModpackFileEntry {
  path: string;
  hashes: ModpackFileHashes;
  downloads: string[];
  fileSize?: number;
  env?: ModpackEnvironment;
}

export interface ModpackManifest {
  formatVersion: 1;
  id: string;
  name: string;
  version: string;
  game: "minecraft";
  gameVersion: string;
  loader: {
    id: string;
    version?: string;
  };
  summary?: string;
  author?: string;
  files: ModpackFileEntry[];
  overridesPath?: string;
}
