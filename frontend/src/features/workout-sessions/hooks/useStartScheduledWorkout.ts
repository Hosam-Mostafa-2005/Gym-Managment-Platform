import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { startScheduledWorkout } from "../api/scheduled-workouts.api";

export const useStartScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => startScheduledWorkout(id),
    onSuccess: () => {
      toast.success("Starting scheduled workout session!");
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
      queryClient.invalidateQueries({ queryKey: ["current-workout-session"] });
      queryClient.invalidateQueries({ queryKey: ["workout-sessions"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to start scheduled workout.";
      toast.error(message);
    },
  });
};
