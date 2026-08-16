import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateWorkoutSet } from "../api/workout-sessions.api";

export function useUpdateWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: {
        weight: number;
        actualReps: number;
      };
    }) => updateWorkoutSet(id, payload),

    onSuccess: () => {
      toast.success("Set completed successfully.");

      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
    },

    onError: () => {
      toast.error("Failed to update set.");
    },
  });
}
