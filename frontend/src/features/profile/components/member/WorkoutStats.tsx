// src/features/profile/components/member/WorkoutStats.tsx
import React from "react";
import { MemberOverview } from "./MemberOverview";
import type { MemberWorkoutStats as StatsType } from "../../types/profile.types";

interface WorkoutStatsProps {
  workoutStats: StatsType;
}

export const WorkoutStats: React.FC<WorkoutStatsProps> = ({ workoutStats }) => {
  return <MemberOverview workoutStats={workoutStats} />;
};
