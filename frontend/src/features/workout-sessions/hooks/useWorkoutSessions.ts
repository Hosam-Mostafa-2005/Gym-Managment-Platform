import { useQuery } from "@tanstack/react-query";

import { getWorkoutSessions } from "../api/workout-sessions.api";

export const useWorkoutSessions = (page: number, limit: number) => {
  return useQuery({
    queryKey: ["workout-sessions", page, limit],
    queryFn: () => getWorkoutSessions(page, limit),
  });
};
