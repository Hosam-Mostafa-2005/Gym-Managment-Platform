import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { deleteExercise } from "../api/exercises.api";
import { getErrorMessage } from "../utils/getErrorMessage";

export const useDeleteExercise = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteExercise(id),

    onSuccess: () => {
      toast.success("Exercise archived successfully.");

      queryClient.invalidateQueries({
        queryKey: ["exercises"],
      });
    },

    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
};
