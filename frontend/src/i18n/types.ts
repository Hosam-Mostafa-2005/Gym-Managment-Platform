import type commonEn from "./locales/en/common.json";

export type SupportedLanguage = "en" | "ar";
export type TextDirection = "ltr" | "rtl";

export interface TranslationResources {
  common: typeof commonEn;
}

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "common";
    resources: TranslationResources;
  }
}
