// src/features/profile/components/coach/CoachWorkoutStats.tsx
import React from "react";
import { Dumbbell, ClipboardList, CheckCircle2 } from "lucide-react";
import type { CoachWorkoutStats as StatsType } from "../../types/profile.types";

interface CoachWorkoutStatsProps {
  workoutStats: StatsType;
}

export const CoachWorkoutStats: React.FC<CoachWorkoutStatsProps> = ({
  workoutStats,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center gap-2.5 border-b border-[#1e2329] pb-3 mb-4">
          <Dumbbell className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-100">
            Authoring Matrix
          </h3>
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl font-bold text-gray-100 font-mono">
            {workoutStats.totalCreated}
          </span>
          <span className="text-xs text-gray-500 font-medium">
            Total Protocols
          </span>
        </div>
      </div>

      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center gap-2.5 border-b border-[#1e2329] pb-3 mb-4">
          <ClipboardList className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-100">
            Template Syndication
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="flex flex-col p-2 rounded bg-[#13171d] border border-[#1e2329]">
            <span className="text-lg font-bold text-gray-200 font-mono">
              {workoutStats.published}
            </span>
            <span className="text-[10px] text-gray-500 uppercase mt-0.5">
              Published
            </span>
          </div>
          <div className="flex flex-col p-2 rounded bg-[#13171d] border border-[#1e2329]">
            <span className="text-lg font-bold text-gray-200 font-mono">
              {workoutStats.draft}
            </span>
            <span className="text-[10px] text-gray-500 uppercase mt-0.5">
              Draft
            </span>
          </div>
          <div className="flex flex-col p-2 rounded bg-[#13171d] border border-[#1e2329]">
            <span className="text-lg font-bold text-gray-200 font-mono">
              {workoutStats.archived}
            </span>
            <span className="text-[10px] text-gray-500 uppercase mt-0.5">
              Archived
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center gap-2.5 border-b border-[#1e2329] pb-3 mb-4">
          <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
          <h3 className="text-sm font-semibold text-gray-100">
            Most Assigned Flagship
          </h3>
        </div>
        {workoutStats.mostAssignedWorkout ? (
          <div className="flex flex-col justify-between flex-1">
            <span className="text-sm font-semibold text-gray-200 line-clamp-1">
              {workoutStats.mostAssignedWorkout.title}
            </span>
            <span className="text-xs text-[#5BE584] font-mono mt-1">
              Assigned {workoutStats.mostAssignedWorkout.count} times
            </span>
          </div>
        ) : (
          <span className="text-xs text-gray-500">
            No predominant flagship routine recorded.
          </span>
        )}
      </div>
    </div>
  );
};
