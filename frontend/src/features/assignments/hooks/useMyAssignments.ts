import { useQuery } from "@tanstack/react-query";

import { getMyAssignments } from "../api/assignments.api";

export const useMyAssignments = () => {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
  });
};
