// src/features/profile/components/member/RecentSessions.tsx
import React from "react";
import { Activity, Calendar } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { MemberSession } from "../../types/profile.types";

interface RecentSessionsProps {
  sessions: MemberSession[];
}

export const RecentSessions: React.FC<RecentSessionsProps> = ({
  sessions = [],
}) => {
  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(dateStr));
    } catch {
      return dateStr;
    }
  };

  return (
    <ProfileSection
      title="Recent Training Sessions"
      subtitle="Latest workouts logged by athlete"
      icon={Activity}
    >
      {sessions?.length > 0 ? (
        <div className="divide-y divide-[#1e2329] text-xs">
          {sessions.map((session) => (
            <div
              key={session.id}
              className="py-3 first:pt-0 last:pb-0 flex items-center justify-between"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-gray-200">
                  {session.workout?.title || "Independent Training Session"}
                </span>
                <span className="text-[10px] text-gray-500 flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {formatDate(session.startedAt)}
                  {session.duration ? ` • ${session.duration} mins` : ""}
                </span>
              </div>
              <span className="font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                {session.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No workout sessions logged yet.
        </div>
      )}
    </ProfileSection>
  );
};
