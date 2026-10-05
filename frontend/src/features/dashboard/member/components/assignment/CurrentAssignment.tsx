// src/features/dashboard/member/components/assignment/CurrentAssignment.tsx
import React from "react";
import { ClipboardList, Calendar, Tag, Clock } from "lucide-react";

interface CurrentAssignmentProps {
  assignment?: any;
  workout?: any;
}

export const CurrentAssignment: React.FC<CurrentAssignmentProps> = ({
  assignment,
  workout,
}) => {
  if (!assignment && !workout) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[#1E2329] bg-[#0D1117] py-12 text-center">
        <ClipboardList className="mb-3 h-8 w-8 text-gray-600" />
        <h3 className="text-sm font-semibold text-gray-200">
          No Active Assignment
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          You currently don't have an active training program assigned.
        </p>
      </div>
    );
  }

  const startDate = assignment?.startDate
    ? new Date(assignment.startDate).toLocaleDateString()
    : "N/A";
  const endDate = assignment?.endDate
    ? new Date(assignment.endDate).toLocaleDateString()
    : "N/A";

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Current Program</h2>
        <span className="rounded bg-[#5BE584]/10 px-2.5 py-1 text-xs font-medium text-[#5BE584]">
          {assignment?.status || "Active"}
        </span>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-bold text-white">
            {workout?.title || workout?.name || "Untitled Workout"}
          </h3>
          {workout?.description && (
            <p className="text-sm text-gray-400 line-clamp-2 max-w-xl">
              {workout.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-[#1E2329] pt-4">
        {assignment?.startDate && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {startDate} - {endDate}
            </span>
          </div>
        )}
        {workout?.difficulty && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Tag className="h-4 w-4" />
            <span className="capitalize">
              {workout.difficulty.toLowerCase()}
            </span>
          </div>
        )}
        {workout?.estimatedDuration && (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Clock className="h-4 w-4" />
            <span>~{workout.estimatedDuration} min</span>
          </div>
        )}
      </div>
    </div>
  );
};
