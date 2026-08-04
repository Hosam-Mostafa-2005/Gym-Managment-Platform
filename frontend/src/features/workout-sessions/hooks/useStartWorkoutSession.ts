import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { startWorkoutSession } from "../api/workout-sessions.api";

export const useStartWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: startWorkoutSession,

    onSuccess: () => {
      toast.success("Workout session started.");

      queryClient.invalidateQueries({
        queryKey: ["workout-sessions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
    },
  });
};
