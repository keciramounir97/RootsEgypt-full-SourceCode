import { create } from "zustand";

const initialTheme = localStorage.getItem("theme") || "light";
document.documentElement.classList.remove("light", "dark");
document.documentElement.classList.add(initialTheme);

interface ThemeState {
  theme: string;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", next);

      document.documentElement.classList.remove("light", "dark");
      document.documentElement.classList.add(next);

      return { theme: next };
    }),
}));
