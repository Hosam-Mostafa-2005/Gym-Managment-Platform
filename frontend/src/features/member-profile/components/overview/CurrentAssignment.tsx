// src/features/member-profile/components/overview/CurrentAssignment.tsx

import React from "react";
import { Dumbbell, UserRound, CalendarDays } from "lucide-react";
import type { MemberAssignment } from "../../types/member-profile.types";

interface CurrentAssignmentProps {
  assignment: MemberAssignment | null;
}

export const CurrentAssignment: React.FC<CurrentAssignmentProps> = ({
  assignment,
}) => {
  if (!assignment) {
    return (
      <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 text-center">
        <Dumbbell className="mb-3 h-8 w-8 text-gray-500" />
        <h3 className="mb-1 text-sm font-medium text-gray-300">
          No active assignment
        </h3>
        <p className="text-xs text-gray-500">
          This member currently has no active workout assignment.
        </p>
      </div>
    );
  }

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
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wider text-gray-400">
          Current Assignment
        </h3>
        <span
          className={`rounded-md border px-2 py-0.5 text-xs font-semibold uppercase ${getStatusStyle(assignment.status)}`}
        >
          {assignment.status || "UNKNOWN"}
        </span>
      </div>

      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <Dumbbell className="mt-1 h-5 w-5 shrink-0 text-[#5BE584]" />
          <div>
            <p className="text-xs text-gray-500">Workout Plan</p>
            <p className="text-base font-semibold text-gray-100">
              {assignment.workout?.title ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <UserRound className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Trainer</p>
            <p className="text-sm font-medium text-gray-100">
              {assignment.trainer?.name ?? "—"}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CalendarDays className="mt-1 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <p className="text-xs text-gray-500">Timeline</p>
            <p className="text-sm font-medium text-gray-100">
              {formatDate(assignment.startDate)} –{" "}
              {formatDate(assignment.endDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
