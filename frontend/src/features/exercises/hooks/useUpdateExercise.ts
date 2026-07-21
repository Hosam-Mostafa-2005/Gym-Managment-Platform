import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { UpdateExerciseDto } from "../types/exercise.types";
import { updateExercise } from "../api/exercises.api";

export const useUpdateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExerciseDto }) =>
      updateExercise(id, data),

    onSuccess: () => {
      toast.success("Exercise updated successfully.");

      queryClient.invalidateQueries({
        queryKey: ["exercises"],
      });
    },

    onError: () => {
      toast.error("Failed to update exercise.");
    },
  });
};
