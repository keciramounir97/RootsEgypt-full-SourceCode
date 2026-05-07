/* global process */
import path from "path";
import dns from "node:dns";
import { fileURLToPath } from "url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// Align Node's localhost resolution with the browser (avoids HMR WS failures on Windows/Node 17+).
dns.setDefaultResultOrder("verbatim");

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const usePolling =
  process.env.VITE_DEV_POLL === "1" ||
  /OneDrive|Dropbox|Google Drive/i.test(__dirname);

/** Cursor / embedded preview browsers often block ws:// to localhost; set VITE_DISABLE_HMR=1 to silence WS errors (no hot reload). */
const disableHmr = process.env.VITE_DISABLE_HMR === "1";

/** Default 127.0.0.1 (stable HMR on Windows). Set VITE_DEV_HOST=all for 0.0.0.0 / LAN. */
const serverHost =
  process.env.VITE_DEV_HOST === "all" || process.env.VITE_DEV_HOST === "0.0.0.0"
    ? true
    : process.env.VITE_DEV_HOST || "127.0.0.1";

const hmrClientHost =
  serverHost === true || serverHost === "0.0.0.0"
    ? process.env.VITE_HMR_HOST || "127.0.0.1"
    : serverHost;

export default defineConfig({
  base: "/",
  plugins: [
    react(),
    tailwindcss({
      config: "./tailwind.config.js",
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  server: {
    port: 5173,
    host: serverHost,
    strictPort: true,
    hmr: disableHmr
      ? false
      : {
          protocol: "ws",
          host: hmrClientHost,
          port: 5173,
          clientPort: 5173,
        },
    ...(usePolling
      ? {
          watch: {
            usePolling: true,
            interval: 1000,
          },
        }
      : {}),
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
});
