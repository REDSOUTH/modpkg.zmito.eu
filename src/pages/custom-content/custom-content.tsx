import { useState, useEffect } from "react";
import { CustomContentItem } from "@/types";
import { getCustomContentItems, deleteCustomContentItem } from "@/lib/storage/custom-content-storage";
import { CustomContentTable } from "./components/custom-content-table";
import { CustomContentTopbar } from "./components/custom-content-topbar";
import { CustomContentSidebar } from "./components/custom-content-sidebar";
import { AddCustomContentDialog } from "@/components/views/add-custom-content-dialog";
import { Button } from "@/components/ui/button";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Plus, PlusCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CustomContentPage() {
  const [items, setItems] = useState<CustomContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedLoader, setSelectedLoader] = useState<string>("all");
  const [selectedMcVersion, setSelectedMcVersion] = useState<string>("all");
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<CustomContentItem | null>(null);

  useEffect(() => {
    document.title = "MODPKG — Custom Content";
    setItems(getCustomContentItems());
  }, []);

  const handleDeleteItem = (id: string) => {
    deleteCustomContentItem(id);
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const handleAddedItem = (newItem: CustomContentItem) => {
    setItems(prev => [newItem, ...prev]);
  };

  const handleUpdatedItem = (updatedItem: CustomContentItem) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const handleStartEdit = (item: CustomContentItem) => {
    setEditingItem(item);
    setIsAddDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setEditingItem(null);
  };

  const counts = {
    all: items.length,
    mods: items.filter(i => i.contentType === "mod").length,
    textures: items.filter(i => i.contentType === "resourcepack").length,
    shaders: items.filter(i => i.contentType === "shader").length,
    datapacks: items.filter(i => i.contentType === "datapack").length,
    worlds: items.filter(i => i.contentType === "world").length,
  };

  const filteredItems = items.filter(item => {
    // Storage location filter
    if (selectedStorage === "local" && item.storageLocation !== "local_browser") return false;
    if (selectedStorage === "cloud" && item.storageLocation !== "account_cloud") return false;

    // Content type filter
    if (selectedType === "mods" && item.contentType !== "mod") return false;
    if (selectedType === "textures" && item.contentType !== "resourcepack") return false;
    if (selectedType === "shaders" && item.contentType !== "shader") return false;
    if (selectedType === "datapacks" && item.contentType !== "datapack") return false;
    if (selectedType === "worlds" && item.contentType !== "world") return false;

    // Loader filter
    if (selectedLoader !== "all") {
      if (!item.loader || (item.loader !== "Any" && !item.loader.toLowerCase().includes(selectedLoader.toLowerCase()))) {
        return false;
      }
    }

    // Minecraft version filter
    if (selectedMcVersion !== "all") {
      if (!item.mcVersion || (item.mcVersion !== "Any" && !item.mcVersion.includes(selectedMcVersion))) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.author && item.author.toLowerCase().includes(q)) ||
        item.downloadUrl.toLowerCase().includes(q) ||
        (item.targetPath && item.targetPath.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <>
      {/* Topbar */}
      <CustomContentTopbar onOpenAddModal={() => { setEditingItem(null); setIsAddDialogOpen(true); }} />

      <div className="flex flex-col w-full max-w-[1920px] mx-auto bg-background min-h-screen">
        <div className="flex flex-1 min-w-0 relative">
          
          {/* Left Sidebar */}
          <CustomContentSidebar
            items={items}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedStorage={selectedStorage}
            setSelectedStorage={setSelectedStorage}
            selectedType={selectedType}
            setSelectedType={setSelectedType}
            selectedLoader={selectedLoader}
            setSelectedLoader={setSelectedLoader}
            selectedMcVersion={selectedMcVersion}
            setSelectedMcVersion={setSelectedMcVersion}
            counts={counts}
          />

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-col px-6 pt-3 pb-6">
              
              {/* Header Title */}
              <div className="flex items-center justify-between mb-4 mt-0 z-10 bg-background">
                <div>
                  <h2 className="text-3xl font-bold text-foreground">Browse Custom Content</h2>
                  <p className="text-xs text-muted-foreground mt-1">
                    Showing {filteredItems.length} custom content item{filteredItems.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              {/* Table View */}
              <AnimatePresence mode="wait">
                {filteredItems.length > 0 ? (
                  <motion.div
                    key="custom-table"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="w-full pb-6"
                  >
                    <CustomContentTable 
                      items={filteredItems} 
                      onDelete={handleDeleteItem} 
                      onEdit={handleStartEdit}
                    />
                  </motion.div>
                ) : (
                  <div className="col-span-full py-8 flex flex-col items-center justify-center">
                    <Empty className="w-full max-w-xl mx-auto py-6">
                      <EmptyHeader>
                        <EmptyMedia variant="icon" className="bg-blue-500/10 text-blue-400">
                          <PlusCircle className="w-8 h-8" />
                        </EmptyMedia>
                        <EmptyTitle className="text-foreground text-xl font-bold">No custom content found</EmptyTitle>
                        <EmptyDescription className="text-muted-foreground max-w-md mx-auto text-sm">
                          {items.length === 0
                            ? "You haven't added any custom content yet. Click below to add your first direct download URL or resource."
                            : "No items match your selected sidebar filters or search query."}
                        </EmptyDescription>
                      </EmptyHeader>
                      <Button
                        onClick={() => { setEditingItem(null); setIsAddDialogOpen(true); }}
                        className="bg-[#FE5000] hover:bg-[#E04700] text-white rounded-xl h-10 px-5 text-sm font-semibold transition-all gap-2 mt-4"
                      >
                        <Plus className="w-4 h-4" />
                        Add Resource
                      </Button>
                    </Empty>
                  </div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>

      {/* Add / Edit Custom Resource Dialog */}
      <AddCustomContentDialog
        isOpen={isAddDialogOpen}
        onClose={handleCloseDialog}
        onAdded={handleAddedItem}
        onUpdated={handleUpdatedItem}
        editItem={editingItem}
      />
    </>
  );
}
