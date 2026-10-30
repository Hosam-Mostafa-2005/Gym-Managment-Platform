// src/features/member-profile/components/assignments/AssignmentHistory.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import type { MemberAssignment } from "../../types/member-profile.types";

interface AssignmentHistoryProps {
  assignments: MemberAssignment[];
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  assignments,
}) => {
  const { t, i18n } = useTranslation("profile");
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";

  const formatDate = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat(
        currentLang === "ar" ? "ar-EG" : "en-US",
        {
          month: "short",
          day: "numeric",
          year: "numeric",
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
          <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            {t("member.assignmentHistory.statusCompleted")}
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-400">
            {t("member.assignmentHistory.statusCancelled")}
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#1E2329] px-2 py-1 text-xs text-gray-300">
            {status || t("member.assignmentHistory.unspecified")}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        {t("member.assignmentHistory.title")}
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            {t("member.assignmentHistory.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left rtl:text-right text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">
                    {t("member.assignmentHistory.colWorkout")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.assignmentHistory.colTrainer")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.assignmentHistory.colStatus")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.assignmentHistory.colStartDate")}
                  </th>
                  <th className="px-6 py-4 font-medium">
                    {t("member.assignmentHistory.colEndDate")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-[#1E2329]/30"
                  >
                    <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">
                      {assignment.workout?.title ??
                        t("member.assignmentHistory.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.trainer?.name ??
                        t("member.assignmentHistory.unspecified")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(assignment.startDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDate(assignment.endDate)}
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
