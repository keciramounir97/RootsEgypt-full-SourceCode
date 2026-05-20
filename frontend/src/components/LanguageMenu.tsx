import { Check, ChevronDown, Globe } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { useThemeStore } from "../store/theme";
import { useLanguage, type LanguageCode } from "../i18n";

interface LanguageMenuProps {
  className?: string;
  buttonClassName?: string;
  align?: "left" | "right" | "up";
}

export default function LanguageMenu({
  className = "",
  buttonClassName = "",
  align = "right",
}: LanguageMenuProps) {
  useThemeStore();
  const { language, setLanguage, t, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const currentLanguage =
    availableLanguages.find((item) => item.code === language) ?? availableLanguages[0];

  const chooseLanguage = (nextLanguage: LanguageCode) => {
    setLanguage(nextLanguage);
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const menuPosition =
    align === "left"
      ? "left-0 top-full mt-2"
      : align === "up"
        ? "right-0 bottom-full mb-2"
        : "right-0 top-full mt-2";

  return (
    <div className={`relative ${className}`} ref={menuRef}>
      <button
        type="button"
        aria-label={t("legacy.language", "Language")}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        title={`${t("legacy.language", "Language")}: ${currentLanguage.name}`}
        className={buttonClassName}
        onClick={() => setOpen((value) => !value)}
      >
        <Globe className="w-5 h-5 flex-shrink-0" />
        <span className="lang-label text-[11px] font-semibold">
          {currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open ? (
        <div
          id={menuId}
          role="menu"
          className={`absolute ${menuPosition} z-[80] min-w-44 overflow-hidden rounded-lg border border-[#d4a843]/25 bg-[#07121f] py-1 shadow-2xl shadow-black/35`}
        >
          {availableLanguages.map((item) => (
            <button
              key={item.code}
              type="button"
              role="menuitemradio"
              aria-checked={item.code === language}
              aria-current={item.code === language ? "true" : undefined}
              className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm text-[#f7f1e5] transition-colors hover:bg-[#d4a843]/12 hover:text-[#d4a843]"
              onClick={() => chooseLanguage(item.code)}
              dir={item.dir}
            >
              <span>{item.name}</span>
              {item.code === language ? <Check className="h-4 w-4" /> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
