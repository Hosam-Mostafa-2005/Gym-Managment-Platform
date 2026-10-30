// src/features/coach-dashboard/components/activity/RecentActivity.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Activity as ActivityIcon,
  CheckCircle2,
  Clock,
  Play,
  Calendar,
  Scale,
  ChevronDown,
  ChevronUp,
  Users,
} from "lucide-react";
import type { DashboardActivity } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface RecentActivityProps {
  activities?: DashboardActivity[];
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = [],
}) => {
  const { t } = useTranslation(["coachDashboard"]);
  const [isExpanded, setIsExpanded] = useState(false);
  const hasActivities = activities && activities.length > 0;
  const displayedActivities = isExpanded ? activities : activities.slice(0, 6);

  const formatTimestamp = (dateValue: string | Date | null) => {
    if (!dateValue) return t("recentActivity.justNow");
    try {
      const date = new Date(dateValue);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 1) return t("recentActivity.justNow");
      if (diffMins < 60) return t("recentActivity.minsAgo", { count: diffMins });
      if (diffHours < 24)
        return t("recentActivity.hoursAgo", { count: diffHours });
      return t("recentActivity.daysAgo", { count: diffDays });
    } catch {
      return t("recentActivity.recently");
    }
  };

  const formatDuration = (mins?: number | null) => {
    if (mins === undefined || mins === null) return null;
    if (mins <= 0) return t("recentActivity.lessThanOneMin");
    if (mins < 60) return t("recentActivity.minsDuration", { count: mins });
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    return remMins > 0
      ? t("recentActivity.hoursMinsDuration", { hours: hrs, mins: remMins })
      : t("recentActivity.hoursDuration", { count: hrs });
  };

  const getActionDetails = (item: DashboardActivity) => {
    const action = item.action?.toUpperCase();
    const type = item.type?.toUpperCase();

    if (action === "COMPLETED" || (!action && type === "WORKOUT")) {
      return {
        verb: t("recentActivity.verbCompleted"),
        Icon: CheckCircle2,
        badgeClasses: "bg-[#5BE584]/10 border-[#5BE584]/20 text-[#5BE584]",
      };
    }

    if (action === "STARTED") {
      return {
        verb: t("recentActivity.verbStarted"),
        Icon: Play,
        badgeClasses: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      };
    }

    if (action === "CREATED" || type === "ASSIGNMENT") {
      return {
        verb: t("recentActivity.verbAssigned"),
        Icon: Calendar,
        badgeClasses: "bg-purple-500/10 border-purple-500/20 text-purple-400",
      };
    }

    if (action === "RECORDED" || type === "BODY_MEASUREMENT") {
      return {
        verb: t("recentActivity.verbLoggedMetrics"),
        Icon: Scale,
        badgeClasses: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400",
      };
    }

    return {
      verb: t("recentActivity.verbLogged"),
      Icon: ActivityIcon,
      badgeClasses: "bg-gray-500/10 border-gray-500/20 text-gray-400",
    };
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] overflow-hidden shadow-sm transition hover:border-[#2A313C]">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#1E2329] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <ActivityIcon className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {t("recentActivity.title")}
            </h2>
            <p className="text-xs text-gray-400">
              {t("recentActivity.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/coach-dashboard/activity"
            className="flex items-center gap-1 text-xs font-medium text-[#5BE584] hover:underline transition-colors"
          >
            <span>{t("recentActivity.fullActivityFeed")}</span>
          </Link>
          <span className="text-gray-600">|</span>
          <Link
            to="/members"
            className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
          >
            <Users className="h-3.5 w-3.5" />
            <span>{t("recentActivity.roster")}</span>
          </Link>
        </div>
      </div>

      {/* Activity Feed List */}
      {hasActivities ? (
        <>
          <div className="divide-y divide-[#1E2329]">
            {displayedActivities.map((item, index) => {
              const memberId = item.member?.id;
              const memberName = item.member?.name || t("recentActivity.fallbackMember");
              const workoutTitle =
                item.metadata?.workoutTitle || item.action || t("recentActivity.activityLogged");
              const timeAgo = formatTimestamp(item.date);
              const { verb, Icon, badgeClasses } = getActionDetails(item);
              const formattedDuration = formatDuration(item.metadata?.duration);

              return (
                <div
                  key={item.id || index}
                  className="flex items-start justify-between gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${badgeClasses}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <div className="text-xs text-gray-300">
                        {memberId ? (
                          <Link
                            to={`/members/${memberId}`}
                            className="font-semibold text-white hover:text-[#5BE584] transition-colors mr-1.5 rtl:mr-0 rtl:ml-1.5"
                          >
                            {memberName}
                          </Link>
                        ) : (
                          <span className="font-semibold text-white mr-1.5 rtl:mr-0 rtl:ml-1.5">
                            {memberName}
                          </span>
                        )}
                        <span className="text-gray-400 mr-1.5 rtl:mr-0 rtl:ml-1.5">{verb}</span>
                        <span className="font-medium text-white">
                          {workoutTitle}
                        </span>
                      </div>

                      {item.metadata && Object.keys(item.metadata).length > 0 && (
                        <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-400 mt-1">
                          {formattedDuration && (
                            <span>
                              {t("recentActivity.duration")}{" "}
                              <strong className="text-gray-300 font-mono">
                                {formattedDuration}
                              </strong>
                            </span>
                          )}
                          {item.metadata.volume !== undefined &&
                            item.metadata.volume > 0 && (
                              <span>
                                {t("recentActivity.volume")}{" "}
                                <strong className="text-gray-300 font-mono">
                                  {item.metadata.volume.toLocaleString()}kg
                                </strong>
                              </span>
                            )}
                          {item.metadata.weight !== undefined && (
                            <span>
                              {t("recentActivity.weight")}{" "}
                              <strong className="text-gray-300 font-mono">
                                {item.metadata.weight}kg
                              </strong>
                            </span>
                          )}
                          {item.metadata.bodyFat !== undefined && (
                            <span>
                              {t("recentActivity.bodyFat")}{" "}
                              <strong className="text-gray-300 font-mono">
                                {item.metadata.bodyFat}%
                              </strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-gray-500 whitespace-nowrap shrink-0">
                    <Clock className="h-3 w-3 text-gray-500" />
                    <span>{timeAgo}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Show More / Show Less Toggle Button */}
          {activities.length > 6 && (
            <div className="border-t border-[#1E2329] bg-[#0D1014] px-5 py-2.5 text-center">
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-white transition-colors"
              >
                <span>
                  {isExpanded
                    ? t("recentActivity.showFewer")
                    : t("recentActivity.showAll", {
                        count: activities.length,
                      })}
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#161B22] border border-[#1E2329] mb-3">
            <ActivityIcon className="h-5 w-5 text-gray-500" />
          </div>
          <p className="text-sm font-semibold text-white">
            {t("recentActivity.emptyTitle")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("recentActivity.emptyDesc")}
          </p>
        </div>
      )}
    </div>
  );
};
