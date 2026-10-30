// src/features/coach-dashboard/components/states/DashboardEmpty.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Activity } from "lucide-react";

export const DashboardEmpty: React.FC = () => {
  const { t } = useTranslation(["coachDashboard"]);

  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#101418] p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#16291D] border border-[#23422E] text-[#5BE584] mb-3">
        <Activity className="h-6 w-6" />
      </div>
      <h3 className="text-sm font-semibold text-white">
        {t("states.emptyTitle")}
      </h3>
      <p className="mt-1 max-w-sm text-xs text-gray-400">
        {t("states.emptySubtitle")}
      </p>
    </div>
  );
};
