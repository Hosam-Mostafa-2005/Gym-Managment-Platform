import { Navigate } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useCurrentUser";

import OverviewPage from "@/features/overview/pages/OverviewPage";

export default function HomePage() {
  const { data: user, isLoading } = useCurrentUser();

  if (isLoading) {
    return null;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <OverviewPage />;
}
