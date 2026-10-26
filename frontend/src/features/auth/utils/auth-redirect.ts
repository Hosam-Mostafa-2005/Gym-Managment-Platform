// src/features/auth/utils/auth-redirect.ts

/**
 * Returns the canonical home route for each role.
 * - Member -> /dashboard
 * - Coach/Trainer -> /coach-dashboard
 * - Admin -> /coach-dashboard
 */
export const getRoleHomeRoute = (role?: string | null): string => {
  const normalized = role?.toUpperCase();
  switch (normalized) {
    case "MEMBER":
      return "/dashboard";
    case "TRAINER":
    case "COACH":
    case "ADMIN":
      return "/coach-dashboard";
    default:
      return "/dashboard";
  }
};

/**
 * Returns the onboarding route for each role when initial setup is required.
 * - Member -> /onboarding/member
 * - Coach/Trainer -> /onboarding/coach
 * - Admin -> /coach-dashboard (Admins bypass onboarding directly to workspace)
 */
export const getOnboardingRoute = (role?: string | null): string => {
  const normalized = role?.toUpperCase();
  switch (normalized) {
    case "MEMBER":
      return "/onboarding/member";
    case "TRAINER":
    case "COACH":
      return "/onboarding/coach";
    case "ADMIN":
      return "/coach-dashboard";
    default:
      return "/onboarding/member";
  }
};

/**
 * Checks if a given pathname is an auth route that should never be used as a return destination.
 */
export const isAuthRoute = (pathname: string): boolean => {
  const lower = pathname.toLowerCase();
  return (
    lower === "/" ||
    lower === "/home" ||
    lower === "/login" ||
    lower === "/register" ||
    lower === "/verify-email" ||
    lower === "/forgot-password" ||
    lower === "/verify-reset-code" ||
    lower === "/reset-password"
  );
};

/**
 * Validates that an intended return path is safe (relative, no open-redirect vulnerabilities).
 */
export const isSafeReturnPath = (pathname?: string | null): boolean => {
  if (!pathname || typeof pathname !== "string") return false;
  const trimmed = pathname.trim();

  // Must begin with a single slash (reject external urls, protocol relative //, or backslashes /\)
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return false;
  }

  // Reject malicious schemes
  if (/^(?:javascript|data|vbscript):/i.test(trimmed)) {
    return false;
  }

  // Reject auth screens
  if (isAuthRoute(trimmed)) {
    return false;
  }

  return true;
};

/**
 * Validates that a route is authorized for the given role.
 */
export const isRouteAuthorizedForRole = (
  pathname: string,
  role?: string | null,
): boolean => {
  const normalized = role?.toUpperCase();
  const path = pathname.toLowerCase();

  const isCoachOrAdmin = normalized === "TRAINER" || normalized === "COACH" || normalized === "ADMIN";

  // Coach & Admin exclusive routes
  if (
    path.startsWith("/coach-dashboard") ||
    path.startsWith("/members") ||
    path.startsWith("/coach/") ||
    path.startsWith("/onboarding/coach")
  ) {
    return isCoachOrAdmin;
  }

  // Member-only onboarding route
  if (path.startsWith("/onboarding/member")) {
    return normalized === "MEMBER";
  }

  // Member dashboard: coaches and admins should land on coach-dashboard instead of member dashboard
  if (path === "/dashboard" || path.startsWith("/dashboard/")) {
    return !isCoachOrAdmin;
  }

  // Shared routes (sessions, workouts, exercises, profile, measurements, nutrition, etc.)
  return true;
};

interface ResolveRedirectOptions {
  user?: any;
  returnUrl?: string | null;
  locationState?: {
    from?: {
      pathname?: string;
      search?: string;
    };
  } | null;
  ignoreOnboarding?: boolean;
}

/**
 * Centralized redirect resolver for all authentication and routing flows.
 * Handles role-based canonical home routes, onboarding enforcement, returnTo validation,
 * and authorization checks to prevent 404s, redirect loops, and privilege leakage.
 */
export const resolveAuthRedirect = ({
  user,
  returnUrl,
  locationState,
  ignoreOnboarding = false,
}: ResolveRedirectOptions): string => {
  if (!user) {
    return "/login";
  }

  const role = user.role?.toUpperCase();

  // 1. Onboarding Check (if not already completed)
  if (!ignoreOnboarding && user.onboardingCompleted === false) {
    return getOnboardingRoute(role);
  }

  // 2. Candidate Return Path Check
  let candidate = returnUrl;
  if (!candidate && locationState?.from?.pathname) {
    const fromPathname = locationState.from.pathname;
    const fromSearch = locationState.from.search ?? "";
    candidate = `${fromPathname}${fromSearch}`;
  }

  if (candidate) {
    // Extract pathname for security and authorization checks
    const [pathname] = candidate.split("?");

    if (isSafeReturnPath(pathname) && isRouteAuthorizedForRole(pathname, role)) {
      return candidate;
    }
  }

  // 3. Canonical Role Home Route
  return getRoleHomeRoute(role);
};
