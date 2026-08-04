import { useQuery } from "@tanstack/react-query";

import { getWorkoutSession } from "../api/workout-sessions.api";

export const useWorkoutSession = (id: string) => {
  return useQuery({
    queryKey: ["workout-session", id],
    queryFn: () => getWorkoutSession(id),
    enabled: !!id,
  });
};
