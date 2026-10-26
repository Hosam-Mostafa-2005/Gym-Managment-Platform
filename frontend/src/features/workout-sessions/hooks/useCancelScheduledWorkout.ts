import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { cancelScheduledWorkout } from "../api/scheduled-workouts.api";

export const useCancelScheduledWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelScheduledWorkout(id),
    onSuccess: () => {
      toast.success("Scheduled workout cancelled.");
      queryClient.invalidateQueries({ queryKey: ["scheduled-workouts"] });
    },
    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to cancel scheduled workout.";
      toast.error(message);
    },
  });
};
