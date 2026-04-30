import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isRtlLocale,
  tForLocale,
} from "../utils/translations";

const STORAGE_KEY = "locale";

interface TranslationContextType {
  locale: string;
  dir: "rtl" | "ltr";
  locales: readonly string[];
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

const FALLBACK_VALUE: TranslationContextType = {
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  locales: SUPPORTED_LOCALES,
  setLocale: () => {},
  t: (key: string, fallback?: string) => tForLocale(DEFAULT_LOCALE, key, fallback),
};

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved && SUPPORTED_LOCALES.includes(saved as any) ? saved : DEFAULT_LOCALE;
  });

  const dir: "rtl" | "ltr" = isRtlLocale(locale) ? "rtl" : "ltr";

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      locales: SUPPORTED_LOCALES,
      setLocale,
      t: (key: string, fallback?: string) => tForLocale(locale, key, fallback),
    }),
    [locale, dir]
  );

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation(): TranslationContextType {
  const ctx = useContext(TranslationContext);
  if (!ctx) return FALLBACK_VALUE;
  return ctx;
}

