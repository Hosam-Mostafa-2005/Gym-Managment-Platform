// src/features/auth/hooks/useOnboarding.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { completeOnboarding } from "../api/auth.api";
import { useAuthStore } from "@/store/auth.store";
import { getRoleHomeRoute } from "../utils/auth-redirect";
import type { OnboardingRequest } from "../types/auth.types";

export const useOnboarding = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: OnboardingRequest) => completeOnboarding(payload),
    onSuccess: (res) => {
      const user = res.data.user;
      setUser(user);
      queryClient.setQueryData(["current-user"], user);
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["member-profile"] });
      queryClient.invalidateQueries({ queryKey: ["coach-profile"] });

      toast.success(res.message || "Profile setup completed!");

      const destination = getRoleHomeRoute(user.role);
      navigate(destination, { replace: true });
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || "Failed to complete profile onboarding.";
      toast.error(msg);
    },
  });
};
