import { useQuery } from "@tanstack/react-query";
import { getMyAssignments } from "../api/workout-sessions.api";

export const useMyAssignments = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
    enabled: options?.enabled ?? true,
  });
};
