import { create } from "zustand";

export type ThemeMode = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "theme";

const canUseDom = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

const readStoredTheme = (): ThemeMode => {
  if (!canUseDom()) return "light";

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (saved === "light" || saved === "dark") return saved;

  return window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: ThemeMode) => {
  if (!canUseDom()) return;

  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
};

const persistTheme = (theme: ThemeMode) => {
  if (!canUseDom()) return;
  window.localStorage.setItem(STORAGE_KEY, theme);
};

const initialTheme = readStoredTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  setTheme: (theme) => {
    persistTheme(theme);
    applyTheme(theme);
    set({ theme });
  },
  toggleTheme: () =>
    set((state) => {
      const next: ThemeMode = state.theme === "light" ? "dark" : "light";
      persistTheme(next);
      applyTheme(next);
      return { theme: next };
    }),
}));
