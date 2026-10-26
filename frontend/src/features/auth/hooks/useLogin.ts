// src/features/auth/hooks/useLogin.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { AxiosError } from "axios";

import { login } from "../api/auth.api";
import { tokenService } from "../../../services/token.service";
import { useAuthStore } from "@/store/auth.store";
import { resolveAuthRedirect } from "../utils/auth-redirect";

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: (response) => {
      // Save authentication token
      tokenService.saveToken(response.token);

      // Keep Zustand in sync immediately
      setUser(response.data.user);

      // Keep React Query current-user cache in sync
      queryClient.setQueryData(["current-user"], response.data.user);

      toast.success("Welcome back!");

      const searchParams = new URLSearchParams(location.search);
      const returnUrl = searchParams.get("returnTo");

      const destination = resolveAuthRedirect({
        user: response.data.user,
        returnUrl,
        locationState: location.state,
      });

      navigate(destination, { replace: true });
    },

    onError: (error: AxiosError<{ message: string; email?: string }>, variables) => {
      const msg = error.response?.data?.message ?? "Something went wrong.";
      const status = error.response?.status;

      if (status === 403 && msg.toLowerCase().includes("verify your email")) {
        toast.info(msg);
        navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`);
        return;
      }

      toast.error(msg);
    },
  });
};
