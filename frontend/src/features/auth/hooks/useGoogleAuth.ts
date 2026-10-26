// src/features/auth/hooks/useGoogleAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { googleAuth } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";
import { resolveAuthRedirect } from "../utils/auth-redirect";

export const useGoogleAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (idToken: string) => googleAuth({ idToken }),
    onSuccess: (res) => {
      tokenService.saveToken(res.token);
      setUser(res.data.user);
      queryClient.setQueryData(["current-user"], res.data.user);
      toast.success(
        res.data.user.name
          ? `Welcome, ${res.data.user.name}!`
          : "Signed in with Google!",
      );

      const searchParams = new URLSearchParams(location.search);
      const returnUrl = searchParams.get("returnTo");

      const destination = resolveAuthRedirect({
        user: res.data.user,
        returnUrl,
        locationState: location.state,
      });

      navigate(destination, { replace: true });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Google sign-in failed.";
      toast.error(msg);
    },
  });
};
