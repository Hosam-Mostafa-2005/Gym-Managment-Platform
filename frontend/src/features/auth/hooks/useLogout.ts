import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { logout } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";

export const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: logout,

    onSettled: () => {
      tokenService.removeToken();
      clearUser();
      queryClient.clear();
      navigate("/", { replace: true });
    },
  });
};

