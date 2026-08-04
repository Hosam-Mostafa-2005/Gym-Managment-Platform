import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createWorkoutSet } from "../api/workout-sessions.api";

export const useCreateWorkoutSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkoutSet,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workout-session"],
      });
    },

    onError: () => {
      toast.error("Failed to save set.");
    },
  });
};
