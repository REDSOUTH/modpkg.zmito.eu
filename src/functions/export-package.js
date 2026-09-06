export function generateModpkgExport(packSettings, installedContent, customFiles) {
  const modrinthContent = (installedContent || [])
    .filter(i => i.provider === "modrinth")
    .map(i => ({
      id: i.id,
      name: i.name,
      type: i.contentType || "mod",
      versionId: i.versionId || "latest",
      versionName: i.versionName || undefined,
      fileName: i.fileName || (i.contentType === "resourcepack" ? `${i.name}.zip` : `${i.name}.jar`),
      url: i.downloadUrl || undefined,
      hashes: i.hashes || undefined,
    }));

  const curseforgeContent = (installedContent || [])
    .filter(i => i.provider === "curseforge")
    .map(i => ({
      id: i.id,
      name: i.name,
      type: i.contentType || "mod",
      fileId: i.versionId || "latest",
      fileName: i.fileName || (i.contentType === "resourcepack" ? `${i.name}.zip` : `${i.name}.jar`),
      url: i.downloadUrl || undefined,
      hashes: i.hashes || undefined,
    }));

  const customContent = (installedContent || [])
    .filter(i => i.provider === "custom" || i.provider === "local_override")
    .map(i => {
      const fallbackExt = i.contentType === "resourcepack" ? "zip" : "jar";
      const fallbackFilename = i.downloadUrl
        ? i.downloadUrl.split("/").pop()?.split("?")[0] || `${i.name}.${fallbackExt}`
        : `${i.name}.${fallbackExt}`;
      return {
        id: i.id,
        name: i.name,
        type: i.contentType || "mod",
        fileName: i.fileName || fallbackFilename,
        url: i.downloadUrl || "",
        targetPath: i.targetPath || (i.contentType === "resourcepack" ? `resourcepacks/${fallbackFilename}` : `mods/${fallbackFilename}`),
        hashes: i.hashes || undefined,
      };
    });

  const overrides = (customFiles || []).map(f => {
    const cleanPath = f.targetPath?.startsWith("/") ? f.targetPath.slice(1) : (f.targetPath || f.name);
    if (f.sourceUrl) {
      return {
        path: cleanPath,
        type: "url",
        url: f.sourceUrl,
        fileType: f.type,
      };
    }
    return {
      path: cleanPath,
      type: "text",
      content: f.content || "",
      fileType: f.type,
    };
  });

  const exportFile = {
    formatVersion: 1,
    generator: "MODPKG Web",
    exportedAt: new Date().toISOString(),
    metadata: {
      projectId: packSettings.id,
      versionId: packSettings.currentVersion || "v1.0.0",
      name: packSettings.name,
      description: packSettings.description || "",
      author: packSettings.author || "Zmito",
      authorId: packSettings.authorId || "usuario-redsouth-uuid",
    },
    dependencies: {
      minecraft: packSettings.mcVersion,
      loader: {
        type: packSettings.loader,
        version: packSettings.loaderVersion || "latest",
      },
    },
    content: {
      modrinth: modrinthContent,
      curseforge: curseforgeContent,
      custom: customContent,
    },
    overrides,
  };

  return exportFile;
}

import { getPackData } from "@/lib/storage/package-storage";

export function getSafePackageId(packSettings) {
  return (packSettings?.slug || packSettings?.name || packSettings?.id || "modpack")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");
}

export function generateModpkgProjectExport(packSettings, installedContent, customFiles) {
  const packId = packSettings?.id || "default";
  const packData = getPackData(packId);
  const currentVersion = packSettings.currentVersion || "v1.0.0";

  const releases = { ...(packData?.releases || {}) };
  releases[currentVersion] = {
    releaseId: currentVersion,
    minecraft: packSettings.mcVersion,
    loader: {
      type: packSettings.loader,
      version: packSettings.loaderVersion || "latest",
    },
    installedContent: installedContent || [],
    customFiles: customFiles || [],
    publishedAt: releases[currentVersion]?.publishedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Ensure every version in packSettings.versions has its release data
  (packSettings.versions || [currentVersion]).forEach((ver) => {
    if (!releases[ver]) {
      releases[ver] = {
        releaseId: ver,
        minecraft: packSettings.mcVersion,
        loader: {
          type: packSettings.loader,
          version: packSettings.loaderVersion || "latest",
        },
        installedContent: ver === currentVersion ? (installedContent || []) : [],
        customFiles: ver === currentVersion ? (customFiles || []) : [],
        publishedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }
  });

  return {
    formatVersion: 1,
    generator: "MODPKG Web",
    exportedAt: new Date().toISOString(),
    project: {
      id: packSettings.id,
      name: packSettings.name,
      slug: packSettings.slug || packSettings.id,
      description: packSettings.description || "",
      author: packSettings.author || "Zmito",
      authorId: packSettings.authorId || "usuario-redsouth-uuid",
      isPublic: packSettings.isPublic ?? true,
      tags: packSettings.tags || [],
      versions: packSettings.versions || [currentVersion],
      currentVersion,
      mcVersion: packSettings.mcVersion,
      loader: packSettings.loader,
      loaderVersion: packSettings.loaderVersion || "latest",
      createdAt: packSettings.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    releases,
  };
}

export function downloadModpkgIndexFile(packSettings, installedContent, customFiles) {
  const exportData = generateModpkgExport(packSettings, installedContent, customFiles);
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const baseName = getSafePackageId(packSettings);
  a.download = `${baseName}.mpkg.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return exportData;
}

export function downloadModpkgProjectFile(packSettings, installedContent, customFiles) {
  const exportData = generateModpkgProjectExport(packSettings, installedContent, customFiles);
  const jsonContent = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const baseName = getSafePackageId(packSettings);
  a.download = `${baseName}.mpkg-proj.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return exportData;
}

export const downloadModpkgFile = downloadModpkgIndexFile;
export default downloadModpkgIndexFile;