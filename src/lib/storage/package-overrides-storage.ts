export interface OverrideNode {
  id: string;
  name: string;
  type: "file" | "folder";
  path: string; // e.g. "config/options.txt"
  size?: string;
  children?: OverrideNode[];
  content?: string;
}

const STORAGE_KEY = "modpkg_package_overrides_v1";

const DEFAULT_TREE: OverrideNode[] = [
  {
    id: "folder-config",
    name: "config",
    type: "folder",
    path: "config",
    children: [
      { id: "file-options", name: "options.txt", type: "file", path: "config/options.txt", size: "2.4 KB" },
      { id: "file-forge", name: "forge-client.toml", type: "file", path: "config/forge-client.toml", size: "1.1 KB" },
      { id: "file-sodium", name: "sodium-options.json", type: "file", path: "config/sodium-options.json", size: "850 B" },
    ]
  },
  {
    id: "folder-kubejs",
    name: "kubejs",
    type: "folder",
    path: "kubejs",
    children: [
      {
        id: "folder-server-scripts",
        name: "server_scripts",
        type: "folder",
        path: "kubejs/server_scripts",
        children: [
          { id: "file-script1", name: "recipes.js", type: "file", path: "kubejs/server_scripts/recipes.js", size: "4.2 KB" }
        ]
      },
      {
        id: "folder-startup-scripts",
        name: "startup_scripts",
        type: "folder",
        path: "kubejs/startup_scripts",
        children: [
          { id: "file-script2", name: "custom_items.js", type: "file", path: "kubejs/startup_scripts/custom_items.js", size: "1.8 KB" }
        ]
      }
    ]
  },
  {
    id: "folder-resourcepacks",
    name: "resourcepacks",
    type: "folder",
    path: "resourcepacks",
    children: []
  },
  { id: "file-servers", name: "servers.dat", type: "file", path: "servers.dat", size: "1.2 KB" },
];

export function getPackageOverrides(): OverrideNode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse package overrides from localStorage:", e);
  }
  return DEFAULT_TREE;
}

export function savePackageOverrides(nodes: OverrideNode[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nodes));
  } catch (e) {
    console.error("Failed to save package overrides:", e);
  }
}
