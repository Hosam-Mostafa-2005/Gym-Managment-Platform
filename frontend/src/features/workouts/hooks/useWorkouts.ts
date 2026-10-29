import { useQuery } from "@tanstack/react-query";

import { getWorkouts } from "../api/workouts.api";

export const useWorkouts = (params?: Record<string, any>) => {
  return useQuery({
    queryKey:
      params && Object.keys(params).length > 0
        ? ["workouts", params]
        : ["workouts"],
    queryFn: () => getWorkouts(params),
  });
};
