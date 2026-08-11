import ModCard, { ModItemData } from "./mod-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { useDebounce } from "@/hooks/use-debounce";
import { searchMods } from "@/lib/api/mods";
import { usePack } from "@/context/pack-context";
import { Button } from "@/components/ui/button";
import { Hash, SearchX, Settings2, X } from "lucide-react";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface ModGridProps {
  contentType: string;
  provider: string;
  searchQuery: string;
  selectedCategories: string[];
  selectedEnvironments: string[];
  sortBy: string;
  setSortBy: (sort: string) => void;
  onClearFilters: () => void;
  onOpenSettings: () => void;
  onCategoryClick?: (category: string) => void;
}



const skeletonContainer = {
  hidden: { opacity: 1 },
  show: { opacity: 1 },
  exit: { opacity: 0, transition: { duration: 0.15 } }
};

const skeletonItem = {
  hidden: { opacity: 1 },
  show: { opacity: 1 }
};

const contentContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const contentItem = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const ModCardSkeleton = () => (
  <motion.div variants={skeletonItem} className="group relative bg-[#1E1E1E] rounded-2xl p-5 flex flex-col gap-4 overflow-hidden outline outline-3 outline-transparent h-full animate-pulse">
    
    <div className="flex items-start justify-between relative z-10">
      <div className="flex gap-4 items-center">
        <Skeleton className="w-14 h-14 rounded-xl bg-white/5 shrink-0" />
        <div className="flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5 w-fit">
            <Skeleton className="h-[18px] w-[140px] bg-white/5" />
          </div>
          <div className="flex items-center gap-1.5 mt-0.5 w-fit">
            <Skeleton className="h-[14px] w-[80px] bg-white/5" />
          </div>
        </div>
      </div>
      <div className="flex items-center ml-2 shrink-0">
        <Skeleton className="w-[65px] h-[32px] rounded-full bg-white/5" />
      </div>
    </div>
    
    <div className="mt-1 flex flex-col relative z-10 pt-[3px]">
      <Skeleton className="h-[14px] w-full bg-white/5" />
      <Skeleton className="h-[14px] w-5/6 bg-white/5 mt-[8px]" />
    </div>
    
    <div className="flex items-end justify-between mt-auto pt-2 relative z-10 gap-2">
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-[20px] w-[75px] bg-white/5 rounded-md" />
        <Skeleton className="h-[20px] w-[50px] bg-white/5 rounded-md" />
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <Skeleton className="w-6 h-6 rounded-md bg-white/5" />
        <Skeleton className="w-6 h-6 rounded-md bg-white/5" />
      </div>
    </div>

  </motion.div>
);

export default function ModGrid({ 
  contentType = "mods",
  provider = "all",
  searchQuery = "",
  selectedCategories = [],
  selectedEnvironments = [],
  sortBy = "relevance",
  setSortBy,
  onClearFilters,
  onOpenSettings,
  onCategoryClick
}: ModGridProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [mods, setMods] = useState<ModItemData[]>([]);
  const [limit, setLimit] = useState<string>("20");
  const [page, setPage] = useState<number>(1);

  const { packSettings } = usePack();
  const { mcVersion, loader } = packSettings;

  const debouncedQuery = useDebounce(searchQuery, 400);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (newPage: number | ((p: number) => number)) => {
    setPage(newPage);
    // Scroll window to top on page change
    window.scrollTo({ top: 0 });
  };

  // Reset page when filters change
  useEffect(() => {
    handlePageChange(1);
  }, [debouncedQuery, provider, contentType, selectedCategories, selectedEnvironments, sortBy, limit]);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    
    const offset = (page - 1) * parseInt(limit, 10);
    
    searchMods(
      debouncedQuery,
      provider,
      contentType,
      selectedCategories,
      selectedEnvironments,
      sortBy,
      parseInt(limit, 10),
      offset,
      mcVersion,
      loader
    ).then((data) => {
      if (mounted) {
        setMods(data);
        setIsLoading(false);
      }
    });

    return () => { mounted = false; };
  }, [debouncedQuery, provider, contentType, selectedCategories, selectedEnvironments, sortBy, limit, page, mcVersion, loader]);
  const contentTypeLabels: Record<string, string> = {
    mods: "Mods",
    textures: "Resource Packs",
    datapacks: "Datapacks",
    shaders: "Shaders",
    worlds: "Worlds",
    overrides: "Overrides & Custom Files"
  };

  const currentLabel = contentTypeLabels[contentType] || "Mods";

  return (
    <div ref={scrollRef} className="flex-1 min-w-0">
      <div className="flex flex-col px-6 pt-3 pb-6 min-h-full">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4 mt-0 z-10 bg-black">
        <div>
          <h2 className="text-3xl font-bold text-white">Browse {currentLabel}</h2>
        </div>
        
        {/* Sort/Filters summary */}
        <div className="flex items-center gap-3">
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-white/40" />
              Amount
            </span>
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-[80px] bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-10 rounded-xl px-3 text-sm font-medium">
                <SelectValue placeholder="20" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl shadow-xl">
                <SelectItem value="5" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">5</SelectItem>
                <SelectItem value="10" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">10</SelectItem>
                <SelectItem value="15" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">15</SelectItem>
                <SelectItem value="20" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">20</SelectItem>
                <SelectItem value="50" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">50</SelectItem>
                <SelectItem value="100" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">100</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-px h-6 bg-[#1E1E1E]" />

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-white/40" />
              Sort by
            </span>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-[#1E1E1E] border-2 border-[#1E1E1E] text-white focus:ring-0 focus:border-[#FE5000] h-10 rounded-xl px-3 text-sm font-medium">
                <SelectValue placeholder="Sort option" />
              </SelectTrigger>
              <SelectContent className="bg-[#0A0A0A] border-2 border-[#1E1E1E] text-white rounded-xl shadow-xl">
                <SelectItem value="relevance" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">Relevance</SelectItem>
                <SelectItem value="downloads" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">Most Downloads</SelectItem>
                <SelectItem value="updated" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">Recently Updated</SelectItem>
                <SelectItem value="newest" className="focus:bg-[#1E1E1E] focus:text-[#FE5000] text-sm">Newest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="skeletons"
            variants={skeletonContainer}
            initial="hidden"
            animate="show"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <ModCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : (
          <motion.div 
            key={`content-${contentType}`}
            variants={contentContainer}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-6"
          >
            {mods.length > 0 ? (
              mods.map(mod => (
                <motion.div key={mod.id} variants={contentItem}>
                  <ModCard mod={mod} onCategoryClick={onCategoryClick} />
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 flex flex-col items-center justify-center">
                <Empty className="w-full max-w-2xl mx-auto py-16">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-[#FE5000]/10 text-[#FE5000]">
                      <SearchX className="w-10 h-10" />
                    </EmptyMedia>
                    <EmptyTitle className="text-white text-2xl font-bold">Sin resultados</EmptyTitle>
                    <EmptyDescription className="text-white/60 max-w-md mx-auto text-base">
                      No hemos encontrado {currentLabel.toLowerCase()} para <strong className="text-white">{mcVersion}</strong> en <strong className="text-white capitalize">{loader}</strong> con los filtros actuales.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent className="flex-row justify-center gap-4 mt-4">
                    <Button 
                      variant="ghost" 
                      className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl h-9 px-4 text-sm font-medium transition-all"
                      onClick={onOpenSettings}
                    >
                      <Settings2 className="w-4 h-4 mr-2" />
                      Ajustes del proyecto
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl h-9 px-4 text-sm font-medium transition-all"
                      onClick={onClearFilters}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  </EmptyContent>
                </Empty>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Pagination Controls */}
      {mods.length > 0 && !isLoading && (
        <div className="pt-4 pb-8 relative z-10">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); if (page > 1) handlePageChange(p => p - 1); }}
                  className={page === 1 ? "pointer-events-none opacity-50 text-white/50" : "cursor-pointer text-white hover:bg-white/10 hover:text-white"}
                />
              </PaginationItem>

              {page > 2 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(1); }}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}

              {page > 3 && (
                <PaginationItem>
                  <PaginationEllipsis className="text-white/50" />
                </PaginationItem>
              )}

              {page > 1 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(p => p - 1); }}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    {page - 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              <PaginationItem>
                <PaginationLink 
                  href="#" 
                  isActive 
                  className="bg-[#1E1E1E] text-[#FE5000] hover:bg-[#1E1E1E] hover:text-[#FE5000] border border-transparent font-bold cursor-default"
                  onClick={(e) => e.preventDefault()}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>

              {mods.length >= parseInt(limit, 10) && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(p => p + 1); }}
                    className="text-white hover:bg-white/10 hover:text-white"
                  >
                    {page + 1}
                  </PaginationLink>
                </PaginationItem>
              )}

              {mods.length >= parseInt(limit, 10) && (
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); handlePageChange(p => p + 1); }}
                    className="cursor-pointer text-white hover:bg-white/10 hover:text-white"
                  />
                </PaginationItem>
              )}
            </PaginationContent>
          </Pagination>
        </div>
      )}

      </div>
    </div>
  );
}
