// src/features/coach-dashboard/pages/CoachDashboardPage.tsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCoachDashboard } from "@/features/coach-dashboard/hooks/use-coach-dashboard";
import { DashboardHeader } from "@/features/coach-dashboard/components/dashboard-header/DashboardHeader";
import { CoachDashboardNav } from "@/features/coach-dashboard/components/nav/CoachDashboardNav";
import { DashboardLoading } from "@/features/coach-dashboard/components/states/DashboardLoading";
import { DashboardError } from "@/features/coach-dashboard/components/states/DashboardError";

const CoachDashboardPage: React.FC = () => {
  const { isMember, isLoading: isAuthLoading } = useAuth();

  const {
    data: dashboardData,
    isLoading,
    isError,
    error,
    refetch,
  } = useCoachDashboard();

  if (isMember) {
    return <Navigate to="/dashboard" replace />;
  }

  if (isAuthLoading || isLoading) {
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

  if (!dashboardData) {
    return null;
  }

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* 1. Header with greeting and date */}
      <DashboardHeader generatedAt={dashboardData.generatedAt} />

      {/* 2. Secondary Navigation Bar with direct URLs */}
      <CoachDashboardNav />

      {/* 3. Subview Content via Router Outlet */}
      <Outlet context={dashboardData} />
    </main>
  );
};

export default CoachDashboardPage;
