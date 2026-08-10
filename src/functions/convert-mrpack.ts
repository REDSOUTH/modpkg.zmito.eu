import JSZip from "jszip";

export interface MrpackModEntry {
  filename: string;
  url: string;
}

export default async function convertMrpack(
  mods: MrpackModEntry[],
  overrides: Record<string, Blob | string>,
  packName: string,
  setModsDownloaded: (count: number) => void,
  setOpenDialog: (open: boolean) => void
): Promise<void> {
  const zip = new JSZip();
  setModsDownloaded(0);
  let downloadedMods = 0;
  const fileName = packName.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  try {
    for (const mod of mods) {
      const response = await fetch(mod.url);
      const blob = await response.blob();

      setModsDownloaded(downloadedMods++);
      
      zip.file(mod.filename, blob);
    }
    
    for (const [path, file] of Object.entries(overrides)) {
      zip.file(path, file);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const blobUrl = URL.createObjectURL(content);

    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = `modpkg-${fileName}.zip`;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (error) {
    console.error('Error downloading and zipping mods:', error);
  } finally {
    setOpenDialog(false);
    setModsDownloaded(-1);
  }
}
