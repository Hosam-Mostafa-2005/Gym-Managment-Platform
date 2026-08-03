import { useQuery } from "@tanstack/react-query";

import { getAssignments } from "../api/assignments.api";

export const useAssignments = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["assignments", page, limit],
    queryFn: () => getAssignments(page, limit),
    placeholderData: (prev) => prev,
  });
};
