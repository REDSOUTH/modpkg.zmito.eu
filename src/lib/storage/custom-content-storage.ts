import { CustomContentItem } from "@/types";
import { getPackData, savePackData, GLOBAL_CUSTOM_CONTENT_KEY } from "./package-storage";

const STORAGE_KEY = GLOBAL_CUSTOM_CONTENT_KEY;

export function getCustomContentItems(): CustomContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Failed to load custom content items", e);
    return [];
  }
}

function notifyCustomStorageChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("modpkg-custom-storage-changed"));
  }
}

export function saveCustomContentItem(item: Omit<CustomContentItem, "id" | "createdAt">): CustomContentItem {
  const items = getCustomContentItems();
  const newItem: CustomContentItem = {
    ...item,
    id: `custom-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newItem, ...items];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyCustomStorageChanged();
  return newItem;
}

export function deleteCustomContentItem(id: string): void {
  const items = getCustomContentItems();
  const updated = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  notifyCustomStorageChanged();
}

export function updateCustomContentItem(id: string, updates: Partial<CustomContentItem>): CustomContentItem | null {
  const items = getCustomContentItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  notifyCustomStorageChanged();
  return items[index];
}

export function getHiddenCustomItemIds(packId: string): string[] {
  try {
    const raw = localStorage.getItem(`modpkg_hidden_custom_${packId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function hideCustomItemForPack(packId: string, itemId: string): void {
  try {
    const current = getHiddenCustomItemIds(packId);
    if (!current.includes(itemId)) {
      const updated = [...current, itemId];
      localStorage.setItem(`modpkg_hidden_custom_${packId}`, JSON.stringify(updated));
      notifyCustomStorageChanged();
    }
  } catch (e) {
    console.error("Failed to hide custom item for pack", e);
  }
}

// Package-exclusive custom content storage (stored inside per-modpkg JSON object: modpkg_pack_${packId})
export function getPackageCustomContentItems(packId: string): CustomContentItem[] {
  const packData = getPackData(packId);
  return packData.customContent || [];
}

export function savePackageCustomContentItem(packId: string, item: Omit<CustomContentItem, "id" | "createdAt">): CustomContentItem {
  const packData = getPackData(packId);
  const newItem: CustomContentItem = {
    ...item,
    id: `custom-pkg-${Math.random().toString(36).substring(2, 9)}`,
    createdAt: new Date().toISOString(),
  };
  packData.customContent = [newItem, ...(packData.customContent || [])];
  savePackData(packId, packData);
  notifyCustomStorageChanged();
  return newItem;
}

export function updatePackageCustomContentItem(packId: string, id: string, updates: Partial<CustomContentItem>): CustomContentItem | null {
  const packData = getPackData(packId);
  const items = packData.customContent || [];
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates };
  packData.customContent = items;
  savePackData(packId, packData);
  notifyCustomStorageChanged();
  return items[index];
}

export function deletePackageCustomContentItem(packId: string, id: string): void {
  const packData = getPackData(packId);
  packData.customContent = (packData.customContent || []).filter(i => i.id !== id);
  savePackData(packId, packData);
  notifyCustomStorageChanged();
}
