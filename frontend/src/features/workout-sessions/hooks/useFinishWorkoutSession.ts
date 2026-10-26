import { useMutation, useQueryClient } from "@tanstack/react-query";
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
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["current-workout-session"],
      });
      queryClient.invalidateQueries({
        queryKey: ["scheduled-workouts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-scheduled-workouts"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-calendar-summary"],
      });
      queryClient.invalidateQueries({
        queryKey: ["gamification"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
