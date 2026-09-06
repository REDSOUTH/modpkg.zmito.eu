import { PackSettings, InstalledItem, CustomFileItem, ModpkgExportFile } from "@/types";

export function getSafePackageId(packSettings: PackSettings): string;
export function generateModpkgExport(
  packSettings: PackSettings,
  installedContent?: InstalledItem[],
  customFiles?: CustomFileItem[]
): ModpkgExportFile;
export function generateModpkgProjectExport(
  packSettings: PackSettings,
  installedContent?: InstalledItem[],
  customFiles?: CustomFileItem[]
): any;
export function downloadModpkgIndexFile(
  packSettings: PackSettings,
  installedContent?: InstalledItem[],
  customFiles?: CustomFileItem[]
): ModpkgExportFile;
export function downloadModpkgProjectFile(
  packSettings: PackSettings,
  installedContent?: InstalledItem[],
  customFiles?: CustomFileItem[]
): any;
