import { CustomContentItem } from "@/types";

const STORAGE_KEY = "modpkg_custom_content_items";

const INITIAL_CUSTOM_ITEMS: CustomContentItem[] = [
  {
    id: "custom-optifine-1204",
    name: "OptiFine HD U I7",
    contentType: "mod",
    downloadUrl: "https://optifine.net/adloadx?f=OptiFine_1.20.4_HD_U_I7.jar",
    author: "sp614x",
    mcVersion: "1.20.4",
    loader: "forge",
    storageLocation: "local_browser",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "custom-shader-complementary",
    name: "Complementary Reimagined",
    contentType: "shader",
    downloadUrl: "https://example.com/shaders/ComplementaryReimagined_r5.1.1.zip",
    author: "EminGT",
    mcVersion: "1.20.4",
    loader: "fabric",
    storageLocation: "account_cloud",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "custom-texture-faithful",
    name: "Faithful 64x Pack",
    contentType: "resourcepack",
    downloadUrl: "https://example.com/textures/Faithful_64x_1.20.zip",
    author: "Faithful Team",
    mcVersion: "1.20.4",
    loader: "all",
    storageLocation: "local_browser",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
];

export function getCustomContentItems(): CustomContentItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CUSTOM_ITEMS));
      return INITIAL_CUSTOM_ITEMS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load custom content items", e);
    return INITIAL_CUSTOM_ITEMS;
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
  return newItem;
}

export function deleteCustomContentItem(id: string): void {
  const items = getCustomContentItems();
  const updated = items.filter(i => i.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function updateCustomContentItem(id: string, updates: Partial<CustomContentItem>): CustomContentItem | null {
  const items = getCustomContentItems();
  const index = items.findIndex(i => i.id === id);
  if (index === -1) return null;
  
  items[index] = { ...items[index], ...updates };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items[index];
}
