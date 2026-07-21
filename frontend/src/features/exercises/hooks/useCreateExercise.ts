import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { createExercise } from "../api/exercises.api";

import type { CreateExerciseDto } from "../types/exercise.types";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExerciseDto) => createExercise(data),

    onSuccess: () => {
      toast.success("Exercise created successfully");

      queryClient.invalidateQueries({
        queryKey: ["exercises"],
      });
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
