import { useEffect, useState } from "react";
import EditorSidebar from "./components/editor-sidebar";
import SelectedDock from "./components/selected-dock";
import ModGrid from "./components/mod-grid";
import EditorTopbar from "./components/editor-topbar";
import PackSettingsModal from "./components/pack-settings-modal";
import { PackProvider } from "@/context/pack-context";
import { FocusField } from "@/types";

export default function EditorPage() {
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [focusField, setFocusField] = useState<FocusField>(null);
  const [contentType, setContentType] = useState<string>("mods");
  
  // Lifted state
  const [provider, setProvider] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedEnvironments, setSelectedEnvironments] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>("relevance");

  const handleOpenSettings = (field: FocusField = null) => {
    setFocusField(field);
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

  return (
    <>
      {/* Fixed topbar always at viewport top */}
      <EditorTopbar onOpenSettings={handleOpenSettings} />

      <div className="flex flex-col w-full max-w-[1920px] mx-auto bg-black min-h-screen">
        
        <div className="flex flex-1 min-w-0 relative">
          <EditorSidebar 
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
          <SelectedDock />
        </div>

        <PackSettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => { setIsSettingsOpen(false); setFocusField(null); }} 
          focusField={focusField}
        />
      </div>
    </>
  );
}
