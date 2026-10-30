// src/features/coach-dashboard/components/members-attention/MembersNeedingAttention.tsx
import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Users, AlertTriangle, ArrowRight, Calendar } from "lucide-react";
import type { MemberAttention } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface MembersNeedingAttentionProps {
  members: MemberAttention[];
}

export const MembersNeedingAttention: React.FC<
  MembersNeedingAttentionProps
> = ({ members = [] }) => {
  const { t, i18n } = useTranslation(["coachDashboard"]);
  const hasMembers = members && members.length > 0;
  const currentLang = i18n.language === "ar" ? "ar-EG" : "en-US";

  const formatDate = (dateValue: Date | string | null) => {
    if (!dateValue) return t("measurements.noRecord");
    try {
      return new Intl.DateTimeFormat(currentLang, {
        month: "short",
        day: "numeric",
      }).format(new Date(dateValue));
    } catch {
      return t("measurements.noRecord");
    }
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#1e2329] px-5 py-4">
        <div className="flex items-center gap-2.5">
          <Users className="h-4 w-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-100">
            {t("membersAttention.title")}
          </h2>
        </div>
        {hasMembers && (
          <span className="inline-flex rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-400 uppercase tracking-wider border border-yellow-500/20">
            {t("membersAttention.flagged", { count: members.length })}
          </span>
        )}
      </div>

      {/* Table Content */}
      {hasMembers ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left rtl:text-right text-xs text-gray-300">
            <thead className="border-b border-[#1e2329] bg-[#13171d]/50 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("membersAttention.thAthlete")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("membersAttention.thAttentionFlag")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("membersAttention.thCompliance")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  {t("membersAttention.thLastSession")}
                </th>
                <th scope="col" className="px-5 py-3 font-medium text-right rtl:text-left">
                  {t("membersAttention.thIntervention")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e2329]">
              {members.map((item, index) => {
                const memberId = item.member?.id || item.member?._id;
                const memberName = item.member?.name || t("membersAttention.unknownAthlete");
                const memberEmail = item.member?.email;

                return (
                  <tr
                    key={memberId || index}
                    className="transition-colors hover:bg-white/[0.02]"
                  >
                    {/* Member */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-200">
                          {memberName}
                        </span>
                        {memberEmail && (
                          <span className="text-[10px] text-gray-500 truncate max-w-[160px]">
                            {memberEmail}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Reasons / Flags */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1 max-w-xs">
                        {item.reasons && item.reasons.length > 0 ? (
                          item.reasons.map((reason, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-yellow-400/90"
                            >
                              <AlertTriangle className="h-3 w-3 shrink-0 text-yellow-500" />
                              <span className="line-clamp-1">{reason}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-gray-500">
                            {t("membersAttention.routineCheck")}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Completion Rate */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-[#1e2329] overflow-hidden">
                          <div
                            className="h-full bg-[#5BE584]"
                            style={{
                              width: `${Math.min(Math.max(item.completionRate || 0, 0), 100)}%`,
                            }}
                          />
                        </div>
                        <span className="font-mono text-[11px] text-gray-400">
                          {item.completionRate}%
                        </span>
                      </div>
                    </td>

                    {/* Last Workout */}
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-gray-400">
                        <Calendar className="h-3 w-3 text-gray-500" />
                        <span>{formatDate(item.lastWorkout)}</span>
                        {item.daysSinceWorkout !== undefined &&
                          item.daysSinceWorkout !== null && (
                            <span className="text-[10px] text-gray-600">
                              {t("membersAttention.daysAgo", {
                                days: item.daysSinceWorkout,
                              })}
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Action / Intervention */}
                    <td className="px-5 py-3.5 text-right rtl:text-left whitespace-nowrap">
                      {memberId ? (
                        <Link
                          to={`/members/${memberId}`}
                          className="inline-flex items-center gap-1 rounded bg-[#13171d] border border-[#1e2329] px-2.5 py-1.5 text-[11px] font-medium text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white"
                        >
                          <span>{t("membersAttention.openProfile")}</span>
                          <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                        </Link>
                      ) : (
                        <span className="text-gray-600 text-[11px]">
                          {t("membersAttention.unavailable")}
                        </span>
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
            <Users className="h-5 w-5 text-[#5BE584]" />
          </div>
          <p className="text-sm font-semibold text-gray-200">
            {t("membersAttention.emptyTitle")}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("membersAttention.emptyDesc")}
          </p>
        </div>
      )}
    </div>
  );
};
