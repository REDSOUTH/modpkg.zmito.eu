import JSZip from 'jszip';
import notification from './notification';
import i18n from '@/i18n';

export interface DlPackageMod {
  id: string;
  name?: string;
}

export default async function dlpackage(
  selectedMods: DlPackageMod[],
  setDownloadedMods: (count: number) => void,
  version: string,
  loader: string
): Promise<void> {
  const zip = new JSZip();
  const selectedModIds = selectedMods.map(mod => mod.id);
  console.log("Downloading mods:", selectedModIds);
    
  const notFoundMods: string[] = [];
  let downloadedMods = 0;
  setDownloadedMods(0);

  try {
    for (const modSlug of selectedModIds) {
      const versionsResponse = await fetch(`https://api.modrinth.com/v2/project/${modSlug}/version`);
      const versionsData = await versionsResponse.json();
      const latestVersion = versionsData.find((ver: any) => {
        return ver.loaders.includes(loader) && ver.game_versions.includes(version);
      });
      if (latestVersion) {
        const latestFile = latestVersion.files.find((file: any) => file.primary);

        const response = await fetch(latestFile.url);
        const blob = await response.blob();
        
        setDownloadedMods(downloadedMods++);

        zip.file(latestFile.filename, blob);
      } else {
        console.warn(`No compatible version found for mod ${modSlug}`);
        notFoundMods.push(modSlug);
      }
    }

    const content = await zip.generateAsync({ type: "blob" });
    const blobUrl = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = 'mods-package.zip';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading and zipping mods:', error);
  } finally {
    setDownloadedMods(-1);
    if (notFoundMods.length > 0) {
      notification.warn(i18n.t("toast.noCompatibleVersionMods", { mods: notFoundMods.join(', ') }), true);
    }
  }
}
