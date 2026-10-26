import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { duplicateWorkout } from "../api/workouts.api";

export const useDuplicateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, title }: { id: string; title?: string }) =>
      duplicateWorkout(id, title),
    onSuccess: (workout) => {
      toast.success(`Workout duplicated: ${workout.title}`);
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
    onError: () => {
      toast.error("Failed to duplicate workout.");
    },
  });
};
