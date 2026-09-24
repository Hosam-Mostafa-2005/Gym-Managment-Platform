// src/features/profile/components/member/CurrentAssignment.tsx
import React from "react";
import { ClipboardList, Calendar, CheckCircle2 } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { MemberAssignment } from "../../types/profile.types";

interface CurrentAssignmentProps {
  assignment: MemberAssignment | null;
}

export const CurrentAssignment: React.FC<CurrentAssignmentProps> = ({
  assignment,
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
      title="Current Active Assignment"
      subtitle="Currently prescribed routine and supervisory coach"
      icon={ClipboardList}
    >
      {assignment ? (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 rounded-lg bg-[#13171d] border border-[#1e2329]">
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-gray-100 text-base">
              {assignment.workout?.title || "Custom Assigned Workout Program"}
            </span>
            <span className="text-xs text-gray-400">
              Assigned Coach:{" "}
              <strong className="text-gray-200">
                {assignment.trainer?.name || "Independent"}
              </strong>
            </span>
            <div className="flex items-center gap-3 text-[11px] text-gray-500 mt-1">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                Start: {formatDate(assignment.startDate)}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-gray-500" />
                Target End: {formatDate(assignment.endDate)}
              </span>
            </div>
          </div>

          <span className="inline-flex rounded-full bg-[#16291d] px-2.5 py-1 text-[10px] font-bold text-[#5BE584] uppercase tracking-wider border border-[#23422e]">
            {assignment.status || "Active"}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center text-xs text-gray-500">
          <CheckCircle2 className="h-6 w-6 text-gray-600 mb-2" />
          <p className="font-medium text-gray-300">
            No active assignment found.
          </p>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Contact your assigned coach to receive a new routine.
          </p>
        </div>
      )}
    </ProfileSection>
  );
};
