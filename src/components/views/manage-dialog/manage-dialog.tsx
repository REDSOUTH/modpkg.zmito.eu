import React, { useState, useEffect, Dispatch, SetStateAction } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import svg from '../../../assets/svg';
import dlpackage from '../../../functions/dlpackage';

export interface SelectedMod {
  id: string;
  name: string;
  icon?: string;
  [key: string]: any;
}

export interface ManageDialogProps {
  selectedModsState: [SelectedMod[], Dispatch<SetStateAction<SelectedMod[]>>];
  version: string;
  loader: string;
}

interface ModCardProps {
  name: string;
  icon?: string;
  onClick: () => void;
}

const ModCard: React.FC<ModCardProps> = ({ name, icon, onClick }) => {
  return (
    <div
      className="flex-grow bg-[#1E1E1E] rounded-md h-[50px] w-[300px] flex items-center select-none cursor-pointer group"
      onClick={onClick}
    >
      {icon && <img src={icon} alt={name + " icon"} className="rounded-md h-[50px] w-[50px] object-cover" />}
      <div className="flex items-center justify-between w-full">
        <p className="m-0 mx-2.5 text-white">{name}</p>
        <span className="[&>svg]:w-[30px] [&>svg]:h-[30px] [&>svg]:mx-1.5 [&>svg]:opacity-0 [&>svg]:transition-all [&>svg]:duration-100 group-hover:[&>svg]:rotate-90 group-hover:[&>svg]:opacity-100 flex items-center">
          {svg.close}
        </span>
      </div>
    </div>
  );
};

export default function ManageDialog({ selectedModsState, version, loader }: ManageDialogProps) {
  const [selectedMods, setSelectedMods] = selectedModsState;
  const [modsToDownload, setModsToDownload] = useState<number>(0);
  const [modsDownloaded, setModsDownloaded] = useState<number>(-1);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    setModsToDownload(selectedMods.length);
  }, [selectedMods]);

  const handleExportPackage = () => {
    if (selectedMods.length > 0) {
      console.log("Export package triggered for version:", version, "loader:", loader);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedMods((prevSelectedMods) =>
      prevSelectedMods.filter((selectedMod) => selectedMod.id !== id)
    );
  };

  const handleDownloadPackage = () => {
    if (modsDownloaded === -1) {
      dlpackage(selectedMods, setModsDownloaded, version, loader);
    }
  };

  return (
    <>
      {/* Trigger button */}
      <Button
        variant="enfasis"
        className="w-full h-[55px] absolute bottom-0 left-0 m-0 mb-[10px] px-[10px] rounded-xl text-white font-semibold text-[28px]"
        style={{ width: 'calc(100% - 20px)', left: '10px' }}
        onClick={() => setIsOpen(true)}
      >
        Manage Package
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent
          className="bg-[#1E1E1E] border-0 rounded-xl text-white p-0 w-full max-w-[1000px] max-h-[600px] h-[90dvh] flex flex-col gap-0 [&>button]:hidden"
        >
          {/* Title bar */}
          <div className="border-b-2 border-[#FE5000] flex justify-between items-center mx-5 select-none">
            <DialogTitle className="my-5 font-semibold text-xl text-white">
              Manage Package
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-md w-9 h-9 text-white hover:bg-[#FE5000] transition-colors [&>svg]:h-[30px] [&>svg]:w-[30px]"
              onClick={() => setIsOpen(false)}
            >
              {svg.close}
            </Button>
          </div>

          {/* Main content */}
          <div className="flex flex-col gap-5 mx-5 h-full max-h-[calc(100%_-_72px)] pt-5 pb-5">
            {/* Selected mods list */}
            <div className="flex flex-col bg-black rounded-xl h-full max-h-[348px] w-full select-none">
              <h4 className="font-medium leading-[30px] text-lg m-5 mb-0 text-center">Selected mods</h4>
              {selectedMods.length === 0 ? (
                <p className="text-center m-0 p-4 text-gray-400">No mods selected</p>
              ) : (
                <div className="overflow-x-auto flex flex-wrap gap-2.5 px-2.5 m-2.5 mb-5">
                  {selectedMods.map(mod => (
                    <ModCard key={mod.id} name={mod.name} icon={mod.icon} onClick={() => handleRemove(mod.id)} />
                  ))}
                </div>
              )}
            </div>

            {/* Options row */}
            <div className="flex gap-5 min-h-[120px] h-[120px] w-full">
              {/* Action buttons */}
              <div className="flex gap-5">
                <Button
                  variant="card-outline"
                  className="flex flex-col h-full w-[180px] rounded-xl gap-0 px-4"
                  onClick={handleExportPackage}
                >
                  <span className="[&>svg]:h-[50px] [&>svg]:w-[50px] flex items-center">{svg.export}</span>
                  <p className="font-medium text-lg m-0 mt-1">Export package</p>
                </Button>
                <Button
                  variant="card-outline"
                  className="flex flex-col h-full w-[180px] rounded-xl gap-0 px-4"
                  onClick={handleDownloadPackage}
                >
                  <span className="[&>svg]:h-[50px] [&>svg]:w-[50px] flex items-center">{svg.download}</span>
                  <p className="font-medium text-lg m-0 mt-1">Download</p>
                </Button>
              </div>

              {/* Download status */}
              <div className="flex flex-col items-center justify-center bg-black rounded-xl w-full select-none gap-0.5 px-5">
                {modsDownloaded === -1 ? (
                  <>
                    <h3 className="m-0 font-medium text-lg">Download status</h3>
                    <p className="m-0 mb-2.5 text-gray-400">No downloads</p>
                  </>
                ) : (
                  <>
                    <h3 className="m-0 font-medium text-lg">Download status</h3>
                    <p className="m-0 mb-2.5 text-gray-400">Downloading {modsDownloaded} of {modsToDownload} mods</p>
                    <Progress
                      className="w-[calc(100%-40px)] h-2.5 rounded-md"
                      value={modsDownloaded}
                      max={modsToDownload}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
