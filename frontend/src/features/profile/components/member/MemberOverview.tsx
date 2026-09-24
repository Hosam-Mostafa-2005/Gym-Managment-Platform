// src/features/profile/components/member/MemberOverview.tsx
import React from "react";
import { Dumbbell, Flame, Percent, Activity, TrendingUp } from "lucide-react";
import type { MemberWorkoutStats } from "../../types/profile.types";

interface MemberOverviewProps {
  workoutStats: MemberWorkoutStats;
}

export const MemberOverview: React.FC<MemberOverviewProps> = ({
  workoutStats,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Total Sessions
          </span>
          <Dumbbell className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {workoutStats.totalSessions}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Completed
          </span>
          <Flame className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-emerald-400 font-mono">
          {workoutStats.completedSessions}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Completion Rate
          </span>
          <Percent className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {workoutStats.completionRate}%
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Avg Duration
          </span>
          <Activity className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {workoutStats.averageWorkoutDuration} min
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 col-span-2 md:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Total Volume
          </span>
          <TrendingUp className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {workoutStats.totalWorkoutVolume} kg
        </span>
      </div>
    </div>
  );
};
