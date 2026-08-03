import { useMutation, useQueryClient } from "@tanstack/react-query";

import { updateAssignment } from "../api/assignments.api";

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAssignment>[1];
    }) => updateAssignment(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });

      queryClient.invalidateQueries({
        queryKey: ["assignments", variables.id],
      });
    },
  });
};
