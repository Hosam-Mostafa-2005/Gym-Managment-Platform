import { useMutation, useQueryClient } from "@tanstack/react-query";
import { logout } from "../api/auth.api";
import { tokenService } from "@/services/token.service";

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      tokenService.removeToken();
      queryClient.clear();
      window.location.href = "/";
    },
  });
};
