import React from "react";
import { useTranslation } from "react-i18next";
import { Languages } from "lucide-react";
import { changeLanguage, getCurrentLanguage } from "../../../i18n";
import type { SupportedLanguage } from "../../../i18n";

export interface LanguageSwitcherProps {
  className?: string;
  variant?: "compact" | "pill" | "full";
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = "",
  variant = "compact",
}) => {
  const { t, i18n } = useTranslation();
  const currentLang = (
    i18n.language === "ar" ? "ar" : "en"
  ) as SupportedLanguage;

  const handleToggle = () => {
    const nextLang: SupportedLanguage = currentLang === "en" ? "ar" : "en";
    changeLanguage(nextLang);
  };

  const handleSelect = (lang: SupportedLanguage) => {
    if (lang !== currentLang) {
      changeLanguage(lang);
    }
  };

  // Full segmented pill with both language buttons
  if (variant === "full") {
    return (
      <div
        role="group"
        aria-label={t("language.switcherLabel", "Language")}
        className={`inline-flex items-center rounded-[12px] border border-[#2A3039] bg-[#13171D] p-0.5 text-xs font-semibold ${className}`}
      >
        <button
          type="button"
          onClick={() => handleSelect("en")}
          aria-pressed={currentLang === "en"}
          className={`flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584] ${
            currentLang === "en"
              ? "bg-[#16291D] text-[#5BE584] border border-[#23422E]"
              : "text-[#94A3B8] hover:text-[#F8FAFC]"
          }`}
        >
          English
        </button>

        <button
          type="button"
          onClick={() => handleSelect("ar")}
          aria-pressed={currentLang === "ar"}
          className={`flex items-center gap-1.5 rounded-[10px] px-2.5 py-1.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584] ${
            currentLang === "ar"
              ? "bg-[#16291D] text-[#5BE584] border border-[#23422E]"
              : "text-[#94A3B8] hover:text-[#F8FAFC]"
          }`}
        >
          العربية
        </button>
      </div>
    );
  }

  // Segmented Pill variant
  if (variant === "pill") {
    return (
      <div
        role="group"
        aria-label={t("language.switcherLabel", "Language")}
        className={`inline-flex items-center rounded-[12px] border border-[#2A3039] bg-[#13171D] p-1 text-xs font-semibold ${className}`}
      >
        <button
          type="button"
          onClick={() => handleSelect("en")}
          aria-pressed={currentLang === "en"}
          className={`px-2 py-1 rounded-[8px] transition-colors ${
            currentLang === "en"
              ? "bg-[#5BE584] text-[#090B0F] font-bold"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          EN
        </button>
        <button
          type="button"
          onClick={() => handleSelect("ar")}
          aria-pressed={currentLang === "ar"}
          className={`px-2 py-1 rounded-[8px] transition-colors ${
            currentLang === "ar"
              ? "bg-[#5BE584] text-[#090B0F] font-bold"
              : "text-[#94A3B8] hover:text-white"
          }`}
        >
          عربي
        </button>
      </div>
    );
  }

  // Compact header button (default)
  const targetLabel = currentLang === "en" ? "العربية" : "English";
  const targetAria =
    currentLang === "en"
      ? t("language.switchToArabic", "Switch to Arabic")
      : t("language.switchToEnglish", "Switch to English");

  return (
    <button
      type="button"
      onClick={handleToggle}
      title={targetAria}
      aria-label={targetAria}
      className={`flex h-9 cursor-pointer items-center gap-1.5 rounded-[12px] border border-[#2A3039] bg-[#13171D] px-2.5 text-xs font-semibold text-[#94A3B8] transition-colors hover:bg-[#1B2028] hover:text-[#F8FAFC] hover:border-[#3B4351] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5BE584] ${className}`}
    >
      <Languages className="h-4 w-4 text-[#5BE584] shrink-0" />
      <span className="font-medium text-[#F8FAFC]">{targetLabel}</span>
    </button>
  );
};

export default LanguageSwitcher;
