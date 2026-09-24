// src/features/profile/components/coach/MemberStats.tsx
import React from "react";
import { Users, UserCheck, UserX, UserPlus, CheckCircle } from "lucide-react";
import { ProfileSection } from "../shared/ProfileSection";
import type { CoachMemberStats as StatsType } from "../../types/profile.types";

interface MemberStatsProps {
  memberStats: StatsType;
}

export const MemberStats: React.FC<MemberStatsProps> = ({ memberStats }) => {
  return (
    <ProfileSection
      title="Roster Member Metrics"
      subtitle="Active athlete demographics and cohort distribution"
      icon={Users}
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div className="p-4 rounded-lg bg-[#13171d] border border-[#1e2329] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-gray-500 flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" /> Active Roster
          </span>
          <span className="text-2xl font-bold text-gray-100 font-mono mt-2">
            {memberStats.active}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171d] border border-[#1e2329] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-gray-500 flex items-center gap-1.5">
            <UserX className="h-3.5 w-3.5 text-gray-400" /> Inactive / Dormant
          </span>
          <span className="text-2xl font-bold text-gray-300 font-mono mt-2">
            {memberStats.inactive}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171d] border border-[#1e2329] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-gray-500 flex items-center gap-1.5">
            <UserPlus className="h-3.5 w-3.5 text-[#5BE584]" /> New This Month
          </span>
          <span className="text-2xl font-bold text-[#5BE584] font-mono mt-2">
            {memberStats.newThisMonth}
          </span>
        </div>
        <div className="p-4 rounded-lg bg-[#13171d] border border-[#1e2329] flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase text-gray-500 flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-blue-400" /> Completed
            Programs
          </span>
          <span className="text-2xl font-bold text-gray-100 font-mono mt-2">
            {memberStats.completedPrograms}
          </span>
        </div>
      </div>
    </ProfileSection>
  );
};
