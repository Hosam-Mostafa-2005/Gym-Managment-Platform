// src/features/member-profile/components/assignments/AssignmentHistory.tsx

import React from "react";
import type { MemberAssignment } from "../../types/member-profile.types";

interface AssignmentHistoryProps {
  assignments: MemberAssignment[];
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  assignments,
}) => {
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            Completed
          </span>
        );
      case "CANCELLED":
        return (
          <span className="rounded bg-red-500/10 px-2 py-1 text-xs text-red-400">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="rounded bg-[#1E2329] px-2 py-1 text-xs text-gray-300">
            {status || "—"}
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-gray-100">
        Assignment History
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {assignments.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No previous assignments.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Workout</th>
                  <th className="px-6 py-4 font-medium">Trainer</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Start Date</th>
                  <th className="px-6 py-4 font-medium">End Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {assignments.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-[#1E2329]/30"
                  >
                    <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">
                      {assignment.workout?.title ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {assignment.trainer?.name ?? "—"}
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
