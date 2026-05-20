import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import en from "./translations/en";
import fr from "./translations/fr";
import ar from "./translations/ar";
import es from "./translations/es";

export type LanguageCode = "en" | "fr" | "ar" | "es";

export interface LanguageOption {
  code: LanguageCode;
  name: string;
  dir: "ltr" | "rtl";
}

type TranslationTree = Record<string, unknown>;

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (language: LanguageCode | string) => void;
  t: (key: string, fallback?: string) => string;
  dir: "ltr" | "rtl";
  availableLanguages: readonly LanguageOption[];
}

const STORAGE_KEY = "rootsegypt_language";
const LEGACY_STORAGE_KEY = "locale";
const DEFAULT_LANGUAGE: LanguageCode = "en";

const translations: Record<LanguageCode, TranslationTree> = {
  en,
  fr,
  ar,
  es,
};

export const availableLanguages = [
  { code: "en", name: "English", dir: "ltr" },
  { code: "fr", name: "Français", dir: "ltr" },
  { code: "ar", name: "العربية", dir: "rtl" },
  { code: "es", name: "Español", dir: "ltr" },
] as const satisfies readonly LanguageOption[];

const isLanguageCode = (value: string | null | undefined): value is LanguageCode =>
  value === "en" || value === "fr" || value === "ar" || value === "es";

const readStoredLanguage = (): LanguageCode => {
  if (typeof window === "undefined") return DEFAULT_LANGUAGE;

  const current = window.localStorage.getItem(STORAGE_KEY);
  if (isLanguageCode(current)) return current;

  const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (isLanguageCode(legacy)) return legacy;

  return DEFAULT_LANGUAGE;
};

const getByPath = (tree: TranslationTree | undefined, key: string): unknown => {
  if (!tree) return undefined;
  return key.split(".").reduce<unknown>((current, segment) => {
    if (current && typeof current === "object" && segment in current) {
      return (current as Record<string, unknown>)[segment];
    }
    return undefined;
  }, tree);
};

const warnMissingKey = (key: string, language: LanguageCode) => {
  if (import.meta.env.DEV) {
    console.warn(`[i18n] Missing translation key "${key}" for language "${language}"`);
  }
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const fallbackValue: LanguageContextValue = {
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  t: (key: string, fallback?: string) => fallback ?? key,
  dir: "ltr",
  availableLanguages,
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(readStoredLanguage);

  const dir = language === "ar" ? "rtl" : "ltr";

  const setLanguage = useCallback((nextLanguage: LanguageCode | string) => {
    setLanguageState(isLanguageCode(nextLanguage) ? nextLanguage : DEFAULT_LANGUAGE);
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, language);
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    } catch {
      // Storage can fail in private browsing or locked-down embeds.
    }
  }, [language]);

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
    document.documentElement.dataset.language = language;
  }, [language, dir]);

  const t = useCallback(
    (key: string, fallback?: string): string => {
      const value = getByPath(translations[language], key);
      if (typeof value === "string" && value) return value;

      const defaultValue = getByPath(translations[DEFAULT_LANGUAGE], key);
      if (typeof defaultValue === "string" && defaultValue) return defaultValue;

      warnMissingKey(key, language);
      return fallback ?? key;
    },
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t,
      dir,
      availableLanguages,
    }),
    [language, setLanguage, t, dir],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext) ?? fallbackValue;
}

