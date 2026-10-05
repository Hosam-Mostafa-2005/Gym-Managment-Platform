// src/features/dashboard/member/MemberDashboard.tsx
import React from "react";
import { useMemberDashboard } from "../hooks/use-dashboard";
import { DashboardHeader } from "./components/header/DashboardHeader";
import { OverviewGrid } from "./components/overview/OverviewGrid";
import { CurrentAssignment } from "./components/assignment/CurrentAssignment";
import { ProgressOverview } from "./components/progress/ProgressOverview";
import { WorkoutActivity } from "./components/activity/WorkoutActivity";
import { ProgressChart } from "./components/analytics/ProgressChart";
import { SessionDuration } from "./components/analytics/SessionDuration";
import { WorkoutFrequency } from "./components/analytics/WorkoutFrequency";
import { PerformanceTelemetry } from "./components/analytics/PerformanceTelemetry";
import { RecentActivity } from "./components/recent-activity/RecentActivity";
import { DashboardSkeleton } from "./components/states/DashboardSkeleton";
import { DashboardError } from "./components/states/DashboardError";
import { DashboardEmpty } from "./components/states/DashboardEmpty";

export const MemberDashboard: React.FC = () => {
  const { data, isLoading, isError, refetch } = useMemberDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (isError) return <DashboardError onRetry={refetch} />;

  if (!data || !data.overview) {
    return <DashboardEmpty />;
  }

  const { overview, charts, trends, recentActivity } = data;

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
      <DashboardHeader />

      <OverviewGrid overview={overview} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <CurrentAssignment
            assignment={overview.activeAssignment}
            workout={overview.currentWorkout}
          />
          <WorkoutActivity
            last30Days={charts?.workoutVolumeLast30Days}
            last12Months={charts?.workoutVolumeLast12Months}
          />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <SessionDuration trend={charts?.sessionDurationTrend} />
            <ProgressChart
              exercises={charts?.exercisesCompletedPerWeek}
              sets={charts?.setsCompletedPerWeek}
            />
          </div>
          <WorkoutFrequency
            byWeekday={charts?.workoutFrequencyByWeekday}
            byHour={charts?.workoutFrequencyByHour}
          />
        </div>

        <div className="flex flex-col gap-6">
          <ProgressOverview overview={overview} />
          <PerformanceTelemetry trends={trends} />
          <RecentActivity activities={recentActivity} />
        </div>
      </div>
    </main>
  );
};
