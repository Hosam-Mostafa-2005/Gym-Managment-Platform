import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "@/features/assignments/api/assignments.api";

export const useMyAssignments = (enabled = true, archived?: boolean | "all") => {
  return useQuery({
    queryKey: ["my-assignments", archived],
    queryFn: () => getMyAssignments({ archived }),
    enabled,
  });
};
