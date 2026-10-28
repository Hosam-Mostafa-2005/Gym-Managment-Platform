import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addExerciseToSession } from "../api/workout-sessions.api";
import type { AddExerciseToSessionPayload } from "../types/workout-session.types";

export function useAddExerciseToSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      payload,
    }: {
      sessionId: string;
      payload: AddExerciseToSessionPayload;
    }) => addExerciseToSession(sessionId, payload),

    onSuccess: (_data, variables) => {
      toast.success("Exercise added to active workout.");
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
        err?.response?.data?.message || "Failed to add exercise to session.";
      toast.error(message);
    },
  });
}
