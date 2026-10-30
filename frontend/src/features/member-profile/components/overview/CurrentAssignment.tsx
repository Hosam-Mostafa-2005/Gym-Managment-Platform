// src/features/member-profile/components/overview/CurrentAssignment.tsx

import React, { useState } from "react";
import { Dumbbell, UserRound, CalendarDays, Layers } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MemberAssignment } from "../../types/member-profile.types";

interface CurrentAssignmentProps {
  assignment: MemberAssignment | null;
  activeAssignments?: MemberAssignment[];
}

export const CurrentAssignment: React.FC<CurrentAssignmentProps> = ({
  assignment,
  activeAssignments = [],
}) => {
  const { t, i18n } = useTranslation("profile");
  const currentLang = i18n.language.startsWith("ar") ? "ar" : "en";

  const assignmentsList =
    activeAssignments.length > 0
      ? activeAssignments
      : assignment
        ? [assignment]
        : [];

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (assignmentsList.length === 0) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 text-center">
        <Dumbbell className="mb-3 h-8 w-8 text-gray-500" />
        <h3 className="mb-1 text-sm font-medium text-gray-300">
          {t("rosterMemberView.currentAssignment.noActive")}
        </h3>
        <p className="text-xs text-gray-500">
          {t("rosterMemberView.currentAssignment.noActiveDesc")}
        </p>
      </div>
    );
  }

  const currentAssignment =
    assignmentsList[selectedIndex] || assignmentsList[0];

  const getStatusStyle = (status: string) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
      case "IN_PROGRESS":
        return "bg-green-500/10 text-green-400 border-green-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      default:
        return "bg-[#1E2329] text-gray-300 border-[#2A313A]";
    }
  };

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

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
            {assignmentsList.length > 1
              ? t("rosterMemberView.currentAssignment.activeSplitAssignments")
              : t("rosterMemberView.currentAssignment.currentAssignment")}
          </h3>
          {assignmentsList.length > 1 && (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#16291D] border border-[#23422E] px-2 py-0.5 text-[10px] font-semibold text-[#5BE584]">
              <Layers className="h-3 w-3" />
              {t("rosterMemberView.currentAssignment.routinesCount", {
                count: assignmentsList.length,
              })}
            </span>
          )}
        </div>

        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase ${getStatusStyle(
            currentAssignment.status,
          )}`}
        >
          {currentAssignment.status ||
            t("rosterMemberView.currentAssignment.unknown")}
        </span>
      </div>

      {/* Routine Split Selector when multiple active assignments exist */}
      {assignmentsList.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-1.5 border-b border-[#1E2329] pb-3">
          {assignmentsList.map((item, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-[#5BE584] text-[#090B0F] font-semibold"
                    : "bg-[#161B22] border border-[#1E2329] text-[#9CA3AF] hover:text-white"
                }`}
              >
                {item.workout?.title ||
                  t("rosterMemberView.currentAssignment.routineN", {
                    number: idx + 1,
                  })}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Dumbbell className="mt-1 h-5 w-5 shrink-0 text-[#5BE584]" />
          <div>
            <p className="text-xs text-gray-500">
              {t("rosterMemberView.currentAssignment.workoutPlan")}
            </p>
            <p className="text-base font-semibold text-gray-100">
              {currentAssignment.workout?.title ??
                t("rosterMemberView.currentAssignment.unspecified")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <UserRound className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">
              {t("rosterMemberView.currentAssignment.trainer")}
            </p>
            <p className="text-sm font-medium text-gray-100">
              {currentAssignment.trainer?.name ??
                t("rosterMemberView.currentAssignment.unspecified")}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">
              {t("rosterMemberView.currentAssignment.timeline")}
            </p>
            <p className="text-sm font-medium text-gray-100">
              {formatDate(currentAssignment.startDate)} –{" "}
              {formatDate(currentAssignment.endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
