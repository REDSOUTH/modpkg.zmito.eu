import { useRef, ChangeEvent, DragEvent } from "react";
import { useNavigate } from "react-router-dom";
import svg from "../../assets/svg";

export default function ImportPackageInput() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsedJson = JSON.parse(text);
        navigate('/editor', { state: { parsedJson } });
      } catch (error) {
        console.log('Error reading JSON:', error);
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
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
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
        className="h-option"
        htmlFor="input-file"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {svg.import}
        <p>Import Package</p>
      </label>
      <input type="file" name="" id="input-file" accept="application/JSON" hidden ref={fileInputRef} onChange={handleFileSelect} />
    </>
  );
}
