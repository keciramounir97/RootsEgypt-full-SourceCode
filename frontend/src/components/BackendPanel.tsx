/**
 * BackendPanel — Floating developer panel to switch between mock and real backend.
 * Shows mock mode status and allows toggling or setting a custom API URL.
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Database,
  X,
  Server,
  Zap,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { isMockMode, setMockMode } from "../lib/mockApi";
import { useThemeStore } from "../store/theme";

export default function BackendPanel() {
  const { theme } = useThemeStore();
  const isDark = theme === "dark";
  const [open, setOpen] = useState(false);
  const [mock, setMock] = useState(isMockMode());
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem("rootsegypt_api_url") || "http://localhost:5000",
  );
  const [saved, setSaved] = useState(false);

  const handleToggle = () => {
    const next = !mock;
    setMock(next);
    setMockMode(next);
    setTimeout(() => window.location.reload(), 300);
  };

  const handleSaveUrl = () => {
    localStorage.setItem("rootsegypt_api_url", apiUrl);
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      window.location.reload();
    }, 1200);
  };

  const panelBg = isDark
    ? "bg-[#0d1b2a] border-[#24304A]"
    : "bg-white border-[#d8c7b0]";
  const inputBg = isDark
    ? "bg-white/5 border-white/10"
    : "bg-black/5 border-black/10";

  return (
    <>
      {/* Floating trigger button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5 }}
        onClick={() => setOpen((o) => !o)}
        className={`fixed bottom-6 right-6 z-[9998] flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold shadow-lg border backdrop-blur-sm transition-all hover:scale-105 ${
          mock
            ? isDark
              ? "bg-[#d4a843]/15 border-[#d4a843]/40 text-[#d4a843]"
              : "bg-[#d4a843]/10 border-[#d4a843]/30 text-amber-700"
            : isDark
              ? "bg-teal/15 border-teal/40 text-teal"
              : "bg-teal/10 border-teal/30 text-teal"
        }`}
        title="Backend / API Settings"
      >
        {mock ? (
          <Zap className="w-3.5 h-3.5" />
        ) : (
          <Server className="w-3.5 h-3.5" />
        )}
        <span>{mock ? "Mock Mode" : "Live API"}</span>
        {open ? (
          <ChevronDown className="w-3 h-3" />
        ) : (
          <ChevronUp className="w-3 h-3" />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`fixed bottom-16 right-6 z-[9999] w-80 rounded-2xl border shadow-2xl ${panelBg} overflow-hidden`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-4 py-3 border-b ${isDark ? "border-white/10" : "border-black/10"}`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-teal" />
                <span className="text-sm font-semibold">API Settings</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Mock Mode toggle */}
              <div
                className={`flex items-center justify-between p-3 rounded-xl ${isDark ? "bg-white/5" : "bg-black/5"}`}
              >
                <div>
                  <p className="text-sm font-semibold">Mock Mode</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {mock
                      ? "Using built-in fake data"
                      : "Connected to real backend"}
                  </p>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    mock ? "bg-[#d4a843]" : "bg-teal"
                  }`}
                >
                  <motion.div
                    layout
                    className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                    animate={{
                      left: mock ? "calc(100% - 1.25rem)" : "0.25rem",
                    }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* Status indicator */}
              <div
                className={`flex items-center gap-2 text-xs px-3 py-2 rounded-lg ${
                  mock
                    ? isDark
                      ? "bg-[#d4a843]/10 text-[#d4a843]"
                      : "bg-amber-50 text-amber-700"
                    : isDark
                      ? "bg-teal/10 text-teal"
                      : "bg-teal/10 text-teal"
                }`}
              >
                {mock ? (
                  <Zap className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle className="w-3.5 h-3.5" />
                )}
                {mock
                  ? "Prototype mode: all data is local & fake. Login with any credentials."
                  : "Live mode: connecting to your backend server."}
              </div>

              {/* Backend URL (only shown when not mock) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold opacity-70">
                  Backend API URL
                </label>
                <div className="flex gap-2">
                  <input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:5000"
                    className={`flex-1 text-xs rounded-lg border px-3 py-2 ${inputBg} outline-none`}
                  />
                  <button
                    onClick={handleSaveUrl}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
                      saved
                        ? "bg-green-500 text-white"
                        : "bg-teal text-white hover:bg-teal/80"
                    }`}
                  >
                    {saved ? <CheckCircle className="w-4 h-4" /> : "Save"}
                  </button>
                </div>
                <p className="text-xs opacity-50">
                  Reload required after changing. Switch off Mock Mode to use
                  your backend.
                </p>
              </div>

              {/* Default credentials hint */}
              {mock && (
                <div
                  className={`text-xs p-3 rounded-lg space-y-1 ${isDark ? "bg-white/5" : "bg-black/5"}`}
                >
                  <p className="font-semibold opacity-70">Demo Credentials</p>
                  <p className="opacity-60">
                    Admin:{" "}
                    <span className="font-mono">admin@rootsegypt.org</span>
                  </p>
                  <p className="opacity-60">
                    Pass: <span className="font-mono">password123</span>
                  </p>
                  <p className="opacity-50 italic mt-1">
                    Or use any email/password to log in.
                  </p>
                </div>
              )}

              {!mock && (
                <div
                  className={`flex items-start gap-2 text-xs p-3 rounded-lg ${isDark ? "bg-amber-400/10 text-amber-400" : "bg-amber-50 text-amber-700"}`}
                >
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <p>
                    Make sure your backend is running on the URL above. Start it
                    with:{" "}
                    <code className="font-mono">cd backend && npm start</code>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
