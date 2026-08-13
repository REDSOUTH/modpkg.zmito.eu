import { CustomFileItem, CustomFileType, ConfigFileItem, ConfigFileType } from "@/types";

const STORAGE_KEY = "modpkg_config_file_items";

const INITIAL_CONFIG_FILES: CustomFileItem[] = [
  {
    id: "cfg-options-1",
    name: "My Graphics Settings",
    targetPath: "/options.txt",
    type: "config",
    content: `# Minecraft Options\ngamma:1.0\nrenderDistance:12\nfancyGraphics:true\nao:2\nfullscreen:false`,
    storageLocation: "local_browser",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "cfg-kubejs-1",
    name: "Custom KubeJS Recipes",
    targetPath: "/kubejs/server_scripts/custom_recipes.js",
    type: "script",
    content: `// KubeJS Custom Recipes\nServerEvents.recipes(event => {\n  // Add custom recipes here\n});`,
    storageLocation: "local_browser",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function getCustomFileItems(): CustomFileItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CONFIG_FILES));
      return INITIAL_CONFIG_FILES;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to load custom file items", e);
    return INITIAL_CONFIG_FILES;
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

export const CUSTOM_FILE_TYPES: { value: CustomFileType; label: string }[] = [
  { value: "config", label: "Config" },
  { value: "script", label: "Script" },
  { value: "data", label: "Data" },
  { value: "image", label: "Image" },
  { value: "other", label: "Other" },
];
export const CONFIG_FILE_TYPES = CUSTOM_FILE_TYPES;

export function detectFileType(filename: string): CustomFileType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["cfg", "toml", "txt", "ini", "conf", "properties"].includes(ext)) return "config";
  if (["js", "ts", "lua", "py", "sh", "zs"].includes(ext)) return "script";
  if (["json", "yaml", "yml", "xml", "nbt", "dat"].includes(ext)) return "data";
  if (["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext)) return "image";
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
