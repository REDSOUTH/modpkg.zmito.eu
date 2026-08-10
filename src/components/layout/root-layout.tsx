import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { LayoutGroup, AnimatePresence, motion } from "framer-motion";
import Header from "./header";
import Footer from "./footer";

export default function RootLayout() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <LayoutGroup>
      <div className="flex flex-col bg-black text-white font-['Poppins'] min-h-[100dvh]">
        <Header />
        <main className="flex-1 flex flex-col relative">
          <Outlet />

          <AnimatePresence>
            {isHome && (
              <motion.div
                key="home-logo-overlay"
                className="pointer-events-none"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 10,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "40px 0",
                }}
                exit={{ opacity: 0, transition: { duration: 0, delay: 0.7 } }}
              >
                <motion.img
                  layoutId="logo"
                  src="/banner.svg"
                  alt="MODPKG Banner Logo"
                  draggable="false"
                  className="select-none"
                  style={{ height: 160, marginBottom: "6dvh" }}
                  transition={{ type: "spring", stiffness: 180, damping: 26 }}
                />
                <div style={{ width: 1100, height: 565, flexShrink: 0 }} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </LayoutGroup>
  );
}
