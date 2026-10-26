// src/features/dashboard/pages/DashboardPage.tsx
import React from "react";
import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { MemberDashboard } from "../member/MemberDashboard";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const DashboardPage: React.FC = () => {
  const { isLoading, isAuthenticated, isCoachOrAdmin, role } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading || !role) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  // Trainers and Admins use the Coach Dashboard
  if (isCoachOrAdmin) {
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
