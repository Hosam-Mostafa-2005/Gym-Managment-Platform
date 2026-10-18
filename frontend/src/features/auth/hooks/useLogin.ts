import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login } from "../api/auth.api";
import { tokenService } from "../../../services/token.service";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";

interface LocationState {
  from?: {
    pathname?: string;
    search?: string;
  };
}

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

      // Keep Zustand in sync
      setUser(response.data.user);

      // Keep React Query current-user cache in sync
      queryClient.setQueryData(["current-user"], response.data.user);

      toast.success("Welcome back!");

      const state = location.state as LocationState | null;
      const fromPathname = state?.from?.pathname;
      const fromSearch = state?.from?.search ?? "";

      const isValidReturnPath =
        fromPathname &&
        fromPathname !== "/" &&
        fromPathname !== "/login" &&
        fromPathname !== "/register";

      navigate(isValidReturnPath ? `${fromPathname}${fromSearch}` : "/home", {
        replace: true,
      });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Something went wrong.");
    },
  });
};

