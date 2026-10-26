// src/features/dashboard/member/MemberDashboard.tsx
import React from "react";
import { Outlet } from "react-router-dom";
import { useMemberDashboard } from "../hooks/use-dashboard";
import { DashboardHeader } from "./components/header/DashboardHeader";
import { DashboardNav } from "./components/nav/DashboardNav";
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

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* 1. Header with greeting and date */}
      <DashboardHeader />

      {/* 2. Secondary Navigation Bar with direct URLs */}
      <DashboardNav />

      {/* 3. Subview Content via Router Outlet */}
      <Outlet context={data} />
    </main>
  );
};

export default MemberDashboard;
