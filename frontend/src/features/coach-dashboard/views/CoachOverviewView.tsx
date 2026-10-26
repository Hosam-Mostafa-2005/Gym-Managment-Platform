// src/features/coach-dashboard/views/CoachOverviewView.tsx
import React from "react";
import { useOutletContext } from "react-router-dom";
import { useCoachDashboard } from "../hooks/use-coach-dashboard";
import { OverviewCards } from "../components/overview/OverviewCards";
import { ClientHealthOverview } from "../components/client-health/ClientHealthOverview";
import { CoachActionCenter } from "../components/action-center/CoachActionCenter";
import { UpcomingCoachSchedules } from "../components/assignments/UpcomingCoachSchedules";
import { RecentActivity } from "../components/activity/RecentActivity";
import type { CoachDashboard } from "../types/coach-dashboard.types";

export const CoachOverviewView: React.FC = () => {
  const contextData = useOutletContext<CoachDashboard | undefined>();
  const { data: queryData } = useCoachDashboard();

  const data = contextData || queryData;
  if (!data) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Coach Overview (4 High-Value Real Metrics) */}
      <OverviewCards overview={data.overview} />

      {/* 2. Operational Grid: Client Health & Action Center */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Client Health & Activity Overview */}
        <div className="xl:col-span-2">
          <ClientHealthOverview clients={data.clientHealthOverview} />
        </div>

        {/* Action Center */}
        <div className="xl:col-span-1">
          <CoachActionCenter actionCenter={data.actionCenter} />
        </div>
      </div>

      {/* 3. Secondary Grid: Upcoming Schedules & Recent Coaching Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <UpcomingCoachSchedules schedules={data.upcomingScheduledWorkouts} />
        <RecentActivity activities={data.recentActivity} />
      </div>
    </div>
  );
};

export default CoachOverviewView;
