import { useRef, useState, ChangeEvent, DragEvent } from "react";
import svg from "../../../assets/svg";
import ImportMrpackDialog from "./import-mrpack-dialog";
import JSZip from "jszip";
import convertMrpack, { MrpackModEntry } from "../../../functions/convert-mrpack";
import notification from "../../../functions/notification";

export default function ImportMrpackInput() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const openDialogState = useState<boolean>(false);
  const [, setOpenDialog] = openDialogState;

  const [packName, setPackName] = useState<string>("Not loaded");
  const [modsToDownload, setModsToDownload] = useState<number>(0);
  const [modsDownloaded, setModsDownloaded] = useState<number>(-1);
  const [mods, setMods] = useState<MrpackModEntry[]>([]);
  const [overrides, setOverrides] = useState<Record<string, Blob>>({});

  const handlePackConvertion = () => {
    if (modsDownloaded === -1) {
      convertMrpack(mods, overrides, packName, setModsDownloaded, setOpenDialog);
    }
  };

  const processMrpack = async (selectedFile: File) => {
    if (!selectedFile.name.endsWith(".mrpack")) {
      notification.default("The selected file is not a .mrpack file");
      return;
    }

    try {
      const zip = await JSZip.loadAsync(selectedFile);

      const parsedOverrides: Record<string, Blob> = {};
      const overridePromises: Promise<void>[] = [];

      const overridesFolder = zip.folder("overrides");
      if (overridesFolder) {
        overridesFolder.forEach((relativePath, file) => {
          overridePromises.push(
            file.async("blob").then((content) => {
              parsedOverrides[relativePath] = content;
            })
          );
        });
      }

      await Promise.all(overridePromises);

      const modrinthIndexFile = zip.file('modrinth.index.json');
      if (modrinthIndexFile) {
        const modrinthIndexText = await modrinthIndexFile.async('text');
        const parsedIndex = JSON.parse(modrinthIndexText);
        const parsedMods: MrpackModEntry[] = (parsedIndex.files || []).map((item: any) => ({
          url: item.downloads[0],
          filename: item.path
        }));

        setPackName(parsedIndex.name || "Modpack");
        setModsToDownload(parsedMods.length);
        setOpenDialog(true);
        setOverrides(parsedOverrides);
        setMods(parsedMods);
      }
    } catch (error) {
      console.log('Error reading file:', error);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      await processMrpack(selectedFile);
    }
  };
  
  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };
  
  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      processMrpack(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <label
        className="h-option"
        htmlFor="input-mrpack"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {svg.import}
        <p>Import .mrpack</p>
      </label>
      <input type="file" name="" id="input-mrpack" accept="application/MRPACK" hidden ref={fileInputRef} onChange={handleFileSelect} />
      <ImportMrpackDialog
        openDialogState={openDialogState}
        packName={packName}
        modsToDownload={modsToDownload}
        modsDownloaded={modsDownloaded}
        handlePackConvertion={handlePackConvertion}
      />
    </>
  );
}
