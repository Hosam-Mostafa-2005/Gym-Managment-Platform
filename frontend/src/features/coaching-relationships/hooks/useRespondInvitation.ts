import { useMutation, useQueryClient } from "@tanstack/react-query";
import { respondInvitation } from "../api/coaching-relationships.api";
import type { RespondInvitationPayload } from "../types/coaching-relationships.types";

export const useRespondInvitation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: RespondInvitationPayload;
    }) => respondInvitation(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coaching-relationships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
