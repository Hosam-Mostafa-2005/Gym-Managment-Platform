import { useQuery } from "@tanstack/react-query";
import { getMyAssignments } from "../api/workout-sessions.api";

export const useMyAssignments = () => {
  return useQuery({
    queryKey: ["my-assignments"],
    queryFn: getMyAssignments,
  });
};
