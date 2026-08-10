import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import svg from "../../../assets/svg";

export interface ModItem {
  id: string;
  name: string;
  icon?: string;
}

export interface ModlistProps {
  selectedModsState: [ModItem[], Dispatch<SetStateAction<ModItem[]>>];
  loader: string;
  version: string;
  search: string;
  page: number;
}

interface ModCardProps {
  provider: string;
  url: string;
  id: string;
  name: string;
  icon?: string;
  desc?: string;
}

export default function Modlist({ selectedModsState, loader, version, search, page }: ModlistProps) {
  const [mods, setMods] = useState<any[]>([]);
  const [selectedMods, setSelectedMods] = selectedModsState;

  useEffect(() => {
    const fetchMods = async () => {
      const facets = [
        [`categories:${loader}`],
        [`versions:${version}`],
        ['project_type:mod']
      ];

      try {
        const response = await fetch('https://api.modrinth.com/v2/search?' + new URLSearchParams({
          query: search,
          facets: JSON.stringify(facets),
          limit: '50',
          offset: String((page - 1) * 50)
        }));
        const data = await response.json();
        setMods(data.hits || []);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMods();
  }, [search, version, loader, page]);

  const handleSelect = (mod: ModItem) => {
    setSelectedMods(prevSelectedMods => {
      const isSelected = prevSelectedMods.some(selectedMod => selectedMod.id === mod.id);
      return isSelected
        ? prevSelectedMods.filter(selectedMod => selectedMod.id !== mod.id)
        : [...prevSelectedMods, mod];
    });
  };

  const ModCard: React.FC<ModCardProps> = ({ url, id, name, icon, desc }) => {
    const isSelected = selectedMods.some(mod => mod.id === id);

    return (
      <div className="relative min-w-[600px] w-[calc(50%-20px)] flex-grow bg-black rounded-md flex flex-col overflow-hidden max-[647px]:min-w-[430px]">
        {/* Main info */}
        <div className="m-2.5 flex">
          {icon && (
            <img
              src={icon}
              alt=""
              className="border-2 border-[#1E1E1E] rounded-md w-24 h-24 object-cover"
            />
          )}
          <div className="ml-2.5">
            <a href={url} target="_blank" rel="noreferrer" className="w-fit">
              <h3 className="cursor-pointer w-fit m-0 mb-1 text-xl leading-snug font-semibold hover:underline">
                {name}
              </h3>
            </a>
            <p className="m-0 text-sm text-gray-300">{desc}</p>
          </div>
        </div>
        {/* Options bar */}
        <div className="mx-2.5 border-t-2 border-[#1E1E1E] flex items-center justify-end">
          <div className="my-2.5 flex gap-2.5">
            <Button
              variant="card"
              className="h-10 px-2 rounded-md gap-1"
              onClick={() => console.log("Download single mod:", id)}
            >
              <span className="[&>svg]:h-7 [&>svg]:w-7 [&>svg]:fill-white flex items-center">{svg.download}</span>
              <p className="m-0 font-medium text-base">Download</p>
            </Button>
            <Button
              variant={isSelected ? "enfasis" : "card"}
              className="h-10 px-2 rounded-md gap-1"
              onClick={() => handleSelect({ id, name, icon })}
            >
              <span className="[&>svg]:h-7 [&>svg]:w-7 flex items-center">
                {isSelected ? svg.selected : svg.select}
              </span>
              <p className="m-0 font-medium text-base">
                {isSelected ? "Mod added" : "Add to packaging"}
              </p>
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-h-[calc(100%-20px)] flex flex-wrap gap-2.5 p-2.5">
      {mods.map(mod => (
        <ModCard
          key={mod.slug}
          provider={"modrinth"}
          url={`https://modrinth.com/mod/${mod.slug}`}
          id={mod.slug}
          name={mod.title}
          icon={mod.icon_url}
          desc={mod.description}
        />
      ))}
    </div>
  );
}
