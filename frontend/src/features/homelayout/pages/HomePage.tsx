import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/hooks/useAuth";

import OverviewPage from "@/features/overview/pages/OverviewPage";

export default function HomePage() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    const target = role === "MEMBER" ? "/dashboard" : "/coach-dashboard";
    return <Navigate to={target} replace />;
  }

  return <OverviewPage />;
}
