import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteWorkoutSet } from "../api/workout-sessions.api";

export const useDeleteWorkoutSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWorkoutSet(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workout-session"],
      });
    },

    onError: () => {
      toast.error("Failed to delete set.");
    },
  });
};
