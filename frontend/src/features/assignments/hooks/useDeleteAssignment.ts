import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteAssignment } from "../api/assignments.api";

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });
};
