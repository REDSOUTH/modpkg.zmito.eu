import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import EditorSidebar from "./components/editor-sidebar";
import SelectedDock from "./components/selected-dock";
import ModGrid from "./components/mod-grid";
import { CustomFilesWorkspace } from "./components/custom-files-workspace";
import EditorTopbar from "./components/editor-topbar";
import PackSettingsModal from "./components/pack-settings-modal";
import { AddConfigFileDialog } from "@/components/views/add-config-file-dialog";
import { usePack } from "@/context/pack-context";
import { FocusField } from "@/types";

export default function EditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCreatePackModalOpen, setIsCreatePackModalOpen, customFiles, createPack, addContent, addCustomFile } = usePack();
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [focusField, setFocusField] = useState<FocusField>(null);
  const [contentType, setContentType] = useState<string>("mods");
  
  // View mode: "browse" (Browse & Add Content) or "overrides" (Overrides & Custom Files)
  const [activeView, setActiveView] = useState<"browse" | "overrides">("browse");
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [isAddFileDialogOpen, setIsAddFileDialogOpen] = useState<boolean>(false);

  // Lifted state for browse mode
  const [provider, setProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("relevance");

  const [isSettingsCreateMode, setIsSettingsCreateMode] = useState<boolean>(false);

  const handleOpenSettings = (field: FocusField = null, isCreate = false) => {
    setFocusField(field);
    setIsSettingsCreateMode(isCreate);
    setIsSettingsOpen(true);
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedEnvironments([]);
  };

  useEffect(() => {
    document.title = "MODPKG — Editor";
  }, []);

  // Handle package imported from JSON file
  useEffect(() => {
    const parsed = (location.state as any)?.parsedJson;
    if (parsed) {
      const packName = parsed.name || "Imported Modpack";
      const mcVersion = parsed.mcVersion || parsed.minecraftVersion || "1.20.4";
      const loader = parsed.loader || "fabric";
      const id = parsed.id || `modpkg-import-${Math.random().toString(36).substring(2, 7)}`;
      const currentVersion = parsed.currentVersion || parsed.version || "v1.0.0";
      const description = parsed.description || "Imported package";

      createPack({
        id,
        name: packName,
        mcVersion,
        loader,
        version: currentVersion,
        description,
      });

      // Import installed content if available
      if (Array.isArray(parsed.installedContent)) {
        parsed.installedContent.forEach((item: any) => {
          if (item && item.id) addContent(item);
        });
      } else if (parsed.mods && Array.isArray(parsed.mods.modrinth)) {
        parsed.mods.modrinth.forEach((item: any) => {
          if (item && item.id) {
            addContent({
              id: item.id,
              name: item.name || item.id,
              provider: "modrinth",
              iconUrl: item.iconUrl || "",
              versionId: item.versionId || "latest",
              versionName: item.versionName || "Latest",
              contentType: item.contentType || "mod",
            });
          }
        });
      }

      // Import custom files if available
      if (Array.isArray(parsed.customFiles)) {
        parsed.customFiles.forEach((file: any) => {
          if (file && file.id) addCustomFile(file);
        });
      }

      // Clear navigation state
      navigate("/editor", { replace: true, state: {} });
    }
  }, [location.state, createPack, addContent, addCustomFile, navigate]);

  const isModalOpen = isSettingsOpen || isCreatePackModalOpen;
  const activeCreateMode = isSettingsCreateMode || isCreatePackModalOpen;

  return (
    <>
      {/* Fixed topbar always at viewport top */}
      <EditorTopbar onOpenSettings={handleOpenSettings} />

      <div className="flex flex-col w-full max-w-[1920px] mx-auto bg-black min-h-[calc(100vh-121px)]">
        
        <div className="flex flex-1 min-w-0 relative">
          <EditorSidebar 
            activeView={activeView}
            setActiveView={setActiveView}
            selectedFileId={selectedFileId}
            onSelectFile={setSelectedFileId}
            contentType={contentType} 
            setContentType={setContentType} 
            provider={provider}
            setProvider={setProvider}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedEnvironments={selectedEnvironments}
            setSelectedEnvironments={setSelectedEnvironments}
          />

          {activeView === "browse" ? (
            <ModGrid 
              contentType={contentType} 
              provider={provider}
              searchQuery={searchQuery}
              selectedCategories={selectedCategories}
              selectedEnvironments={selectedEnvironments}
              sortBy={sortBy}
              setSortBy={setSortBy}
              onClearFilters={handleClearFilters}
              onOpenSettings={() => handleOpenSettings(null)}
              onCategoryClick={(cat) => setSelectedCategories(prev => prev.includes(cat) ? prev : [...prev, cat])}
            />
          ) : (
            <CustomFilesWorkspace
              selectedFileId={selectedFileId}
              onSelectFile={setSelectedFileId}
              onOpenAddDialog={() => setIsAddFileDialogOpen(true)}
            />
          )}

          <SelectedDock />
        </div>

        <PackSettingsModal 
          isOpen={isModalOpen} 
          isCreateMode={activeCreateMode}
          onClose={() => { 
            setIsSettingsOpen(false); 
            setIsCreatePackModalOpen(false);
            setIsSettingsCreateMode(false);
            setFocusField(null); 
          }} 
          focusField={focusField}
        />

        {/* Modal for adding a new Custom File in Editor */}
        <AddConfigFileDialog
          isOpen={isAddFileDialogOpen}
          onClose={() => setIsAddFileDialogOpen(false)}
          context="editor"
          defaultAddToPackage={true}
          defaultSaveAsCommon={true}
          onAdded={(item) => {
            setSelectedFileId(item.id);
            setIsAddFileDialogOpen(false);
          }}
        />
      </div>
    </>
  );
}
