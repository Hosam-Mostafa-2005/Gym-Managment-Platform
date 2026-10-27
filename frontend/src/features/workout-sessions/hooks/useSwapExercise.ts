import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { swapExercise } from "../api/workout-sessions.api";
import type { SwapExercisePayload } from "../types/workout-session.types";

export function useSwapExercise() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sessionId,
      exerciseLogId,
      payload,
    }: {
      sessionId: string;
      exerciseLogId: string;
      payload: SwapExercisePayload;
    }) => swapExercise(sessionId, exerciseLogId, payload),

    onSuccess: (_data, variables) => {
      toast.success("Exercise swapped successfully.");
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
        err?.response?.data?.message || "Failed to swap exercise.";
      toast.error(message);
    },
  });
}
