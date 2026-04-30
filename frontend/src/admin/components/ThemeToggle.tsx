import { useThemeStore } from "../../store/theme";
import { Moon, Sun } from "lucide-react";
import { useTranslation } from "../../context/TranslationContext";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useThemeStore();
  const { t } = useTranslation();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      className={`relative flex items-center justify-between gap-3 transition-all duration-200 outline-none group ${className}`}
      aria-label={t("toggle_theme", "Toggle color theme")}
      type="button"
      title={t("toggle_theme", "Toggle color theme")}
    >
      <div className="flex items-center gap-2">
        {isDark ? (
          <Sun className="w-4 h-4 text-teal" />
        ) : (
          <Moon className="w-4 h-4 text-primary-brown" />
        )}
        <span className={`text-sm font-medium ${isDark ? "text-gray-300 group-hover:text-white" : "text-secondary-brown group-hover:text-primary-brown"}`}>
          {isDark ? t("light_mode", "Light mode") : t("dark_mode", "Dark mode")}
        </span>
      </div>
    </button>
  );
}

