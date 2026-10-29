import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "./locales/en/common.json";
import commonAr from "./locales/ar/common.json";
import type { SupportedLanguage, TextDirection } from "./types";

export const SUPPORTED_LANGUAGES = ["en", "ar"] as const;
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";
export const LANGUAGE_STORAGE_KEY = "stren_language";

export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === "undefined") {
    return DEFAULT_LANGUAGE;
  }

  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved === "en" || saved === "ar") {
      return saved;
    }
  } catch {
    // Gracefully handle privacy or storage restrictions
  }

  return DEFAULT_LANGUAGE;
};

export const getDirectionForLanguage = (lang: string): TextDirection => {
  return lang === "ar" ? "rtl" : "ltr";
};

export const updateDocumentAttributes = (lang: string): void => {
  if (typeof document === "undefined") return;

  const validLang = lang === "ar" ? "ar" : "en";
  const dir = getDirectionForLanguage(validLang);

  document.documentElement.lang = validLang;
  document.documentElement.dir = dir;
};

const initialLang = getInitialLanguage();

// Apply document attributes immediately upon module load to prevent flash of wrong direction
updateDocumentAttributes(initialLang);

i18n.use(initReactI18next).init({
  resources: {
    en: { common: commonEn },
    ar: { common: commonAr },
  },
  lng: initialLang,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: ["common"],
  interpolation: {
    escapeValue: false, // React already escapes values
  },
  react: {
    useSuspense: false, // Prevents loading suspensions during initialization
  },
});

// Centralized listener: update storage and document direction on any language switch
i18n.on("languageChanged", (lng: string) => {
  const normalized = lng === "ar" ? "ar" : "en";
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  } catch {
    // Ignore storage quota/permission errors
  }
  updateDocumentAttributes(normalized);
});

export const changeLanguage = async (lang: SupportedLanguage): Promise<void> => {
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language === "ar" ? "ar" : "en") as SupportedLanguage;
};

export const isRTL = (): boolean => {
  return getCurrentLanguage() === "ar";
};

export default i18n;
export * from "./types";
export { LanguageSwitcher } from "../components/shared/LanguageSwitcher/LanguageSwitcher";
export type { LanguageSwitcherProps } from "../components/shared/LanguageSwitcher/LanguageSwitcher";
