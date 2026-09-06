import JSZip from "jszip";
import { InstalledItem, CustomFileItem, PackSettings } from "@/types";
import { generateModpkgExport, generateModpkgProjectExport, getSafePackageId } from "./export-package";

export interface ZipExportProgress {
  percentage: number;
  currentStep: string;
  completedItems: number;
  totalItems: number;
}

export interface FailedItemReport {
  id: string;
  name: string;
  provider: string;
  reason: string;
  url?: string;
}

export interface ExportZipOptions {
  includeVersionIndex: boolean;
  includeProjectFile: boolean;
  onProgress?: (progress: ZipExportProgress) => void;
}

export interface ExportZipResult {
  success: boolean;
  totalProcessed: number;
  failedItems: FailedItemReport[];
  fileName: string;
}

const CF_LOADER_MAP: Record<string, number> = {
  any: 0,
  forge: 1,
  cauldron: 2,
  liteloader: 3,
  fabric: 4,
  quilt: 5,
  neoforge: 6,
};

function getFolderForType(type: string): string {
  const t = (type || "").toLowerCase();
  if (t === "resourcepack" || t === "textures" || t === "resourcepacks") return "resourcepacks";
  if (t === "shader" || t === "shaders" || t === "shaderpack" || t === "shaderpacks") return "shaderpacks";
  if (t === "datapack" || t === "datapacks") return "datapacks";
  if (t === "world" || t === "worlds" || t === "save" || t === "saves") return "saves";
  return "mods";
}

async function resolveModrinthFile(
  item: InstalledItem,
  mcVersion: string,
  loader: string
): Promise<{ url: string; fileName: string }> {
  const versionId = item.versionId;
  const isSpecificVersion = versionId && versionId !== "latest" && versionId !== "latest-unstable" && versionId !== "custom";

  if (isSpecificVersion) {
    const res = await fetch(`https://api.modrinth.com/v2/version/${versionId}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status} fetching Modrinth version ${versionId}`);
    const data = await res.json();
    const file = data.files?.find((f: any) => f.primary) || data.files?.[0];
    if (!file?.url) throw new Error("No download URL found in Modrinth version");
    return { url: file.url, fileName: file.filename || `${item.name}.jar` };
  }

  // Fetch project versions
  const res = await fetch(`https://api.modrinth.com/v2/project/${item.id}/version`);
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching project versions for ${item.name}`);
  const versions: any[] = await res.json();

  const isShader = item.contentType === "shader" || item.contentType === "shaders";
  const isResourcePack = item.contentType === "resourcepack" || item.contentType === "textures";
  const isDatapack = item.contentType === "datapack" || item.contentType === "datapacks";
  const loaderCheckNeeded = !isShader && !isResourcePack && !isDatapack;

  // Filter versions by loader & MC version
  const compatible = versions.filter((v: any) => {
    const matchLoader = !loaderCheckNeeded || !loader || loader === "Any" || v.loaders?.some((l: string) => l.toLowerCase() === loader.toLowerCase());
    const matchMC = !mcVersion || mcVersion === "Any" || isShader || v.game_versions?.includes(mcVersion);
    return matchLoader && matchMC;
  });

  const candidates = compatible.length > 0 ? compatible : versions;

  let targetVersion: any;
  if (versionId === "latest-unstable") {
    // Pick the latest even if beta/alpha
    targetVersion = candidates[0];
  } else {
    // "latest" -> Pick first stable release, otherwise first available
    targetVersion = candidates.find((v: any) => v.version_type === "release") || candidates[0];
  }

  if (!targetVersion) throw new Error(`No compatible version found for ${item.name}`);

  const file = targetVersion.files?.find((f: any) => f.primary) || targetVersion.files?.[0];
  if (!file?.url) throw new Error(`No file found in target version for ${item.name}`);

  return { url: file.url, fileName: file.filename || `${item.name}.jar` };
}

async function resolveCurseForgeFile(
  item: InstalledItem,
  mcVersion: string,
  loader: string
): Promise<{ url: string; fileName: string }> {
  const apiKey = import.meta.env.VITE_CURSEFORGE_API_KEY;
  if (!apiKey) throw new Error("CurseForge API Key not configured");

  const headers = { "x-api-key": apiKey };
  const versionId = item.versionId;
  const isSpecificFile = versionId && versionId !== "latest" && versionId !== "latest-unstable" && versionId !== "custom";

  if (isSpecificFile) {
    const res = await fetch(`https://api.curseforge.com/v1/mods/${item.id}/files/${versionId}`, { headers });
    if (!res.ok) throw new Error(`CurseForge API error ${res.status}`);
    const json = await res.json();
    const data = json.data;
    if (!data?.downloadUrl) {
      throw new Error(`Curseforge file ${versionId} does not permit direct download (author restricted)`);
    }
    return { url: data.downloadUrl, fileName: data.fileName || `${item.name}.jar` };
  }

  // Fetch files list
  const url = new URL(`https://api.curseforge.com/v1/mods/${item.id}/files`);
  const isShader = item.contentType === "shader" || item.contentType === "shaders";
  const isResourcePack = item.contentType === "resourcepack" || item.contentType === "textures";
  const isDatapack = item.contentType === "datapack" || item.contentType === "datapacks";

  if (!isShader && !isResourcePack && !isDatapack && loader && loader !== "Any") {
    const modLoaderType = CF_LOADER_MAP[loader.toLowerCase()];
    if (modLoaderType !== undefined) {
      url.searchParams.set("modLoaderType", modLoaderType.toString());
    }
  }
  if (mcVersion && mcVersion !== "Any" && !isShader) {
    url.searchParams.set("gameVersion", mcVersion);
  }

  const res = await fetch(url.toString(), { headers });
  if (!res.ok) throw new Error(`CurseForge API error ${res.status}`);
  const json = await res.json();
  const files: any[] = json.data || [];

  let targetFile: any;
  if (versionId === "latest-unstable") {
    targetFile = files[0];
  } else {
    // releaseType === 1 is Release
    targetFile = files.find((f: any) => f.releaseType === 1) || files[0];
  }

  if (!targetFile) throw new Error(`No compatible file found on CurseForge for ${item.name}`);
  if (!targetFile.downloadUrl) {
    throw new Error(`CurseForge mod ${item.name} does not allow third-party API download`);
  }

  return { url: targetFile.downloadUrl, fileName: targetFile.fileName || `${item.name}.jar` };
}

export async function exportModpkgZip(
  packSettings: PackSettings,
  installedContent: InstalledItem[],
  customFiles: CustomFileItem[],
  options: ExportZipOptions
): Promise<ExportZipResult> {
  const zip = new JSZip();
  const failedItems: FailedItemReport[] = [];
  const safeId = getSafePackageId(packSettings);

  const totalContent = (installedContent || []).length;
  const totalOverrides = (customFiles || []).length;
  const totalSteps = totalContent + totalOverrides + 2; // + index/project + packaging
  let currentStepIdx = 0;

  const updateProgress = (stepName: string) => {
    currentStepIdx++;
    const percentage = Math.min(Math.round((currentStepIdx / totalSteps) * 90), 90);
    options.onProgress?.({
      percentage,
      currentStep: stepName,
      completedItems: currentStepIdx,
      totalItems: totalSteps,
    });
  };

  // 1. Process and download installed content
  for (const item of installedContent || []) {
    updateProgress(`Downloading ${item.name}...`);
    try {
      let downloadUrl = item.downloadUrl;
      let finalFileName = item.name;

      if (item.provider === "modrinth") {
        const resolved = await resolveModrinthFile(item, packSettings.mcVersion, packSettings.loader);
        downloadUrl = resolved.url;
        finalFileName = resolved.fileName;
      } else if (item.provider === "curseforge") {
        const resolved = await resolveCurseForgeFile(item, packSettings.mcVersion, packSettings.loader);
        downloadUrl = resolved.url;
        finalFileName = resolved.fileName;
      } else if (item.provider === "custom" || item.provider === "local_override") {
        if (!downloadUrl) throw new Error("No download URL provided for custom content");
        const ext = item.contentType === "resourcepack" ? "zip" : "jar";
        finalFileName = downloadUrl.split("/").pop()?.split("?")[0] || `${item.name}.${ext}`;
      }

      if (!downloadUrl) {
        throw new Error(`No valid download URL could be determined`);
      }

      const folder = getFolderForType(item.contentType);
      const targetFilePath = item.targetPath
        ? (item.targetPath.startsWith("/") ? item.targetPath.slice(1) : item.targetPath)
        : `${folder}/${finalFileName}`;

      let fetchUrl = downloadUrl;
      const isForgeCdn = downloadUrl.includes("forgecdn.net");

      if (isForgeCdn) {
        fetchUrl = `/api/download-proxy?url=${encodeURIComponent(downloadUrl)}`;
      }

      let fileRes: Response;
      try {
        fileRes = await fetch(fetchUrl);
        if (!fileRes.ok && fetchUrl !== downloadUrl) {
          // Fallback to allorigins if dev proxy fails
          fileRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(downloadUrl)}`);
        }
      } catch (fetchErr) {
        // Fallback CORS proxy
        fileRes = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(downloadUrl)}`);
      }

      if (!fileRes.ok) throw new Error(`HTTP error ${fileRes.status} downloading file`);
      const blob = await fileRes.blob();
      zip.file(targetFilePath, blob);
    } catch (err: any) {
      console.warn(`Failed to package item ${item.name}:`, err);
      failedItems.push({
        id: item.id,
        name: item.name,
        provider: item.provider,
        reason: err.message || "Unknown download error",
        url: item.downloadUrl,
      });
    }
  }

  // 2. Process and package overrides (customFiles)
  for (const file of customFiles || []) {
    updateProgress(`Packaging custom file ${file.name}...`);
    try {
      const cleanPath = file.targetPath?.startsWith("/") ? file.targetPath.slice(1) : (file.targetPath || file.name);
      if (file.sourceUrl) {
        let fetchUrl = file.sourceUrl;
        if (file.sourceUrl.includes("forgecdn.net")) {
          fetchUrl = `/api/download-proxy?url=${encodeURIComponent(file.sourceUrl)}`;
        }
        let res: Response;
        try {
          res = await fetch(fetchUrl);
          if (!res.ok && fetchUrl !== file.sourceUrl) {
            res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(file.sourceUrl)}`);
          }
        } catch {
          res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(file.sourceUrl)}`);
        }
        if (!res.ok) throw new Error(`HTTP error ${res.status} downloading override`);
        const blob = await res.blob();
        zip.file(cleanPath, blob);
      } else {
        zip.file(cleanPath, file.content ?? "");
      }
    } catch (err: any) {
      console.warn(`Failed to package custom file ${file.name}:`, err);
      failedItems.push({
        id: file.id,
        name: file.name,
        provider: "custom_file",
        reason: err.message || "Failed to include override",
        url: file.sourceUrl,
      });
    }
  }

  // 3. Optional Inclusions
  if (options.includeVersionIndex) {
    updateProgress("Generating .mpkg.json index...");
    const indexData = generateModpkgExport(packSettings, installedContent, customFiles);
    zip.file(`${safeId}.mpkg.json`, JSON.stringify(indexData, null, 2));
  }

  if (options.includeProjectFile) {
    updateProgress("Generating .mpkg-proj.json project file...");
    const projectData = generateModpkgProjectExport(packSettings, installedContent, customFiles);
    zip.file(`${safeId}.mpkg-proj.json`, JSON.stringify(projectData, null, 2));
  }

  // 4. Generate final ZIP
  options.onProgress?.({
    percentage: 92,
    currentStep: "Compressing and finalizing ZIP package...",
    completedItems: totalSteps,
    totalItems: totalSteps,
  });

  const zipBlob = await zip.generateAsync({ type: "blob" }, (metadata) => {
    const pct = 90 + Math.round(metadata.percent * 0.1);
    options.onProgress?.({
      percentage: pct,
      currentStep: `Compressing ZIP (${Math.round(metadata.percent)}%)...`,
      completedItems: totalSteps,
      totalItems: totalSteps,
    });
  });

  // 5. Trigger download
  const downloadUrl = URL.createObjectURL(zipBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  const fileName = `${safeId}.mpkg.zip`;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);

  options.onProgress?.({
    percentage: 100,
    currentStep: "Export complete!",
    completedItems: totalSteps,
    totalItems: totalSteps,
  });

  return {
    success: true,
    totalProcessed: totalContent + totalOverrides,
    failedItems,
    fileName,
  };
}
