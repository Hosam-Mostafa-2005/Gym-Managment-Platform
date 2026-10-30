// src/features/member-profile/components/overview/WorkoutStats.tsx

import React from "react";
import {
  Activity,
  PlayCircle,
  CheckCircle2,
  TrendingUp,
  Clock,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { MemberWorkoutStats } from "../../types/member-profile.types";
import { ProfileStatCard } from "../shared/ProfileStatCard";

interface WorkoutStatsProps {
  stats: MemberWorkoutStats;
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({ stats }) => {
  const { t } = useTranslation("profile");

  return (
    <div className="flex h-full flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <h3 className="mb-4 text-sm font-medium uppercase tracking-wider text-gray-400">
        {t("rosterMemberView.workoutStats.performance")}
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <ProfileStatCard
          label={t("rosterMemberView.workoutStats.totalSessions")}
          value={stats.totalSessions}
          icon={<PlayCircle />}
        />
        <ProfileStatCard
          label={t("rosterMemberView.workoutStats.completed")}
          value={stats.completedSessions}
          icon={<CheckCircle2 />}
        />
        <ProfileStatCard
          label={t("rosterMemberView.workoutStats.completion")}
          value={`${stats.completionRate}%`}
          icon={<Activity />}
        />
        <ProfileStatCard
          label={t("rosterMemberView.workoutStats.avgDuration")}
          value={`${stats.averageWorkoutDuration}m`}
          icon={<Clock />}
        />
        <div className="col-span-2">
          <ProfileStatCard
            label={t("rosterMemberView.workoutStats.totalVolume")}
            value={stats.totalWorkoutVolume.toLocaleString()}
            description={t("rosterMemberView.workoutStats.kgUnit")}
            icon={<TrendingUp />}
          />
        </div>
      </div>
    </div>
  );
};
