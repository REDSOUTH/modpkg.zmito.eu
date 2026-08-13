import { useState, useRef } from "react";
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileCode, 
  FileText, 
  FileJson, 
  Image, 
  Archive, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  FolderPlus, 
  FilePlus, 
  Upload, 
  Trash2, 
  X, 
  Check,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ImportConfigFileDialog } from "@/components/views/import-config-file-dialog";
import { ConfigFileItem } from "@/types";
import { 
  OverrideNode, 
  getPackageOverrides, 
  savePackageOverrides 
} from "@/lib/storage/package-overrides-storage";

export function PackageFileTree() {
  const [tree, setTree] = useState<OverrideNode[]>(() => getPackageOverrides());
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "folder-config": true,
    "folder-kubejs": true,
  });

  const [newItemParentId, setNewItemParentId] = useState<string | null>(null);
  const [newItemType, setNewItemType] = useState<"file" | "folder" | null>(null);
  const [newItemName, setNewItemName] = useState<string>("");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const persistTree = (newTree: OverrideNode[]) => {
    setTree(newTree);
    savePackageOverrides(newTree);
  };

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleStartAdd = (parentId: string | null, type: "file" | "folder") => {
    setNewItemParentId(parentId);
    setNewItemType(type);
    setNewItemName("");
    if (parentId && !expandedFolders[parentId]) {
      setExpandedFolders((prev) => ({ ...prev, [parentId]: true }));
    }
  };

  const handleCreateNode = () => {
    if (!newItemName.trim() || !newItemType) return;
    const name = newItemName.trim();
    const id = `${newItemType}-${Date.now()}`;

    const newNode: OverrideNode = {
      id,
      name,
      type: newItemType,
      path: name,
      size: newItemType === "file" ? "1.0 KB" : undefined,
      children: newItemType === "folder" ? [] : undefined,
    };

    if (newItemParentId === null) {
      // Root creation
      persistTree([...tree, newNode]);
    } else {
      // Recursive insertion into parent folder
      const insertRecursive = (nodes: OverrideNode[]): OverrideNode[] => {
        return nodes.map((node) => {
          if (node.id === newItemParentId && node.type === "folder") {
            return {
              ...node,
              children: [...(node.children || []), { ...newNode, path: `${node.path}/${name}` }],
            };
          }
          if (node.children) {
            return { ...node, children: insertRecursive(node.children) };
          }
          return node;
        });
      };
      persistTree(insertRecursive(tree));
    }

    setNewItemParentId(null);
    setNewItemType(null);
    setNewItemName("");
  };

  const handleDeleteNode = (id: string) => {
    const deleteRecursive = (nodes: OverrideNode[]): OverrideNode[] => {
      return nodes
        .filter((node) => node.id !== id)
        .map((node) => ({
          ...node,
          children: node.children ? deleteRecursive(node.children) : undefined,
        }));
    };
    persistTree(deleteRecursive(tree));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newNodes: OverrideNode[] = Array.from(files).map((f) => ({
      id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: f.name,
      type: "file",
      path: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
    }));

    persistTree([...tree, ...newNodes]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImportConfigFile = (item: ConfigFileItem, overridePath: string) => {
    // Build a flat path from the overridePath (strip leading /)
    const cleanPath = overridePath.replace(/^\//, "");
    const filename = cleanPath.split("/").pop() ?? item.name;
    const newNode: OverrideNode = {
      id: `file-${Date.now()}`,
      name: filename,
      type: "file",
      path: cleanPath,
      size: item.content ? `${(item.content.length / 1024).toFixed(1)} KB` : undefined,
    };
    persistTree([...tree, newNode]);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split(".").pop()?.toLowerCase();
    if (ext === "json") return <FileJson className="w-4 h-4 text-amber-400 shrink-0" />;
    if (ext === "js" || ext === "ts") return <FileCode className="w-4 h-4 text-amber-300 shrink-0" />;
    if (ext === "txt" || ext === "cfg" || ext === "toml" || ext === "properties") return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
    if (ext === "png" || ext === "jpg" || ext === "svg") return <Image className="w-4 h-4 text-purple-400 shrink-0" />;
    if (ext === "zip" || ext === "tar" || ext === "gz" || ext === "jar") return <Archive className="w-4 h-4 text-emerald-400 shrink-0" />;
    return <File className="w-4 h-4 text-white/50 shrink-0" />;
  };

  const renderTreeNodes = (nodes: OverrideNode[], level: number = 0) => {
    return nodes.map((node) => {
      const isFolder = node.type === "folder";
      const isExpanded = expandedFolders[node.id];

      return (
        <div key={node.id} className="flex flex-col">
          <div 
            className={`group flex items-center justify-between px-2 py-1.5 rounded-xl hover:bg-[#1E1E1E] transition-all cursor-pointer select-none text-xs ${
              level > 0 ? "ml-3 border-l border-white/5 pl-2" : ""
            }`}
            onClick={() => isFolder && toggleFolder(node.id)}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {isFolder ? (
                <>
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-white/40 shrink-0" />
                  )}
                  {isExpanded ? (
                    <FolderOpen className="w-4 h-4 text-[#FE5000] shrink-0" />
                  ) : (
                    <Folder className="w-4 h-4 text-[#FE5000]/80 shrink-0" />
                  )}
                </>
              ) : (
                <>
                  <span className="w-3.5 shrink-0" />
                  {getFileIcon(node.name)}
                </>
              )}

              <span className={`truncate font-medium ${isFolder ? "text-white font-semibold" : "text-white/80"}`}>
                {node.name}
              </span>
            </div>

            {/* Hover Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
              {isFolder && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartAdd(node.id, "file");
                    }}
                    title="Add file inside"
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    <FilePlus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartAdd(node.id, "folder");
                    }}
                    title="Add folder inside"
                    className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-md transition-colors"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                  </button>
                </>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteNode(node.id);
                }}
                title="Delete"
                className="p-1 text-red-400/70 hover:text-red-400 hover:bg-white/10 rounded-md transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Render children if folder is expanded */}
          {isFolder && isExpanded && node.children && node.children.length > 0 && (
            <div className="flex flex-col mt-0.5">
              {renderTreeNodes(node.children, level + 1)}
            </div>
          )}

          {/* Inline creation input inside this folder */}
          {isFolder && isExpanded && newItemParentId === node.id && (
            <div className={`flex items-center gap-2 px-2 py-1.5 mt-1 rounded-xl bg-[#1E1E1E] ${level > 0 ? "ml-5" : "ml-2"}`}>
              {newItemType === "folder" ? <Folder className="w-4 h-4 text-[#FE5000] shrink-0" /> : <File className="w-4 h-4 text-blue-400 shrink-0" />}
              <Input
                autoFocus
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateNode();
                  if (e.key === "Escape") setNewItemParentId(null);
                }}
                placeholder={newItemType === "folder" ? "folder_name" : "filename.txt"}
                className="h-7 text-xs bg-black text-white border-white/10 px-2 rounded-lg focus-visible:ring-0 focus-visible:border-[#FE5000]"
              />
              <button onClick={handleCreateNode} className="p-1 text-emerald-400 hover:bg-white/10 rounded-md">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setNewItemParentId(null)} className="p-1 text-white/50 hover:bg-white/10 rounded-md">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col gap-4">
      
      {/* Top Toolbar */}
      <div className="flex flex-col gap-2 bg-[#1E1E1E]/50 p-3 rounded-2xl border border-white/5">
        <div className="flex items-center justify-between pl-1 pr-1">
          <span className="text-[11px] font-bold text-white/40 uppercase tracking-widest">
            Package Directory
          </span>
          <span className="text-[10px] text-white/40 font-mono">/overrides</span>
        </div>

        <div className="grid grid-cols-3 gap-1.5 mt-1">
          <Button
            variant="ghost"
            onClick={() => handleStartAdd(null, "file")}
            className="h-8 text-xs font-semibold text-white/70 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-2 gap-1 border border-white/5"
          >
            <FilePlus className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <span>+ File</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => handleStartAdd(null, "folder")}
            className="h-8 text-xs font-semibold text-white/70 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-2 gap-1 border border-white/5"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#FE5000] shrink-0" />
            <span>+ Folder</span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => fileInputRef.current?.click()}
            className="h-8 text-xs font-semibold text-white/70 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-2 gap-1 border border-white/5"
          >
            <Upload className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Upload</span>
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
          <Button
            variant="ghost"
            onClick={() => setIsImportDialogOpen(true)}
            className="col-span-3 h-8 text-xs font-semibold text-white/70 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl px-2 gap-1.5 border border-white/5"
          >
            <Download className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Import Custom File</span>
          </Button>
        </div>
      </div>

      {/* Root creation input */}
      {newItemParentId === null && newItemType && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-[#1E1E1E] border border-white/10">
          {newItemType === "folder" ? <Folder className="w-4 h-4 text-[#FE5000] shrink-0" /> : <File className="w-4 h-4 text-blue-400 shrink-0" />}
          <Input
            autoFocus
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreateNode();
              if (e.key === "Escape") setNewItemType(null);
            }}
            placeholder={newItemType === "folder" ? "folder_name" : "filename.txt"}
            className="h-7 text-xs bg-black text-white border-white/10 px-2 rounded-lg focus-visible:ring-0 focus-visible:border-[#FE5000]"
          />
          <button onClick={handleCreateNode} className="p-1 text-emerald-400 hover:bg-white/10 rounded-md">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setNewItemType(null)} className="p-1 text-white/50 hover:bg-white/10 rounded-md">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Directory File Tree View */}
      <div className="flex flex-col gap-1">
        {tree.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/40">
            Directory is empty. Create a folder or upload a file.
          </div>
        ) : (
          renderTreeNodes(tree)
        )}
      </div>

      {/* Import Config File Dialog */}
      <ImportConfigFileDialog
        isOpen={isImportDialogOpen}
        onClose={() => setIsImportDialogOpen(false)}
        onImport={handleImportConfigFile}
      />

    </div>
  );
}
