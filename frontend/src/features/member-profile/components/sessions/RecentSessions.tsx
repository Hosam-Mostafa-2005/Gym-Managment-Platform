// src/features/member-profile/components/sessions/RecentSessions.tsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";
import type { MemberSession } from "../../types/member-profile.types";

interface RecentSessionsProps {
  sessions: MemberSession[];
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("profile");
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";

  const formatDateTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(
        currentLang === "ar" ? "ar-EG" : "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      ).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-400">
            {t("member.recentSessions.statusCompleted")}
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            {t("member.recentSessions.statusInProgress")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-400">
            {t("member.recentSessions.statusCancelled")}
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#1E2329] px-2 py-1 text-xs text-gray-300">
            {status || t("member.recentSessions.unspecified")}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("member.recentSessions.title")}
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {t("member.recentSessions.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left rtl:text-right text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    {t("member.recentSessions.colWorkout")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.recentSessions.colStatus")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.recentSessions.colStarted")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.recentSessions.colEnded")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.recentSessions.colDuration")}
                  </th>
                  <th className="px-6 py-4 font-medium text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    onClick={() => navigate(`/sessions/${session.id}`)}
                    className="cursor-pointer transition-colors hover:bg-[#1E2329]/60 group"
                  >
                    <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap group-hover:text-[#5BE584] transition-colors">
                      {session.workout?.title ??
                        t("member.recentSessions.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(session.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.endedAt
                        ? formatDateTime(session.endedAt)
                        : t("member.recentSessions.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.duration ??
                        t("member.recentSessions.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <ChevronRight className="w-4 h-4 text-[#6B7280] group-hover:text-[#5BE584] transition-colors inline-block rtl:rotate-180" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
