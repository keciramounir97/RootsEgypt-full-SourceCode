import { Globe } from "lucide-react";
import { useThemeStore } from "../store/theme";
import { useTranslation } from "../context/TranslationContext";
import { localeLabel } from "../utils/translations";

interface LanguageMenuProps {
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right" | "up";
}

export default function LanguageMenu({
  className = "",
  buttonClassName = "",
}: LanguageMenuProps) {
  useThemeStore();
  const { locale, locales, setLocale, t } = useTranslation();

  const cycleLocale = () => {
    const index = locales.indexOf(locale);
    const nextIndex = (index + 1) % locales.length;
    setLocale(locales[nextIndex]);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        aria-label={t("language", "Language")}
        title={`${t("language", "Language")}: ${localeLabel(locale)} — ${t("click_to_cycle", "Click to change")}`}
        className={buttonClassName}
        onClick={cycleLocale}
      >
        <Globe className="w-5 h-5 flex-shrink-0" />
        <span className="lang-label text-[11px] font-semibold">{localeLabel(locale)}</span>
      </button>
    </div>
  );
}



