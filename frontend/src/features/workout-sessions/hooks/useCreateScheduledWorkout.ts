import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { createScheduledWorkout } from "../api/scheduled-workouts.api";
import type { CreateScheduledWorkoutPayload } from "../types/workout-session.types";

export const useCreateScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateScheduledWorkoutPayload) =>
      createScheduledWorkout(payload),
    onSuccess: () => {
      toast.success("Workout scheduled successfully!");
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to schedule workout.";
      toast.error(message);
    },
  });
};
