// src/features/auth/hooks/useAuth.ts
import { useCurrentUser } from "./useCurrentUser";
import { useAuthStore } from "@/store/auth.store";
import { tokenService } from "@/services/token.service";
import { ROLES } from "@/constants/roles";

export const useAuth = () => {
  const token = tokenService.getToken();
  const { data: queryUser, isLoading: isQueryLoading } = useCurrentUser();
  const storeUser = useAuthStore((state) => state.user);

  const user = queryUser || storeUser;
  const role = user?.role?.toUpperCase() || null;

  const isAuthenticated = Boolean(token);
  // Only loading if authenticated via token, query is pending, and we don't have user in store
  const isLoading = isAuthenticated && isQueryLoading && !user;

  return {
    user,
    role,
    isMember: role === "MEMBER",
    isCoach: role === "TRAINER" || role === "COACH",
    isAdmin: role === "ADMIN",
    isCoachOrAdmin: role === "TRAINER" || role === "COACH" || role === "ADMIN",
    isAuthenticated,
    isLoading,
  };
};

export default useAuth;
