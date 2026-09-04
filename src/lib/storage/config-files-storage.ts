import { CustomFileItem, CustomFileType, ConfigFileItem, ConfigFileType } from "@/types";
import { getPackData, savePackData, GLOBAL_CUSTOM_FILES_KEY } from "./package-storage";

const STORAGE_KEY = GLOBAL_CUSTOM_FILES_KEY;

export function getCustomFileItems(): CustomFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom file items", e);
    return [];
  }
}
export const getConfigFileItems = getCustomFileItems;

export function saveCustomFileItem(
  payload: Omit<CustomFileItem, "id" | "createdAt" | "updatedAt">
): CustomFileItem {
  const items = getCustomFileItems();
  const now = new Date().toISOString();
  const newItem: CustomFileItem = {
    ...payload,
    id: `cfg-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify([newItem, ...items]));
  return newItem;
}
export const saveConfigFileItem = saveCustomFileItem;

export function updateCustomFileItem(
  id: string,
  updates: Partial<Omit<CustomFileItem, "id" | "createdAt">>
): CustomFileItem | null {
  const items = getCustomFileItems();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items[index];
}
export const updateConfigFileItem = updateCustomFileItem;

export function deleteCustomFileItem(id: string): void {
  const items = getCustomFileItems().filter((i) => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}
export const deleteConfigFileItem = deleteCustomFileItem;

// Package-exclusive custom files storage (stored inside per-modpkg JSON object: modpkg_pack_${packId})
export function getPackageCustomFileItems(packId: string): CustomFileItem[] {
  const packData = getPackData(packId);
  return packData.customFiles || [];
}

export function savePackageCustomFileItem(
  packId: string,
  payload: Omit<CustomFileItem, "id" | "createdAt" | "updatedAt">
): CustomFileItem {
  const packData = getPackData(packId);
  const now = new Date().toISOString();
  const newItem: CustomFileItem = {
    ...payload,
    id: `cfg-pkg-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  packData.customFiles = [newItem, ...(packData.customFiles || [])];
  savePackData(packId, packData);
  return newItem;
}

export function updatePackageCustomFileItem(
  packId: string,
  id: string,
  updates: Partial<CustomFileItem>
): CustomFileItem | null {
  const packData = getPackData(packId);
  const items = packData.customFiles || [];
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates, updatedAt: new Date().toISOString() };
  packData.customFiles = items;
  savePackData(packId, packData);
  return items[index];
}

export function deletePackageCustomFileItem(packId: string, id: string): void {
  const packData = getPackData(packId);
  packData.customFiles = (packData.customFiles || []).filter(i => i.id !== id);
  savePackData(packId, packData);
}

export const CUSTOM_FILE_TYPES: { value: CustomFileType; label: string }[] = [
  { value: "config", label: "Config" },
  { value: "script", label: "Script" },
  { value: "data", label: "Data" },
  { value: "multimedia", label: "Multimedia" },
  { value: "other", label: "Other" },
];
export const CONFIG_FILE_TYPES = CUSTOM_FILE_TYPES;

export function detectFileType(filename: string): CustomFileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["cfg", "toml", "txt", "ini", "conf", "properties"].includes(ext)) return "config";
  if (["js", "ts", "lua", "py", "sh", "zs"].includes(ext)) return "script";
  if (["json", "yaml", "yml", "xml", "nbt", "dat"].includes(ext)) return "data";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg", "mp4", "webm", "mp3", "wav", "ogg"].includes(ext)) return "multimedia";
  return "other";
}

export function detectMonacoLanguage(targetPath: string): string {
  const ext = targetPath.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    js: "javascript", ts: "typescript", json: "json",
    lua: "lua", py: "python", sh: "shell",
    toml: "toml", yaml: "yaml", yml: "yaml",
    xml: "xml", zs: "javascript", md: "markdown",
  };
  return map[ext] ?? "plaintext";
}
