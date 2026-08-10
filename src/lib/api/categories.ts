import { CardContentType } from "@/pages/editor/components/mod-card";

export interface UnifiedCategory {
  id: string; // our internal unified id (usually the modrinth name)
  name: string; // Human readable name (e.g., "Adventure")
  iconSvg: string; // Raw SVG string from Modrinth
  modrinthName: string;
  curseforgeId?: number;
}

// Map our local contentType to Modrinth project_type
export const MODRINTH_PROJECT_TYPES: Record<string, string> = {
  mods: "mod",
  textures: "resourcepack",
  shaders: "shader",
  datapacks: "datapack",
  worlds: "modpack"
};

// Map our local contentType to CurseForge classId
export const CURSEFORGE_CLASS_IDS: Record<string, number> = {
  mods: 6,
  textures: 12,
  shaders: 6552,
  datapacks: 6945,
  worlds: 17
};

// Mapping of CurseForge slugs to Modrinth names
// This maps specific CF sub-categories into the broader Modrinth categories
const CF_TO_MODRINTH_MAP: Record<string, string> = {
  "adventure-and-rpg": "adventure",
  "adventure-rpg": "adventure",
  "adventure": "adventure",
  "armor-weapons-tools": "equipment",
  "equipment": "equipment",
  "magic": "magic",
  "technology": "technology",
  "technology-farming": "food",
  "technology-automation": "technology",
  "technology-energy": "technology",
  "technology-processing": "technology",
  "technology-item-fluid-energy-transport": "storage",
  "storage": "storage",
  "world-gen": "worldgen",
  "world-biomes": "worldgen",
  "world-structures": "worldgen",
  "world-ores-resources": "worldgen",
  "world-dimensions": "worldgen",
  "cosmetic": "decoration",
  "decoration": "decoration",
  "utility-qol": "utility",
  "utility": "utility",
  "server-utility": "utility",
  "library-api": "library",
  "library": "library",
  "performance": "optimization",
  "optimization": "optimization",
  "mc-food": "food",
  "food": "food",
  "addons-thaumcraft": "magic",
  "addons-buildcraft": "technology",
  "addons-tinkers-construct": "technology",
  "addons-thermalexpansion": "technology",
  "addons-industrialcraft": "technology",
  "addons-forestry": "technology",
  "vanilla": "vanilla-like",
  "map-based": "minigame",
  "combat-pvp": "combat",
  "combat": "combat",
  "mini-game": "minigame",
  "sci-fi": "technology",
  "skyblock": "skyblock",
  // Shaders
  "realistic": "realistic",
  "fantasy": "fantasy",
  "cartoon": "cartoon",
  "semi-realistic": "semi-realistic",
  // Texture packs
  "animated": "animation", // assuming modrinth has animation
  "traditional": "vanilla-like",
  "photo-realistic": "realistic",
  "medieval": "decoration"
};

/**
 * Normalizes a category string to a display format
 * e.g., "adventure" -> "Adventure"
 */
function toDisplayName(name: string): string {
  return name.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function fetchCategories(contentType: string, provider: string): Promise<UnifiedCategory[]> {
  try {
    const modrinthType = MODRINTH_PROJECT_TYPES[contentType] || "mod";
    const cfClassId = CURSEFORGE_CLASS_IDS[contentType] || 6;

    let filteredModrinth: any[] = [];
    if ((provider === "all" || provider === "modrinth") && contentType !== "worlds") {
      const modrinthRes = await fetch(`https://api.modrinth.com/v2/tag/category`);
      if (modrinthRes.ok) {
        const modrinthData = await modrinthRes.json();
        
        // Modrinth shares the "mod" categories for datapacks and modpacks
        const targetProjectType = (modrinthType === "datapack" || modrinthType === "modpack") 
          ? "mod" 
          : modrinthType;
          
        filteredModrinth = modrinthData.filter((c: any) => 
          c.project_type === targetProjectType && 
          (c.header === "categories" || c.header === "features")
        );
      }
    }

    let filteredCF: any[] = [];
    if (provider === "all" || provider === "curseforge") {
      const apiKey = import.meta.env.VITE_CURSEFORGE_API_KEY;
      if (apiKey) {
        try {
          const cfRes = await fetch(`https://api.curseforge.com/v1/categories?gameId=432`, {
            headers: {
              "x-api-key": apiKey
            }
          });
          if (cfRes.ok) {
            const cfJson = await cfRes.json();
            const cfData = cfJson.data || [];
            filteredCF = cfData.filter((c: any) => c.classId === cfClassId);
          }
        } catch (err) {
          console.warn("Failed to fetch CurseForge categories", err);
        }
      }
    }

    let unified: UnifiedCategory[] = [];

    if (provider === "modrinth") {
      unified = filteredModrinth.map((mCat: any) => ({
        id: mCat.name,
        name: toDisplayName(mCat.name),
        iconSvg: mCat.icon,
        modrinthName: mCat.name
      }));
    } else if (provider === "curseforge" || (provider === "all" && contentType === "worlds")) {
      unified = filteredCF.map((cfCat: any) => ({
        id: cfCat.slug,
        name: cfCat.name,
        iconSvg: "", // Will use default icon in UI
        modrinthName: "",
        curseforgeId: cfCat.id
      }));
    } else if (provider === "all") {
      // Build the unified list using Modrinth as the base
      unified = filteredModrinth.map((mCat: any) => {
        // Find matching CF categories
        const matchingCFCats = filteredCF.filter((cfCat: any) => {
          const mappedModrinthName = CF_TO_MODRINTH_MAP[cfCat.slug] || cfCat.slug.toLowerCase();
          return mappedModrinthName === mCat.name.toLowerCase();
        });

        return {
          id: mCat.name,
          name: toDisplayName(mCat.name),
          iconSvg: mCat.icon,
          modrinthName: mCat.name,
          curseforgeId: matchingCFCats.length > 0 ? matchingCFCats[0].id : undefined
        };
      });
    }

    // Sort alphabetically
    return unified.sort((a, b) => a.name.localeCompare(b.name));

  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}
