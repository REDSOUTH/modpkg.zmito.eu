import React, { Dispatch, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { X } from "lucide-react";
import svg from '../../../assets/svg';

export interface ImportMrpackDialogProps {
  openDialogState: [boolean, Dispatch<SetStateAction<boolean>>];
  packName: string;
  modsToDownload: number;
  modsDownloaded: number;
  handlePackConvertion: () => void;
}

export default function ImportMrpackDialog({
  openDialogState,
  packName,
  modsToDownload,
  modsDownloaded,
  handlePackConvertion
}: ImportMrpackDialogProps) {
  const [isOpen, setIsOpen] = openDialogState;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        hideClose
        className="bg-card dark:bg-[#1E1E1E] border border-border dark:border-0 rounded-xl text-foreground p-0 w-full max-w-[1000px] max-h-[600px] h-[90dvh] flex flex-col gap-0 [&>button]:hidden"
      >
        {/* Title bar */}
        <div className="border-b-2 border-[#FE5000] flex justify-between items-center mx-5 select-none">
          <DialogTitle className="my-5 font-semibold text-xl text-foreground">
            Convert .mrpack to Package
          </DialogTitle>
          <button
            type="button"
            title="Close"
            className="w-9 h-9 rounded-xl flex items-center justify-center text-foreground hover:bg-muted transition-colors cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main content */}
        <div className="flex flex-col gap-5 mx-5 h-full pt-5 pb-5">
          {/* Pack info panel */}
          <div className="flex flex-col justify-center items-center bg-muted/50 dark:bg-black rounded-xl h-full w-full select-none gap-1 py-4 text-foreground">
            <h3 className="m-0 mb-5 font-medium text-xl text-center">Selected pack:</h3>
            <h4 className="m-0 font-bold text-2xl text-center">{packName}</h4>
            <p className="m-0 text-muted-foreground text-center">{modsToDownload} mods/files available for download</p>
          </div>

          {/* Options row */}
          <div className="flex gap-5 min-h-[120px] h-[120px] w-full">
            {/* Status */}
            <div className="flex flex-col items-center justify-center bg-muted/50 dark:bg-black rounded-xl w-full select-none gap-0.5 px-5 text-foreground">
              {modsDownloaded === -1 ? (
                <>
                  <h3 className="m-0 font-medium text-lg">Download status</h3>
                  <p className="m-0 mb-2.5 text-muted-foreground">No downloads</p>
                </>
              ) : (
                <>
                  <h3 className="m-0 font-medium text-lg">Download status</h3>
                  <p className="m-0 mb-2.5 text-muted-foreground">Downloading mod/file {modsDownloaded} of {modsToDownload}.</p>
                  <Progress
                    className="w-[calc(100%-40px)] h-2.5 rounded-md"
                    value={modsDownloaded}
                    max={modsToDownload}
                  />
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-5">
              <Button
                variant="card-outline"
                className="flex flex-col h-full w-[180px] rounded-xl gap-0 px-4"
                onClick={handlePackConvertion}
              >
                <span className="[&>svg]:h-[50px] [&>svg]:w-[50px] flex items-center">{svg.download}</span>
                <p className="font-medium text-lg m-0 mt-1">Download</p>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
