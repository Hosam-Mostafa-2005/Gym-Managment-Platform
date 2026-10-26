import { useQuery } from "@tanstack/react-query";
import { getScheduledWorkouts } from "../api/scheduled-workouts.api";

export const useScheduledWorkouts = (query?: {
  status?: string;
  upcomingOnly?: string;
}) => {
  return useQuery({
    queryKey: ["scheduled-workouts", query],
    queryFn: () => getScheduledWorkouts(query),
  });
};
