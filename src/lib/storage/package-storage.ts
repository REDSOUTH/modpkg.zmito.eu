import { PackSettings, InstalledItem, CustomContentItem, CustomFileItem } from "@/types";

export const PACKAGES_INDEX_KEY = "modpkg_packages_index";
export const GLOBAL_CUSTOM_CONTENT_KEY = "modpkg_custom_content_global";
export const GLOBAL_CUSTOM_FILES_KEY = "modpkg_custom_files_global";

export interface PackExclusiveData {
  id: string;
  installedContent: InstalledItem[];
  customContent: CustomContentItem[];
  customFiles: CustomFileItem[];
}

export function getPackagesIndex(): PackSettings[] {
  try {
    const raw = localStorage.getItem(PACKAGES_INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load packages index", e);
    return [];
  }
}

export function savePackagesIndex(packages: PackSettings[]): void {
  try {
    localStorage.setItem(PACKAGES_INDEX_KEY, JSON.stringify(packages));
  } catch (e) {
    console.error("Failed to save packages index", e);
  }
}

export function getPackData(packId: string): PackExclusiveData {
  try {
    const raw = localStorage.getItem(`modpkg_pack_${packId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        id: packId,
        installedContent: parsed.installedContent || [],
        customContent: parsed.customContent || [],
        customFiles: parsed.customFiles || [],
      };
    }
  } catch (e) {
    console.error(`Failed to load pack data for ${packId}`, e);
  }
  return {
    id: packId,
    installedContent: [],
    customContent: [],
    customFiles: [],
  };
}

export function savePackData(packId: string, data: PackExclusiveData): void {
  try {
    localStorage.setItem(`modpkg_pack_${packId}`, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save pack data for ${packId}`, e);
  }
}

export function deletePackStorage(packId: string): void {
  try {
    localStorage.removeItem(`modpkg_pack_${packId}`);
  } catch (e) {
    console.error(`Failed to delete pack data for ${packId}`, e);
  }
}
