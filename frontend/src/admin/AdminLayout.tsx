import { useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useThemeStore } from "../store/theme";
import AdminHeader from "./components/AdminHeader";
import AdminSidebar from "./components/AdminSidebar";
import Breadcrumb from "./components/Breadcrumb";
import {
  NileWave,
  SandParticleField,
  HieroglyphicBorder,
} from "../components/motion/EgyptianMotion";

export default function AdminLayout() {
  const [open, setOpen] = useState(true);
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  return (
    <div className="admin-shell min-h-screen relative">
      {/* Egyptian photo background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <img
          src="/assets/roots-page-bg.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div
          className={`absolute inset-0 ${
            isDark ? "bg-[#060e1c]/92" : "bg-[#f5f1e8]/88"
          }`}
        />
      </div>

      {/* Floating sand particles */}
      <SandParticleField
        count={18}
        className="fixed inset-0 -z-[5] pointer-events-none"
      />

      {/* Top hieroglyphic border */}
      <div className="fixed top-0 left-0 right-0 z-[39] pointer-events-none">
        <HieroglyphicBorder position="top" className="pt-[82px]" />
      </div>

      <AdminHeader
        sidebarOpen={open}
        onToggleSidebar={() => setOpen((v) => !v)}
      />
      <AdminSidebar
        open={open}
        onClose={() => setOpen(false)}
        onToggle={() => setOpen((v) => !v)}
      />
      <main
        className={`transition-all duration-300 pt-20 pb-10 px-4 sm:px-6 ${
          open ? "lg:pl-72" : ""
        }`}
      >
        <motion.div
          className="admin-panel max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="admin-panel-shell rounded-xl backdrop-blur-sm relative overflow-hidden">
            {/* Subtle inner glow */}
            <div
              className="absolute inset-0 pointer-events-none rounded-xl"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse at top left, rgba(212,168,67,0.04) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(13,148,136,0.03) 0%, transparent 50%)"
                  : "radial-gradient(ellipse at top left, rgba(196,92,62,0.03) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(12,74,110,0.02) 0%, transparent 50%)",
              }}
            />
            <Breadcrumb />
            <Outlet context={{ sidebarOpen: open }} />
          </div>
        </motion.div>

        {/* Nile wave at bottom of content */}
        <NileWave className="mt-8" />
      </main>
    </div>
  );
}
