import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateWorkoutSet } from "../api/workout-sessions.api";
import type { UpdateWorkoutSetPayload } from "../types/workout-session.types";

export function useUpdateWorkoutSet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateWorkoutSetPayload;
    }) => updateWorkoutSet(id, payload),

    onSuccess: (data, variables) => {
      if (variables.payload.completed) {
        toast.success("Set logged successfully.");
      }

      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
    },

    onError: () => {
      toast.error("Failed to update set.");
    },
  });
}
