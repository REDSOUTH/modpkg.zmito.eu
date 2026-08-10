import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImportPackageInput from "../../components/views/import-package";
import ImportMrpackInput from "../../components/views/import-mrpack/import-mrpack";
import svg from "../../assets/svg";

export default function HomePage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "MODPKG — Home";
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col justify-center items-center py-10">
      {/* El logo gigante ahora está en el RootLayout para que AnimatePresence no lo destruya al instante */}
      {/* Y un div transparente que hace de "fantasma" para que el flexbox mantenga la separación visual */}
      <div className="mb-[6dvh] h-[160px] max-[1139px]:mb-0 max-[1139px]:my-10" />

      {/* Main menu: 3 columns */}
      <div className="w-[1100px] h-[565px] flex gap-5 max-[1139px]:flex-col max-[1139px]:w-[calc(100%-40px)] max-[1139px]:h-auto">
        
        {/* Left column: Select Mods (Create new) */}
        <div className="h-full w-1/3 flex flex-col gap-5 max-[1139px]:h-auto max-[1139px]:w-full">
          <button className="h-option" onClick={() => navigate("/editor")}>
            {svg.modlist}
            <p>Select Mods</p>
          </button>
        </div>

        {/* Middle column: My Modpkgs (Dashboard) */}
        <div className="h-full w-1/3 flex flex-col gap-5 max-[1139px]:h-auto max-[1139px]:w-full">
          <button className="h-option group" onClick={() => navigate("/dashboard")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
              <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-1.2-1.8A2 2 0 0 0 7.55 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z"/>
              <path d="M12 10v6"/>
              <path d="m9 13 3 3 3-3"/>
            </svg>
            <p>My Modpkgs</p>
          </button>
        </div>
        
        {/* Right column: Import options */}
        <div className="h-full w-1/3 flex flex-col gap-5 max-[1139px]:h-[300px] max-[1139px]:w-full">
          <ImportPackageInput />
          <ImportMrpackInput />
        </div>
      </div>

    </div>
  );
}
