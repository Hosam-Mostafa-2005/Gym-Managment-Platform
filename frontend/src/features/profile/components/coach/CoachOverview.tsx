// src/features/profile/components/coach/CoachOverview.tsx
import React from "react";
import {
  Users,
  ClipboardList,
  Dumbbell,
  Flame,
  Percent,
  Ruler,
} from "lucide-react";
import type { CoachOverviewStats } from "../../types/profile.types";

interface CoachOverviewProps {
  overview: CoachOverviewStats;
}

export const CoachOverview: React.FC<CoachOverviewProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Active Members
          </span>
          <Users className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.activeMembers}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Active Assignments
          </span>
          <ClipboardList className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.activeAssignments}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Workouts Created
          </span>
          <Dumbbell className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.workoutsCreated}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Sessions Finished
          </span>
          <Flame className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.completedSessions}
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Adherence Rate
          </span>
          <Percent className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.completionRate}%
        </span>
      </div>

      <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            Biomarkers Logged
          </span>
          <Ruler className="h-4 w-4 text-[#5BE584]/70" />
        </div>
        <span className="text-2xl font-bold text-gray-100 font-mono">
          {overview.measurementsReviewed}
        </span>
      </div>
    </div>
  );
};
