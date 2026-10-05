// src/features/dashboard/pages/DashboardPage.tsx

import React from "react";
import { Navigate } from "react-router-dom";

import { MemberDashboard } from "../member/MemberDashboard";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

export const DashboardPage: React.FC = () => {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div className="min-h-screen bg-[#090B0F] text-gray-100" />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const role = String(user.role ?? "")
    .trim()
    .toUpperCase();

  console.log("NORMALIZED ROLE:", role);

  // Trainers and Admins use the Coach Dashboard
  if (role === "TRAINER" || role === "ADMIN") {
    return <Navigate to="/coach-dashboard" replace />;
  }

  // Members use the Member Dashboard
  return (
    <div className="min-h-screen bg-[#090B0F] text-gray-100">
      <MemberDashboard />
    </div>
  );
};

export default DashboardPage;
