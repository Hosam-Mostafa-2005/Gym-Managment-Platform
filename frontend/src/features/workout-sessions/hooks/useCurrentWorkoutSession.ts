import { useQuery } from "@tanstack/react-query";

import { getCurrentWorkoutSession } from "../api/workout-sessions.api";

export const useCurrentWorkoutSession = () => {
  return useQuery({
    queryKey: ["current-workout-session"],
    queryFn: getCurrentWorkoutSession,
  });
};
