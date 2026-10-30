import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import commonEn from "./locales/en/common.json";
import commonAr from "./locales/ar/common.json";
import workoutsEn from "./locales/en/workouts.json";
import workoutsAr from "./locales/ar/workouts.json";
import exercisesEn from "./locales/en/exercises.json";
import exercisesAr from "./locales/ar/exercises.json";
import assignmentsEn from "./locales/en/assignments.json";
import assignmentsAr from "./locales/ar/assignments.json";
import workoutSessionsEn from "./locales/en/workoutSessions.json";
import workoutSessionsAr from "./locales/ar/workoutSessions.json";
import bodyMeasurementsEn from "./locales/en/bodyMeasurements.json";
import bodyMeasurementsAr from "./locales/ar/bodyMeasurements.json";
import trainingCalendarEn from "./locales/en/trainingCalendar.json";
import trainingCalendarAr from "./locales/ar/trainingCalendar.json";
import nutritionEn from "./locales/en/nutrition.json";
import nutritionAr from "./locales/ar/nutrition.json";
import achievementsEn from "./locales/en/achievements.json";
import achievementsAr from "./locales/ar/achievements.json";
import profileEn from "./locales/en/profile.json";
import profileAr from "./locales/ar/profile.json";
import notificationsEn from "./locales/en/notifications.json";
import notificationsAr from "./locales/ar/notifications.json";
import dashboardEn from "./locales/en/dashboard.json";
import dashboardAr from "./locales/ar/dashboard.json";
import coachDashboardEn from "./locales/en/coachDashboard.json";
import coachDashboardAr from "./locales/ar/coachDashboard.json";
import landingEn from "./locales/en/landing.json";
import landingAr from "./locales/ar/landing.json";
import authEn from "./locales/en/auth.json";
import authAr from "./locales/ar/auth.json";
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
    en: {
      common: commonEn,
      workouts: workoutsEn,
      exercises: exercisesEn,
      assignments: assignmentsEn,
      workoutSessions: workoutSessionsEn,
      bodyMeasurements: bodyMeasurementsEn,
      trainingCalendar: trainingCalendarEn,
      nutrition: nutritionEn,
      achievements: achievementsEn,
      profile: profileEn,
      notifications: notificationsEn,
      dashboard: dashboardEn,
      coachDashboard: coachDashboardEn,
      landing: landingEn,
      auth: authEn,
    },
    ar: {
      common: commonAr,
      workouts: workoutsAr,
      exercises: exercisesAr,
      assignments: assignmentsAr,
      workoutSessions: workoutSessionsAr,
      bodyMeasurements: bodyMeasurementsAr,
      trainingCalendar: trainingCalendarAr,
      nutrition: nutritionAr,
      achievements: achievementsAr,
      profile: profileAr,
      notifications: notificationsAr,
      dashboard: dashboardAr,
      coachDashboard: coachDashboardAr,
      landing: landingAr,
      auth: authAr,
    },
  },
  lng: initialLang,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: "common",
  ns: ["common", "workouts", "exercises", "assignments", "workoutSessions", "bodyMeasurements", "trainingCalendar", "nutrition", "achievements", "profile", "notifications", "dashboard", "coachDashboard", "landing", "auth"],
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
  if (lang !== "en" && lang !== "ar") return;
  await i18n.changeLanguage(lang);
};

export const getCurrentLanguage = (): SupportedLanguage => {
  return (i18n.language === "ar" ? "ar" : "en") as SupportedLanguage;
};

export const isRTL = (): boolean => {
  return getCurrentLanguage() === "ar";
};

export const toggleLanguage = async (): Promise<SupportedLanguage> => {
  const current = (i18n.language === "ar" ? "ar" : "en") as SupportedLanguage;
  const next: SupportedLanguage = current === "ar" ? "en" : "ar";
  await changeLanguage(next);
  return next;
};

export default i18n;
export * from "./types";
export { LanguageSwitcher } from "../components/shared/LanguageSwitcher/LanguageSwitcher";
export type { LanguageSwitcherProps } from "../components/shared/LanguageSwitcher/LanguageSwitcher";
