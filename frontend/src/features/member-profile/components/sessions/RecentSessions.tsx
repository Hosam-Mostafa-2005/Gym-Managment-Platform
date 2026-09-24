// src/features/member-profile/components/sessions/RecentSessions.tsx

import React from "react";
import type { MemberSession } from "../../types/member-profile.types";

interface RecentSessionsProps {
  sessions: MemberSession[];
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({ sessions }) => {
  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return (
          <span className="rounded bg-green-500/10 px-2 py-1 text-xs text-green-400">
            Completed
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="rounded bg-blue-500/10 px-2 py-1 text-xs text-blue-400">
            In Progress
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
        Recent Workout Sessions
      </h2>
      <div className="rounded-xl border border-[#1E2329] bg-[#0D1117] overflow-hidden">
        {sessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No workout sessions yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="border-b border-[#1E2329] bg-[#090B0F] text-xs uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4 font-medium">Workout</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Started</th>
                  <th className="px-6 py-4 font-medium">Ended</th>
                  <th className="px-6 py-4 font-medium">Duration (min)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2329]">
                {sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="transition-colors hover:bg-[#1E2329]/30"
                  >
                    <td className="px-6 py-4 font-medium text-gray-100 whitespace-nowrap">
                      {session.workout?.title ?? "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(session.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {formatDateTime(session.startedAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.endedAt ? formatDateTime(session.endedAt) : "—"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {session.duration ?? "—"}
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
