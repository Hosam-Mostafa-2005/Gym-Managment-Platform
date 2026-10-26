import { useMutation, useQueryClient } from "@tanstack/react-query";
import { cancelInvitation } from "../api/coaching-relationships.api";

export const useCancelInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => cancelInvitation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coaching-relationships", "coach-invitations"],
      });
      queryClient.invalidateQueries({
        queryKey: ["members-management"],
      });
    },
  });
};
