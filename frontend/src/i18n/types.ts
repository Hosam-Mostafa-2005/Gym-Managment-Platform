import type commonEn from "./locales/en/common.json";
import type workoutsEn from "./locales/en/workouts.json";
import type exercisesEn from "./locales/en/exercises.json";
import type assignmentsEn from "./locales/en/assignments.json";
import type workoutSessionsEn from "./locales/en/workoutSessions.json";
import type bodyMeasurementsEn from "./locales/en/bodyMeasurements.json";
import type trainingCalendarEn from "./locales/en/trainingCalendar.json";
import type nutritionEn from "./locales/en/nutrition.json";
import type achievementsEn from "./locales/en/achievements.json";
import type profileEn from "./locales/en/profile.json";
import type notificationsEn from "./locales/en/notifications.json";
import type dashboardEn from "./locales/en/dashboard.json";
import type coachDashboardEn from "./locales/en/coachDashboard.json";
import type landingEn from "./locales/en/landing.json";
import type authEn from "./locales/en/auth.json";

export type SupportedLanguage = "en" | "ar";
export type TextDirection = "ltr" | "rtl";

export interface TranslationResources {
  common: typeof commonEn;
  workouts: typeof workoutsEn;
  exercises: typeof exercisesEn;
  assignments: typeof assignmentsEn;
  workoutSessions: typeof workoutSessionsEn;
  bodyMeasurements: typeof bodyMeasurementsEn;
  trainingCalendar: typeof trainingCalendarEn;
  nutrition: typeof nutritionEn;
  achievements: typeof achievementsEn;
  profile: typeof profileEn;
  notifications: typeof notificationsEn;
  dashboard: typeof dashboardEn;
  coachDashboard: typeof coachDashboardEn;
  landing: typeof landingEn;
  auth: typeof authEn;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
