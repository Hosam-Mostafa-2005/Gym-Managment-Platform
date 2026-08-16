import { useQuery } from "@tanstack/react-query";

import { getCurrentUser } from "../api/auth.api";

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
  });
};
