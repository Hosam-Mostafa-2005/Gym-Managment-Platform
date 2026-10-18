import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "@/features/assignments/api/assignments.api";

export const useMyAssignments = (enabled = true) => {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
    enabled,
  });
};
