// src/features/coach-dashboard/components/dashboard-header/DashboardHeader.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";

interface DashboardHeaderProps {
  generatedAt?: string | Date;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  generatedAt,
}) => {
  const { t, i18n } = useTranslation(["coachDashboard"]);
  const currentLang = i18n.language === "ar" ? "ar-EG" : "en-US";

  const formattedDate = generatedAt
    ? new Intl.DateTimeFormat(currentLang, {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(generatedAt))
    : t("header.liveTelemetry");

  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#5BE584] uppercase">
            {t("header.commandOverview")}
          </span>
          <span className="text-gray-600 text-[10px]">•</span>
          <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#5BE584] animate-pulse" />
            {t("header.telemetrySynced")}
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-100">
          {t("header.title")}
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <p>{t("header.subtitle")}</p>
          <span className="hidden md:inline-block text-gray-600">|</span>
          <p className="hidden md:inline-block font-medium text-gray-300">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};
