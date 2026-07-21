import { useQuery } from "@tanstack/react-query";

import { getWorkout } from "../api/workouts.api";

export const useWorkout = (id: string) => {
  return useQuery({
    queryKey: ["workout", id],
    queryFn: () => getWorkout(id),
    enabled: !!id,
  });
};
