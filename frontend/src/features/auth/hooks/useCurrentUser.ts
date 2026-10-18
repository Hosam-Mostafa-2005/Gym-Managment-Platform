import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth.api";
import { tokenService } from "@/services/token.service";
import { useAuthStore } from "@/store/auth.store";

export const useCurrentUser = () => {
  const token = tokenService.getToken();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const query = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    enabled: !!token,
    retry: false,
  });

  useEffect(() => {
    if (!token) {
      clearUser();
      return;
    }

    if (query.data) {
      setUser(query.data);
    } else if (query.isError) {
      tokenService.removeToken();
      clearUser();
    }
  }, [token, query.data, query.isError, setUser, clearUser]);

  return query;
};

