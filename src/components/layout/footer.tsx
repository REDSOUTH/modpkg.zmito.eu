import { Link } from "react-router-dom";
import { Globe, Moon } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-8 border-t border-[#1E1E1E] bg-black text-sm text-gray-400">
      <div className="max-w-[1920px] mx-auto w-full px-6 flex flex-col md:flex-row items-center md:items-end justify-between gap-6">
        
        {/* Left side: Logo, Copyright & Links */}
        <div className="flex flex-col items-center md:items-start gap-3">
          <img src="/redsouth/banner.svg" alt="REDSOUTH Studio" className="h-12 w-auto select-none" draggable="false" />
          
          <div className="text-center md:text-left">
            © {new Date().getFullYear()} REDSOUTH Studio. All rights reserved.
          </div>
          
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-xs text-gray-500 mt-3">
            <Link to="/legal/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="/legal/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/legal/cookies" className="hover:text-white transition-colors">Cookie Policy</Link>
            <Link to="/legal/trademarks" className="hover:text-white transition-colors">Legal Notice &amp; Trademarks</Link>
          </div>
        </div>
        
        {/* Right side: Theme & Language (Static layout only for now) */}
        <div className="flex items-center gap-2">
          <button className="flex items-center justify-center h-8 w-8 bg-transparent border-0 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Moon className="h-4 w-4" />
          </button>
          
          <button className="flex items-center gap-2 h-8 px-3 bg-transparent border-0 text-gray-400 hover:text-white cursor-pointer transition-colors">
            <Globe className="h-4 w-4" />
            <span className="text-sm">English</span>
          </button>
        </div>
        
      </div>
    </footer>
  );
}
