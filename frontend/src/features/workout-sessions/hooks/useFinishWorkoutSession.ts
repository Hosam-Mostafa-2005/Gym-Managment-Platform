import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { finishWorkoutSession } from "../api/workout-sessions.api";

import type { FinishWorkoutSessionPayload } from "../types/workout-session.types";

export const useFinishWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: FinishWorkoutSessionPayload;
    }) => finishWorkoutSession(id, payload),

    onSuccess: () => {
      toast.success("Workout completed successfully.");

      queryClient.invalidateQueries({
        queryKey: ["workout-sessions"],
      });

      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
    },
  });
};
