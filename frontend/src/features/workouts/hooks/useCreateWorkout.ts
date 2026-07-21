import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createWorkout } from "../api/workouts.api";

export const useCreateWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWorkout,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });

      toast.success("Workout created successfully.");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
