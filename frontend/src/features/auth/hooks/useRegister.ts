// src/features/auth/hooks/useRegister.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { toast } from "sonner";

import { register, registerCoach } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";

export const useRegister = (options?: { isCoach?: boolean }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const registerFn = options?.isCoach ? registerCoach : register;

  return useMutation({
    mutationFn: registerFn,

    onSuccess: (response, variables) => {
      // If verification is pending, navigate to Verify Email page without issuing session
      if (response.isPendingVerification || !response.token) {
        toast.success(
          response.message || "Verification code sent! Please check your email.",
        );
        navigate(`/verify-email?email=${encodeURIComponent(variables.email.trim())}`);
        return;
      }

      if (response.token) {
        tokenService.saveToken(response.token);
      }
      if (response.data?.user) {
        setUser(response.data.user);
        queryClient.setQueryData(["current-user"], response.data.user);
      }

      toast.success(response.message || "Account created successfully! Welcome to STREN.");
      navigate("/onboarding", { replace: true });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      const msg = error.response?.data?.message || "Registration failed.";
      toast.error(msg);
    },
  });
};
