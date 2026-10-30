// src/features/dashboard/member/components/progress/ProgressOverview.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { Target } from "lucide-react";
import { ProgressMetric } from "./ProgressMetric";

interface ProgressOverviewProps {
  overview: any;
}

export const ProgressOverview: React.FC<ProgressOverviewProps> = ({
  overview,
}) => {
  const { t } = useTranslation(["dashboard"]);

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="flex items-center gap-2">
        <Target className="h-5 w-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-white">
          {t("member.progressOverview.title")}
        </h2>
      </div>

      <div className="flex flex-col gap-4">
        <ProgressMetric
          label={t("member.progressOverview.overallProgress")}
          value={overview?.currentProgress || 0}
        />
        <ProgressMetric
          label={t("member.progressOverview.completionRate")}
          value={overview?.completionRate || 0}
        />
        <ProgressMetric
          label={t("member.progressOverview.attendanceRate")}
          value={overview?.attendanceRate || 0}
        />
      </div>
    </div>
  );
};
