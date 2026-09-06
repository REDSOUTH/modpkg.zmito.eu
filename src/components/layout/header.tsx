import { Link, useLocation } from "react-router-dom";
import { User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import modpkgLogo from "/banner.svg";
import { useState, useEffect } from "react";

export default function Header() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Distance from left edge for the nav when the logo is visible in the header
  // Logo aspect ratio is 586:200 with height 36px (h-9) -> width ~105.5px + 24px gap = ~130px
  const LOGO_NAV_OFFSET = 130;

  // Disable pointer events on the logo during the spring animation
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 750);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Editor", path: "/editor" },
    { name: "My Resources", path: "/my-resources" },
    { name: "My MODPKGs", path: "/dashboard" },
    { name: "Discover", path: "/discover" },
    { name: "Docs", path: "/docs" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1E1E1E] bg-black/80 backdrop-blur supports-[backdrop-filter]:bg-black/60">
      <div className="flex h-16 items-center justify-between px-6 max-w-[1920px] mx-auto w-full">

        <div className="relative flex items-center h-full">
          <motion.div
            className={`absolute inset-y-0 left-0 flex items-center ${isHome || isTransitioning ? "pointer-events-none" : ""}`}
            initial={false}
            animate={{ opacity: isHome ? 0 : 1 }}
            transition={{ duration: 0.25 }}
          >
            <Link
              to="/"
              className={`flex items-center pr-2 transition-transform ${isTransitioning ? "" : "hover:scale-105"}`}
            >
              <motion.img
                layoutId="logo"
                src={modpkgLogo}
                alt="MODPKG Logo"
                draggable="false"
                className="h-9 w-auto aspect-[586/200] select-none"
                transition={{ type: "spring", stiffness: 180, damping: 26 }}
              />
            </Link>
          </motion.div>

          <motion.nav
            initial={false}
            animate={{ paddingLeft: isHome ? 0 : LOGO_NAV_OFFSET }}
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className="hidden md:flex items-center gap-6"
          >
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-[#FE5000] ${
                  location.pathname === link.path 
                    ? "text-[#FE5000] underline underline-offset-[6px] decoration-2 decoration-[#FE5000]" 
                    : "text-white/80"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </motion.nav>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" className="hidden md:flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full px-4">
            <User className="h-5 w-5" />
            <span className="text-base font-normal">Sign In</span>
          </Button>

          <Button variant="ghost" size="icon" className="md:hidden text-white hover:bg-white/10 rounded-md">
            <Menu className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </header>
  );
}
