import { useQuery } from "@tanstack/react-query";

import { getWorkouts } from "../api/workouts.api";

export const useWorkouts = () => {
  return useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });
};
