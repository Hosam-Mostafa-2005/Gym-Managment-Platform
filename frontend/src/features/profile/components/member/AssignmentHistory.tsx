// src/features/profile/components/member/AssignmentHistory.tsx
import React from "react";
import { ClipboardList } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { MemberAssignment } from "../../types/profile.types";

interface AssignmentHistoryProps {
  assignments: MemberAssignment[];
}

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({
  assignments = [],
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
      title="Assignment History"
      subtitle="Past training programs and routines"
      icon={ClipboardList}
    >
      {assignments?.length > 0 ? (
        <div className="divide-y divide-[#1e2329] text-xs">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
            >
              <div className="flex flex-col gap-1">
                <span className="font-semibold text-gray-200">
                  {item.workout?.title || "Custom Routine"}
                </span>
                <span className="text-[11px] text-gray-400">
                  Trainer:{" "}
                  <strong className="text-gray-300">
                    {item.trainer?.name || "Independent"}
                  </strong>
                </span>
                <div className="flex items-center gap-2 text-[10px] text-gray-500">
                  <span>{formatDate(item.startDate)}</span>
                  <span>→</span>
                  <span>{formatDate(item.endDate)}</span>
                </div>
              </div>
              <span className="font-mono text-[10px] font-semibold text-gray-400 px-2 py-0.5 rounded bg-[#13171d] border border-[#1e2329]">
                {item.status}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center text-xs text-gray-500">
          No past assignment history available.
        </div>
      )}
    </ProfileSection>
  );
};
