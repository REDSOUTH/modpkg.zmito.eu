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

  // Handle package imported from JSON file (.modpkg.json or legacy package.json)
  useEffect(() => {
    const parsed = (location.state as any)?.parsedJson;
    if (parsed) {
      const metadata = parsed.metadata || {};
      const dependencies = parsed.dependencies || {};

      const packName = metadata.name || parsed.name || "Imported Modpack";
      const mcVersion = dependencies.minecraft || parsed.mcVersion || parsed.minecraftVersion || "1.20.4";
      const loader = (typeof dependencies.loader === "object" ? dependencies.loader.type : dependencies.loader) || parsed.loader || "fabric";
      const id = metadata.projectId || parsed.id || `modpkg-import-${Math.random().toString(36).substring(2, 7)}`;
      const currentVersion = metadata.versionId || parsed.currentVersion || parsed.version || "v1.0.0";
      const description = metadata.description || parsed.description || "Imported package";

      createPack({
        id,
        name: packName,
        mcVersion,
        loader,
        version: currentVersion,
        description,
      });

      // 1. Process content (official schema `content` or fallback `mods`)
      const contentRoot = parsed.content || parsed.mods;
      if (contentRoot) {
        if (Array.isArray(contentRoot.modrinth)) {
          contentRoot.modrinth.forEach((m: any) => {
            if (m && m.id) {
              addContent({
                id: m.id,
                name: m.name || m.id,
                provider: "modrinth",
                iconUrl: m.iconUrl || "",
                versionId: m.versionId || "latest",
                versionName: m.versionName || m.versionId || "Latest",
                contentType: m.type || m.contentType || "mod",
                downloadUrl: m.url,
              });
            }
          });
        }
        if (Array.isArray(contentRoot.curseforge)) {
          contentRoot.curseforge.forEach((m: any) => {
            if (m && m.id) {
              addContent({
                id: String(m.id),
                name: m.name || String(m.id),
                provider: "curseforge",
                iconUrl: m.iconUrl || "",
                versionId: String(m.fileId || "latest"),
                versionName: m.fileName || "Latest",
                contentType: m.type || m.contentType || "mod",
                downloadUrl: m.url,
              });
            }
          });
        }
        const customItems = contentRoot.custom || contentRoot.directUrls;
        if (Array.isArray(customItems)) {
          customItems.forEach((m: any) => {
            if (m && (m.url || m.name)) {
              addContent({
                id: m.id || `custom-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
                name: m.name || m.fileName || "Custom Resource",
                provider: "custom",
                iconUrl: m.iconUrl || "",
                versionId: "custom",
                versionName: "Custom URL",
                contentType: m.type || m.contentType || "mod",
                downloadUrl: m.url,
                targetPath: m.targetPath,
              });
            }
          });
        }
      } else if (Array.isArray(parsed.installedContent)) {
        // Fallback for direct installedContent array
        parsed.installedContent.forEach((item: any) => {
          if (item && item.id) addContent(item);
        });
      }

      // 2. Process official schema overrides
      if (Array.isArray(parsed.overrides)) {
        parsed.overrides.forEach((o: any) => {
          if (o && o.path) {
            const cleanPath = o.path.startsWith("/") ? o.path : `/${o.path}`;
            const filename = cleanPath.split("/").pop() || "options.txt";
            addCustomFile({
              id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
              name: filename,
              targetPath: cleanPath,
              type: o.fileType || (filename.endsWith(".json") ? "data" : filename.endsWith(".js") ? "script" : "config"),
              content: o.type === "text" || !o.type ? o.content : undefined,
              sourceUrl: o.type === "url" ? o.url : undefined,
              storageLocation: "local_browser",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
          }
        });
      } else if (Array.isArray(parsed.customFiles)) {
        // Fallback for customFiles array
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
