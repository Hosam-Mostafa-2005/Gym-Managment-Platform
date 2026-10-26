import { useQuery } from "@tanstack/react-query";

import { getMembersManagement } from "../api/members-management.api";
import type { MembersManagementQuery } from "../types/members-management.types";

export const useMembersManagement = (
  params?: MembersManagementQuery,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: ["members-management", params],
    queryFn: () => getMembersManagement(params),
    enabled: options?.enabled,
  });
};
