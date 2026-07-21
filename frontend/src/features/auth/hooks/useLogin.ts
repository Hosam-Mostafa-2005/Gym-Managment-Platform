import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { login } from "../api/auth.api";
import { tokenService } from "../../../services/token.service";
import { AxiosError } from "axios";
import { useAuthStore } from "@/store/auth.store";

export const useLogin = () => {
  const navigate = useNavigate();

  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: login,

    onSuccess: (response) => {
      tokenService.saveToken(response.token);

      setUser(response.data.user);

      toast.success("Welcome back!");

      navigate("/");
    },

    onError: (error: AxiosError<{ message: string }>) => {
      toast.error(error.response?.data?.message ?? "Something went wrong.");
    },
  });
};
