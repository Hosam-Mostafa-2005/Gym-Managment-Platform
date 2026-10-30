// src/features/dashboard/member/components/states/DashboardEmpty.tsx
import React from "react";
import { Inbox } from "lucide-react";
import { useTranslation } from "react-i18next";

export const DashboardEmpty: React.FC = () => {
  const { t } = useTranslation(["dashboard"]);

  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center p-4 md:p-6 lg:p-8 min-h-[60vh]">
      <div className="flex flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-12 max-w-md">
        <Inbox className="h-12 w-12 text-gray-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">
          {t("states.noDataTitle")}
        </h2>
        <p className="text-sm text-gray-400">
          {t("states.noDataSubtitle")}
        </p>
      </div>
    </main>
  );
};
