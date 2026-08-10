import { 
  Search, Monitor, Server, Sparkles, Zap, Wrench, Image as ImageIcon, 
  Globe, PlusCircle, Box, Paintbrush, Braces, Glasses, Map as MapIcon, 
  Check, Compass, Upload, FileUp, FileBraces, Sword, Shield, Heart, 
  Leaf, Book, Hexagon, Ghost, Archive, Carrot, Home, DollarSign, 
  Swords, Database, Wand2, Sliders, Award, Bug, MessageCircle, 
  HardDrive, Truck, Briefcase
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, { icon: React.ElementType, color: string }> = {
  "storage": { icon: Archive, color: "text-orange-400" },
  "adventure": { icon: Compass, color: "text-blue-400" },
  "food": { icon: Carrot, color: "text-orange-500" },
  "decoration": { icon: Home, color: "text-pink-400" },
  "economy": { icon: DollarSign, color: "text-green-400" },
  "equipment": { icon: Swords, color: "text-slate-300" },
  "worldgen": { icon: Globe, color: "text-cyan-400" },
  "management": { icon: Database, color: "text-purple-400" },
  "library": { icon: Book, color: "text-gray-400" },
  "magic": { icon: Wand2, color: "text-indigo-400" },
  "game-mechanics": { icon: Sliders, color: "text-amber-400" },
  "minigame": { icon: Award, color: "text-yellow-500" },
  "mobs": { icon: Ghost, color: "text-emerald-500" },
  "optimization": { icon: Zap, color: "text-yellow-400" },
  "cursed": { icon: Bug, color: "text-lime-500" },
  "social": { icon: MessageCircle, color: "text-blue-300" },
  "technology": { icon: HardDrive, color: "text-blue-500" },
  "transportation": { icon: Truck, color: "text-zinc-400" },
  "utility": { icon: Briefcase, color: "text-amber-500" },
  // Fallbacks for sub-types or edge cases
  "combat": { icon: Sword, color: "text-red-500" },
  "vanilla-like": { icon: Leaf, color: "text-emerald-400" },
  "default": { icon: Hexagon, color: "text-white/60" }
};
