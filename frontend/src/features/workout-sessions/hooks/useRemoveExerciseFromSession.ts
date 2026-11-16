import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { removeExerciseFromSession } from "../api/workout-sessions.api";

export function useRemoveExerciseFromSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseLogId,
    }: {
      sessionId: string;
      exerciseLogId: string;
    }) => removeExerciseFromSession(sessionId, exerciseLogId),

    onSuccess: (_data, variables) => {
      toast.success("Exercise removed from session.");
      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-session", variables.sessionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions"],
      });
    },

    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to remove exercise from session.";
      toast.error(message);
    },
  });
}
