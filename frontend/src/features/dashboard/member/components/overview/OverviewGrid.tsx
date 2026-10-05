// src/features/dashboard/member/components/overview/OverviewGrid.tsx
import React from "react";
import {
  CheckCircle2,
  Dumbbell,
  Flame,
  Timer,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { OverviewCard } from "./OverviewCard";

interface OverviewGridProps {
  overview: any; // Type from dashboard.types.ts
}

export const OverviewGrid: React.FC<OverviewGridProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <OverviewCard
        title="Completed"
        value={overview?.completedSessions || 0}
        icon={CheckCircle2}
        description="Total Sessions"
        highlight
      />
      <OverviewCard
        title="Completion"
        value={`${overview?.completionRate || 0}%`}
        icon={TrendingUp}
        description="Adherence"
        highlight
      />
      <OverviewCard
        title="Current Streak"
        value={overview?.currentStreak || 0}
        icon={Flame}
        description={`Best: ${overview?.bestStreak || 0}`}
      />
      <OverviewCard
        title="This Week"
        value={overview?.workoutsThisWeek || 0}
        icon={CalendarDays}
        description="Workouts"
      />
      <OverviewCard
        title="Avg Duration"
        value={`${overview?.averageWorkoutDuration || 0}m`}
        icon={Timer}
      />
      <OverviewCard
        title="Total Volume"
        value={(overview?.totalVolumeLifted || 0).toLocaleString()}
        icon={Dumbbell}
        description="kg lifted"
      />
    </div>
  );
};
