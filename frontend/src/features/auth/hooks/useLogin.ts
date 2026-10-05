import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login } from "../api/auth.api";
import { tokenService } from "../../../services/token.service";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";

export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: (response) => {
      // Save authentication token
      tokenService.saveToken(response.token);

      // Keep Zustand in sync
      setUser(response.data.user);

      // IMPORTANT:
      // Keep React Query current-user cache in sync
      queryClient.setQueryData(["current-user"], response.data.user);

      toast.success("Welcome back!");

      navigate("/home", { replace: true });
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Something went wrong.");
    },
  });
};
