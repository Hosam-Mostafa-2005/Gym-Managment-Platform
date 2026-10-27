import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewWorkoutSession } from "../api/workout-sessions.api";
import type { ReviewWorkoutSessionPayload } from "../types/workout-session.types";

export const useReviewWorkoutSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewWorkoutSessionPayload;
    }) => reviewWorkoutSession(id, payload),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workout-session", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["workout-sessions"],
      });
    },
  });
};
