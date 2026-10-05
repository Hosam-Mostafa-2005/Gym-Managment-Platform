import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth.api";
import { tokenService } from "@/services/token.service";

export const useCurrentUser = () => {
  const token = tokenService.getToken();

  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled: !!token,
  });
};
