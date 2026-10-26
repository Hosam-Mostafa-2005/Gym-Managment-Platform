import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateHistoryConsent } from "../api/coaching-relationships.api";
import type { UpdateHistoryConsentPayload } from "../types/coaching-relationships.types";

export const useUpdateHistoryConsent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateHistoryConsentPayload;
    }) => updateHistoryConsent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coaching-relationships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["members-management"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
    },
  });
};
