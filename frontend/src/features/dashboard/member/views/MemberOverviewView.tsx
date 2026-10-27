// src/features/dashboard/member/views/MemberOverviewView.tsx
import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useMemberDashboard } from "../../hooks/use-dashboard";
import { WelcomeQuickStats } from "../components/WelcomeQuickStats";
import { NextWorkoutCard } from "../components/NextWorkoutCard";
import { ProgressSnapshot } from "../components/ProgressSnapshot";
import { NeedsAttentionCard } from "../components/NeedsAttentionCard";
import { CoachConnectionCard } from "../components/CoachConnectionCard";
import { DailyNutritionCard } from "../components/DailyNutritionCard";
import { UpcomingScheduledWorkouts } from "../components/analytics/UpcomingScheduledWorkouts";
import { RecentActivity } from "../components/recent-activity/RecentActivity";
import type { MemberDashboardData } from "../../types/dashboard.types";

export const MemberOverviewView: React.FC = () => {
  const navigate = useNavigate();
  const contextData = useOutletContext<MemberDashboardData | undefined>();
  const { data: queryData } = useMemberDashboard();

  const data = contextData || queryData;
  if (!data || !data.overview) return null;

  const { overview, charts } = data;
  const upcomingWorkouts =
    data.upcomingWorkouts || overview.upcomingWorkouts || [];
  const needsAttention = overview.needsAttention || data.needsAttention;
  const coachConnection = overview.coachConnection || data.coachConnection;

  return (
    <div className="flex flex-col gap-6">
      {/* 1. Welcome & High-Value Real Metrics */}
      <WelcomeQuickStats overview={overview} />

      {/* 2. Main Dashboard Sections Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Primary Column: Next Workout, Snapshot, Schedules & Activity */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Section 3: Next Workout */}
          <NextWorkoutCard
            assignment={overview.activeAssignment}
            activeAssignments={overview.activeAssignments}
            workout={overview.currentWorkout}
            upcomingWorkouts={upcomingWorkouts}
          />

          {/* Section 2: Progress Snapshot (with direct route to full analytics view) */}
          <ProgressSnapshot
            overview={overview}
            volumeLast30Days={charts?.workoutVolumeLast30Days}
            volumeLast12Months={charts?.workoutVolumeLast12Months}
            onOpenAnalytics={() => navigate("/dashboard/analytics")}
          />

          {/* Section 4: Upcoming Scheduled Workouts */}
          <UpcomingScheduledWorkouts schedules={upcomingWorkouts} />

          {/* Section 5: Recent Member Activity Timeline */}
          <RecentActivity activities={data.recentActivity} />
        </div>

        {/* Right Secondary Column: Needs Attention & Coach Connection */}
        <div className="flex flex-col gap-6">
          {/* Section 6: Needs Attention (Pending Invites & Unread Notifications) */}
          <NeedsAttentionCard needsAttention={needsAttention} />

          {/* Section 7: Daily Nutrition Snapshot */}
          <DailyNutritionCard
            nutrition={overview.nutritionSnapshot || data.nutritionSnapshot}
          />

          {/* Section 8: Coach Connection (Status & History Consent) */}
          <CoachConnectionCard coachConnection={coachConnection} />
        </div>
      </div>
    </div>
  );
};

export default MemberOverviewView;
