// src/features/coach-dashboard/components/assignments/UpcomingAssignments.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ClipboardList,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import type { UpcomingAssignment } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface UpcomingAssignmentsProps {
  assignments?: UpcomingAssignment[];
}

export const UpcomingAssignments: React.FC<UpcomingAssignmentsProps> = ({
  assignments = [],
}) => {
  const { t, i18n } = useTranslation(["coachDashboard"]);
  const hasAssignments = assignments && assignments.length > 0;
  const currentLang = i18n.language === "ar" ? "ar-EG" : "en-US";

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return t("upcomingAssignments.notApplicable");
    try {
      return new Intl.DateTimeFormat(currentLang, {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateValue));
    } catch {
      return t("upcomingAssignments.invalidDate");
    }
  };

  const getUrgencyVisuals = (daysRemaining?: number) => {
    if (daysRemaining !== undefined && daysRemaining <= 1) {
      return {
        badge: "text-red-400 bg-red-400/10 border-red-500/20",
        text: t("upcomingAssignments.endingVerySoon"),
      };
    }
    if (daysRemaining !== undefined && daysRemaining <= 3) {
      return {
        badge: "text-yellow-400 bg-yellow-400/10 border-yellow-500/20",
        text: t("upcomingAssignments.endingSoon"),
      };
    }
    return {
      badge: "text-gray-400 bg-white/[0.02] border-[#1e2329]",
      text: t("upcomingAssignments.activeCycle"),
    };
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#1e2329] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-100">
            {t("upcomingAssignments.title")}
          </h2>
        </div>
        {hasAssignments && (
          <span className="inline-flex rounded-full bg-[#16291d] px-2.5 py-0.5 text-[10px] font-bold text-[#5BE584] uppercase tracking-wider border border-[#23422e]">
            {t("upcomingAssignments.tracking", {
              count: assignments.length,
            })}
          </span>
        )}
      </div>

      {/* Content List */}
      {hasAssignments ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[540px] text-left rtl:text-right text-xs text-gray-300">
            <thead className="border-b border-[#1e2329] bg-[#13171d]/50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("upcomingAssignments.thAthlete")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("upcomingAssignments.thProgram")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("upcomingAssignments.thEndDate")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("upcomingAssignments.thTimeRemaining")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-right rtl:text-left">
                  {t("upcomingAssignments.thAction")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {assignments.map((item, index) => {
                const memberId = item.member?.id;
                const memberName = item.member?.name || t("upcomingAssignments.unknownAthlete");
                const workoutTitle = item.workout?.title || t("upcomingAssignments.customRoutine");
                const urgency = getUrgencyVisuals(item.daysRemaining);

                return (
                  <tr
                    key={item.id || index}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Member */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">
                          {memberName}
                        </span>
                        {item.member?.email && (
                          <span className="text-[10px] text-gray-500 truncate max-w-[160px]">
                            {item.member.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Workout Title */}
                    <td className="px-5 py-3.5">
                      <span className="font-medium text-gray-300 line-clamp-1">
                        {workoutTitle}
                      </span>
                    </td>

                    {/* End Date */}
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{formatDate(item.endDate)}</span>
                      </div>
                    </td>

                    {/* Days Remaining / Urgency */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${urgency.badge}`}
                        >
                          <Clock className="h-3 w-3" />
                          <span>
                            {item.daysRemaining !== undefined
                              ? t("upcomingAssignments.daysRemaining", {
                                  count: item.daysRemaining,
                                })
                              : urgency.text}
                          </span>
                        </span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                      {memberId ? (
                        <Link
                          to={`/members/${memberId}`}
                          className="inline-flex items-center gap-1 rounded bg-[#13171d] border border-[#1e2329] px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white"
                        >
                          <span>{t("upcomingAssignments.review")}</span>
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-[11px]">{t("upcomingAssignments.notApplicable")}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#16291d] border border-[#23422e] mb-3">
            <CheckCircle2 className="h-5 w-5 text-[#5BE584]" />
          </div>
          <p className="text-sm font-semibold text-gray-200">
            {t("upcomingAssignments.emptyTitle")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("upcomingAssignments.emptyDesc")}
          </p>
        </div>
      )}
    </div>
  );
};
