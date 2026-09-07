import { useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  title,
  itemName,
  description,
}: DeleteConfirmDialogProps) {
  const { t } = useTranslation();
  const resolvedTitle = title || t("myResources.table.deleteContentTitle");
  // Grayscale the background of the website when dialog is active
  useEffect(() => {
    const rootEl = document.getElementById("root");
    if (!rootEl) return;
    if (isOpen) {
      rootEl.style.transition = "filter 0.3s ease";
      rootEl.style.filter = "grayscale(100%)";
    } else {
      rootEl.style.filter = "";
    }
    return () => {
      if (rootEl) {
        rootEl.style.filter = "";
      }
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        hideClose 
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onConfirm();
            onClose();
          }
        }}
        overlayClassName="backdrop-grayscale backdrop-blur-sm bg-black/60 dark:bg-black/70 transition-all duration-300"
        className="sm:max-w-lg bg-card border-2 border-border p-6 gap-4 overflow-hidden shadow-2xl rounded-2xl text-foreground"
      >
        <DialogHeader className="gap-2 p-0">
          <DialogTitle className="text-foreground text-base font-bold flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-[#FE5000] shrink-0" />
            <span>{resolvedTitle}</span>
          </DialogTitle>
        </DialogHeader>
        
        <p className="text-sm text-muted-foreground">
          {description || (
            <>
              {t("myResources.table.deleteConfirm", { name: itemName || "" })}
            </>
          )}
        </p>

        <DialogFooter className="flex sm:justify-end gap-2 pt-2">
          <DialogClose asChild>
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl px-4 h-10"
            >
              {t("common.cancel")}
            </Button>
          </DialogClose>
          <Button 
            autoFocus
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="bg-[#FE5000] hover:bg-[#E04700] text-white rounded-xl px-4 h-10 font-semibold border-0 outline outline-2 outline-transparent hover:outline-[#FE5000]/50 hover:outline-offset-2 active:scale-95 transition-all cursor-pointer"
          >
            {t("common.delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
