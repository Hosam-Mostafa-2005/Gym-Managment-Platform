import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { updateWorkout } from "../api/workouts.api";
import type { UpdateWorkoutPayload } from "../types/workout.types";

interface UpdateWorkoutArgs {
  id: string;
  data: UpdateWorkoutPayload;
}

export const useUpdateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: UpdateWorkoutArgs) => updateWorkout(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });

      queryClient.invalidateQueries({
        queryKey: ["workout", variables.id],
      });

      toast.success("Workout updated successfully.");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
