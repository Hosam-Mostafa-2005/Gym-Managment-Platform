import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  terminateRelationship,
  terminateActiveMemberRelationship,
} from "../api/coaching-relationships.api";

export const useTerminateRelationship = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string) =>
      id
        ? terminateRelationship(id)
        : terminateActiveMemberRelationship(),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["coaching-relationships"],
      });
      queryClient.invalidateQueries({
        queryKey: ["members-management"],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-profile"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
    },
  });
};
