// src/features/coach-dashboard/pages/CoachDashboardPage.tsx
import React from "react";
import { useCoachDashboard } from "@/features/coach-dashboard/hooks/use-coach-dashboard";
import { DashboardHeader } from "@/features/coach-dashboard/components/dashboard-header/DashboardHeader";
import { OverviewCards } from "@/features/coach-dashboard/components/overview/OverviewCards";
import { TodaysPriorities } from "@/features/coach-dashboard/components/priorities/TodaysPriorities";
import { MembersNeedingAttention } from "@/features/coach-dashboard/components/members-attention/MembersNeedingAttention";
import { QuickActions } from "@/features/coach-dashboard/components/quick-actions/QuickActions";
import { PerformanceTelemetry } from "@/features/coach-dashboard/components/performance/PerformanceTelemetry";
import { UpcomingAssignments } from "@/features/coach-dashboard/components/assignments/UpcomingAssignments";
import { RecentMeasurements } from "@/features/coach-dashboard/components/measurements/RecentMeasurements";
import { RecentActivity } from "@/features/coach-dashboard/components/activity/RecentActivity";
import { DashboardLoading } from "@/features/coach-dashboard/components/states/DashboardLoading";
import { DashboardError } from "@/features/coach-dashboard/components/states/DashboardError";

const CoachDashboardPage: React.FC = () => {
  // Call the API hook exactly once at the page level
  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoachDashboard();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError) {
    return (
      <DashboardError
        message={error instanceof Error ? error.message : undefined}
        onRetry={() => refetch()}
      />
    );
  }

  // Fallback in case data is undefined despite not loading/error
  if (!dashboardData) {
    return null;
  }

  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-2">
      {/* 1. Dashboard Header */}
      <DashboardHeader generatedAt={dashboardData.generatedAt} />

      {/* 2. Overview KPI Cards */}
      <OverviewCards overview={dashboardData.overview} />

      {/* 3. Today's Priorities */}
      <TodaysPriorities priorities={dashboardData.todaysPriorities} />

      {/* 4. Members Needing Attention & Quick Actions Grid Layout */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3 mb-8">
        <div className="xl:col-span-2">
          <MembersNeedingAttention
            members={dashboardData.membersNeedingAttention}
          />
        </div>
        <div className="xl:col-span-1">
          <QuickActions quickActions={dashboardData.quickActions} />
        </div>
      </div>

      {/* 5. Performance Telemetry Charts Section */}
      <PerformanceTelemetry charts={dashboardData.charts} />

      {/* 6. Upcoming Assignments & Recent Measurements Grid Layout */}
      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-2 mb-8">
        <UpcomingAssignments assignments={dashboardData.upcomingAssignments} />
        <RecentMeasurements measurements={dashboardData.recentMeasurements} />
      </div>

      {/* 7. Live Operational Gym Feed (Recent Activity) */}
      <div className="mt-8">
        <RecentActivity activities={dashboardData.recentActivity} />
      </div>
    </div>
  );
};

export default CoachDashboardPage;
