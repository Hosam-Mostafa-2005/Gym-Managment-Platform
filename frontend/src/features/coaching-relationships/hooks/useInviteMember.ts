import { useMutation, useQueryClient } from "@tanstack/react-query";
import { inviteMember } from "../api/coaching-relationships.api";
import type { InviteMemberPayload } from "../types/coaching-relationships.types";

export const useInviteMember = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: InviteMemberPayload) => inviteMember(payload),
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
