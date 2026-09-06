import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImportPackageInput from "../../components/views/import-package";
import { usePack } from "@/context/pack-context";
import { Library, Zap, Package, ShieldCheck, Globe, Plus } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();
  const { packSettings, packagesList, activePackId } = usePack();

  const hasActiveProject = packagesList.length > 0 && !!activePackId;

  useEffect(() => {
    document.title = "MODPKG — Home";
  }, []);

  return (
    <div className="w-full min-h-[calc(100vh-65px)] flex flex-col justify-center items-center py-8 sm:py-10 px-4 select-none">
      {/* Phantom spacer that matches RootLayout's animated logo */}
      <div className="h-[150px] mb-11 shrink-0 pointer-events-none max-[1139px]:h-[100px] max-[1139px]:mb-6" />

      {/* Subtitle & Tagline Header */}
      <div className="flex flex-col items-center text-center mb-12 sm:mb-14 px-4 max-w-3xl">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white tracking-tight leading-snug">
          Website to create mod packages for Minecraft quickly and easily.
        </h1>
        <p className="text-sm sm:text-base text-white/50 mt-2.5 max-w-2xl leading-relaxed font-normal">
          Build, customize, and export standalone packages directly in your browser. Universal and completely independent of any launcher.
        </p>
      </div>

      {/* Main menu: 3 equal columns with compact 320px height */}
      <div className="w-[1140px] h-[320px] flex gap-5 max-[1139px]:flex-col max-[1139px]:w-full max-[1139px]:max-w-[500px] max-[1139px]:h-auto">
        
        {/* Column 1: Package Editor (Create / Select Content) */}
        <div className="h-full w-1/3 flex flex-col max-[1139px]:h-[220px] max-[1139px]:w-full">
          <button 
            className="h-option group relative p-6 flex flex-col items-center justify-center text-center overflow-hidden h-full" 
            onClick={() => navigate("/editor")}
          >
            <svg
              className="w-16 h-16 mb-3.5 text-white group-hover:scale-105 group-hover:text-[#FE5000] transition-all duration-300 select-none pointer-events-none"
              viewBox="0 0 190 200"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M94.5358 0L189.072 46.7937V153.206L94.5358 200L0 153.206V46.7937L94.5358 0ZM17.1883 65.9994V142.508L85.9416 176.539V100.031L17.1883 65.9994ZM103.13 100.031V176.539L171.883 142.508V65.9994L146.101 78.7614V112.914L128.912 121.523V87.2697L103.13 100.031ZM161.078 52.1425L138.683 63.2268C138.193 62.8213 137.649 62.4645 137.055 62.1672L72.7811 29.974L94.5358 19.2057L161.078 52.1425ZM53.4502 39.5424L119.598 72.6741L94.5358 85.0795L27.9945 52.1425L53.4502 39.5424Z"
              />
            </svg>
            <p className="text-2xl font-bold text-white tracking-wide mb-2 text-center w-full group-hover:text-white transition-colors">Package Editor</p>
            <p className="text-xs text-white/45 max-w-[270px] leading-relaxed text-center mx-auto">
              {hasActiveProject 
                ? "Build and configure your modpack with mods, textures, shaders & overrides."
                : "Create and configure your first modpack with mods, textures & overrides."}
            </p>

            {/* Active project snapshot or First-time prompt */}
            {hasActiveProject ? (
              <div className="mt-4 flex items-center justify-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 text-xs text-center mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FE5000] animate-pulse shrink-0" />
                <span className="text-white/50 font-normal">Continue with:</span>
                <span className="text-white font-medium truncate max-w-[130px]">{packSettings.name}</span>
                <span className="text-white/40 font-mono text-[10px]">{packSettings.currentVersion || 'v1.0.0'}</span>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-xs text-center mx-auto text-white/70">
                <Plus className="size-3.5 text-white shrink-0" />
                <span>Create your first MODPKG</span>
              </div>
            )}
          </button>
        </div>

        {/* Column 2: My MODPKGs */}
        <div className="h-full w-1/3 flex flex-col max-[1139px]:h-[220px] max-[1139px]:w-full">
          <button 
            className="h-option group relative p-6 flex flex-col items-center justify-center text-center overflow-hidden h-full" 
            onClick={() => navigate("/editor")}
          >
            <Library className="w-16 h-16 mb-3.5 text-white group-hover:scale-105 group-hover:text-[#FE5000] transition-all duration-300" />
            <p className="text-2xl font-bold text-white tracking-wide mb-2 text-center w-full group-hover:text-white transition-colors">My MODPKGs</p>
            <p className="text-xs text-white/45 max-w-[270px] leading-relaxed text-center mx-auto">
              Access your locally stored projects,<br /> manage versions and export.
            </p>

            {/* Stored packages count */}
            <div className="mt-4 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 text-xs text-white/60 text-center mx-auto">
              {hasActiveProject ? (
                <>
                  <span className="text-white font-semibold">{packagesList.length}</span>
                  <span>{packagesList.length === 1 ? 'project stored' : 'projects stored'}</span>
                </>
              ) : (
                <span>No projects stored yet</span>
              )}
            </div>
          </button>
        </div>
        
        {/* Column 3: Import Project */}
        <div className="h-full w-1/3 flex flex-col max-[1139px]:h-[220px] max-[1139px]:w-full">
          <ImportPackageInput />
        </div>
      </div>

      {/* Philosophy / Highlights Strip */}
      <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-white/40 max-[1139px]:mt-6">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-[#FE5000]" />
          <span>In-Browser Engine</span>
        </div>
        <div className="flex items-center gap-2">
          <Package className="w-3.5 h-3.5 text-blue-400" />
          <span>Universal .mpkg.zip Export</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Zero Launcher Lock-In</span>
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-purple-400" />
          <span>Modrinth & CurseForge Ready</span>
        </div>
      </div>
    </div>
  );
}
