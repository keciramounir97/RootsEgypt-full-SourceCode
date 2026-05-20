import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  isRtlLocale,
  tForLocale,
  type SupportedLocale,
} from "../utils/translations";

const STORAGE_KEY = "locale";

interface DataI18nContextType {
  locale: SupportedLocale;
  dir: "rtl" | "ltr";
  locales: readonly string[];
  setLocale: (locale: string) => void;
  t: (key: string, fallback?: string) => string;
  isLoading: boolean;
}

const DataI18nContext = createContext<DataI18nContextType | null>(null);

const FALLBACK_VALUE: DataI18nContextType = {
  locale: DEFAULT_LOCALE,
  dir: "ltr",
  locales: SUPPORTED_LOCALES,
  setLocale: () => {},
  t: (key: string, fallback?: string) => tForLocale(DEFAULT_LOCALE, key, fallback),
  isLoading: false,
};

export function DataI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<SupportedLocale>(() => {
    if (typeof window === "undefined") return DEFAULT_LOCALE;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved && SUPPORTED_LOCALES.includes(saved as SupportedLocale)
      ? (saved as SupportedLocale)
      : DEFAULT_LOCALE;
  });

  const [isLoading, setIsLoading] = useState(false);

  const dir: "rtl" | "ltr" = isRtlLocale(locale) ? "rtl" : "ltr";

  const setLocale = (nextLocale: string) => {
    setIsLoading(true);
    const normalized = SUPPORTED_LOCALES.includes(nextLocale as SupportedLocale)
      ? (nextLocale as SupportedLocale)
      : DEFAULT_LOCALE;
    setLocaleState(normalized);
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 100);
  };

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // ignore
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
    document.documentElement.dataset.locale = locale;
  }, [locale, dir]);

  const value = useMemo(
    () => ({
      locale,
      dir,
      locales: SUPPORTED_LOCALES,
      setLocale,
      t: (key: string, fallback?: string) => tForLocale(locale, key, fallback),
      isLoading,
    }),
    [locale, dir, isLoading]
  );

  return (
    <DataI18nContext.Provider value={value}>
      {children}
    </DataI18nContext.Provider>
  );
}

export function useDataI18n(): DataI18nContextType {
  const ctx = useContext(DataI18nContext);
  if (!ctx) return FALLBACK_VALUE;
  return ctx;
}
