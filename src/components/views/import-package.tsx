import { useRef, useState, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FileCode } from "lucide-react";
import { usePack } from "@/context/pack-context";
import notification from "@/functions/notification";

export default function ImportPackageInput() {
  const navigate = useNavigate();
  const { importPack } = usePack();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(text);
        } catch {
          throw new Error("Invalid JSON syntax: could not parse file contents.");
        }
        const imported = importPack(parsedJson);
        notification.default(`Imported: ${imported.name} (${imported.id})`);
        navigate("/editor");
      } catch (error: any) {
        console.error("Error reading or importing JSON:", error);
        notification.warn(error?.message || "Error importing project: Invalid file format");
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (fileInputRef.current) {
        fileInputRef.current.files = e.dataTransfer.files;
      }
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <>
      <label
        className={`h-option group relative p-6 flex flex-col items-center justify-center text-center overflow-hidden h-full transition-all ${
          isDragging ? "!outline-[#FE5000] !outline-offset-4 bg-[#FE5000]/10" : ""
        }`}
        htmlFor="input-file"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <FileCode className="w-16 h-16 mb-3.5 text-foreground group-hover:scale-105 group-hover:text-[#FE5000] transition-all duration-300" />
        <p className="text-2xl font-bold text-foreground tracking-wide mb-2 text-center w-full group-hover:text-[#FE5000] transition-colors">Import Project</p>
        <p className="text-xs text-muted-foreground max-w-[270px] leading-relaxed text-center mx-auto">
          Load an existing <span className="font-mono text-foreground/80">.mdpkg.json</span><br /> or project index file.
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-center mx-auto">
          <span className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs font-mono text-muted-foreground">.mdpkg.json</span>
          <span className="px-3 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-xs font-mono text-muted-foreground">.mpkg-proj.json</span>
        </div>
      </label>
      <input type="file" name="" id="input-file" accept=".mdpkg.json,.modpkg.json,.mpkg-proj.json,.mpkg.json,.json,application/json" hidden ref={fileInputRef} onChange={handleFileSelect} />
    </>
  );
}
