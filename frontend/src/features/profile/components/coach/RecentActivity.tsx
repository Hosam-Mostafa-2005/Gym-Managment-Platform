// src/features/profile/components/coach/RecentActivity.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Activity, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";
import { ProfileSection } from "../shared/ProfileSection";
import type { CoachActivity } from "../../types/profile.types";

interface RecentActivityProps {
  recentActivity: CoachActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  recentActivity = [],
}) => {
  const { t, i18n } = useTranslation(["profile"]);

  const formatDate = (dateStr: string) => {
    try {
      const locale = i18n.language === "ar" ? "ar-EG" : "en-US";
      return new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <ProfileSection title={t("coach.recentActivity.title")} icon={Activity}>
      {recentActivity?.length > 0 ? (
        <div className="divide-y divide-[#1e2329]">
          {recentActivity.map((item, idx) => {
            const memberId = item.member?.id;
            const memberName = item.member?.name || t("coach.recentActivity.systemAthlete");
            return (
              <div
                key={idx}
                className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0 hover:bg-white/[0.02] transition-colors"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs font-semibold text-gray-200">
                    {item.action}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <span>{t("coach.recentActivity.athlete")}</span>
                    {memberId ? (
                      <Link
                        to={`/members/${memberId}`}
                        className="text-gray-300 hover:text-[#5BE584] transition-colors font-medium"
                      >
                        {memberName}
                      </Link>
                    ) : (
                      <span className="text-gray-400">{memberName}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500 whitespace-nowrap">
                  <Clock className="h-3 w-3 text-gray-600" />
                  <span>{formatDate(item.date)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          {t("coach.recentActivity.empty")}
        </div>
      )}
    </ProfileSection>
  );
};

export default RecentActivity;
