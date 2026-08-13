import { PlusCircle, Plus } from "lucide-react";

export interface CustomContentTopbarProps {
  onOpenAddModal: () => void;
}

export function CustomContentTopbar({ onOpenAddModal }: CustomContentTopbarProps) {
  return (
    <div className="h-14 border-b border-[#1E1E1E] bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60 flex items-center justify-between px-6 sticky top-[65px] z-40">
      
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <PlusCircle className="w-4.5 h-4.5 text-blue-400" />
        <h1 className="text-sm font-bold text-white tracking-wide">Custom Content</h1>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button 
          onClick={onOpenAddModal}
          className="bg-[#FE5000] hover:bg-[#E04700] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all outline outline-2 outline-transparent hover:outline-[#FE5000] hover:outline-offset-[3px] active:scale-95 duration-200 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 shrink-0" />
          <span>Add Resource</span>
        </button>
      </div>

    </div>
  );
}
