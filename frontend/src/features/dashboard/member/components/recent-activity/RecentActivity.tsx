// src/features/dashboard/member/components/recent-activity/RecentActivity.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { History, ChevronRight, ArrowRight } from "lucide-react";
import { ActivityItem } from "./ActivityItem";

interface RecentActivityProps {
  activities?: any[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
}) => {
  const { t } = useTranslation(["dashboard"]);
  if (activities.length === 0) return null;

  const displayedActivities = activities.slice(0, 5);

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 transition hover:border-[#2A313C]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            {t("member.recentActivity.title")}
          </h2>
        </div>

        <Link
          to="/dashboard/activity"
          className="flex items-center gap-1 text-xs font-medium text-[#5BE584] hover:underline"
        >
          <span>{t("member.recentActivity.viewFullLog")}</span>
          <ChevronRight className="h-3.5 w-3.5 rtl:rotate-180" />
        </Link>
      </div>

      <div className="flex flex-col">
        {displayedActivities.map((activity, index) => (
          <ActivityItem key={activity.id || index} activity={activity} />
        ))}
      </div>

      {activities.length > 5 && (
        <div className="mt-2 border-t border-[#1E2329] pt-3 text-center">
          <Link
            to="/dashboard/activity"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition"
          >
            <span>
              {t("member.recentActivity.viewAllRecords", {
                count: activities.length,
              })}
            </span>
            <ArrowRight className="h-3.5 w-3.5 text-[#5BE584] rtl:rotate-180" />
          </Link>
        </div>
      )}
    </div>
  );
};
