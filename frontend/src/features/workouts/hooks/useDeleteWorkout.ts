import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteWorkout } from "../api/workouts.api";

export const useDeleteWorkout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteWorkout,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workouts"],
      });

      toast.success("Workout archived successfully.");
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
