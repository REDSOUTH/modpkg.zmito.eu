import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  itemName?: string;
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Custom Content",
  itemName,
  description,
}: DeleteConfirmDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent hideClose className="sm:max-w-lg bg-[#0A0A0A] border-2 border-[#1E1E1E] p-6 gap-4 overflow-hidden shadow-2xl rounded-2xl">
        <DialogHeader className="gap-2 p-0">
          <DialogTitle className="text-white text-base font-bold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#FE5000] shrink-0" />
            <span>{title}</span>
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-white/70">
          {description || (
            <>
              Are you sure you want to delete custom resource <strong className="text-white">{itemName}</strong>? This action cannot be undone.
            </>
          )}
        </p>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="text-white/60 hover:text-white hover:bg-[#1E1E1E] rounded-xl px-4 h-10"
            >
              Cancel
            </Button>
          </DialogClose>
          <Button 
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-[#FE5000] hover:bg-[#E04700] text-white rounded-xl px-4 h-10 font-semibold border-0 outline outline-2 outline-transparent hover:outline-[#FE5000]/50 hover:outline-offset-2 active:scale-95 transition-all cursor-pointer"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
