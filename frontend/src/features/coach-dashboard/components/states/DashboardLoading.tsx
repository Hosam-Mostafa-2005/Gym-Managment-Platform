// src/features/coach-dashboard/components/states/DashboardLoading.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";

export const DashboardLoading: React.FC = () => {
  const { t } = useTranslation(["coachDashboard"]);

  return (
    <div className="flex h-96 flex-col items-center justify-center gap-3">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#5BE584]/10 text-[#5BE584] animate-pulse">
        <Activity className="h-6 w-6" />
      </div>
      <p className="text-sm font-semibold text-gray-200">
        {t("states.loadingTitle")}
      </p>
      <p className="text-xs text-gray-500">
        {t("states.loadingSubtitle")}
      </p>
    </div>
  );
};
