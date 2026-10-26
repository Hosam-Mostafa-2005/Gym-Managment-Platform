import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { getRoleHomeRoute, getOnboardingRoute } from "@/features/auth/utils/auth-redirect";

interface ProtectedRouteProps {
  allowedRoles?: string[];
  allowOnboardingOnly?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
}) => {
  const { isAuthenticated, isLoading, user, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#090B0F] text-[#F3F4F6]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="text-xs text-[#9CA3AF] tracking-wide uppercase font-medium">
            Verifying STREN session...
          </p>
        </div>
      </div>
    );
  }

  const isOnboardingRoute = location.pathname.startsWith("/onboarding");

  // If visiting /onboarding root directly, resolve to appropriate role destination
  if (location.pathname === "/onboarding" || location.pathname === "/onboarding/") {
    if (user && user.onboardingCompleted === false) {
      return <Navigate to={getOnboardingRoute(role)} replace />;
    }
    return <Navigate to={getRoleHomeRoute(role)} replace />;
  }

  // If user hasn't completed onboarding and tries to access regular app, direct to onboarding
  if (user && user.onboardingCompleted === false && !isOnboardingRoute) {
    const onboardingTarget = getOnboardingRoute(role);
    return <Navigate to={onboardingTarget} replace />;
  }

  // If user has completed onboarding and navigates to onboarding, direct to their role home
  if (user && user.onboardingCompleted === true && isOnboardingRoute) {
    const homeTarget = getRoleHomeRoute(role);
    return <Navigate to={homeTarget} replace />;
  }

  // If role check specified and user's role is not authorized
  if (allowedRoles && role && !allowedRoles.includes(role)) {
    const fallbackPath = getRoleHomeRoute(role);
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
