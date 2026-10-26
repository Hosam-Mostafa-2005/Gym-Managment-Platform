import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateMemberProfile,
  type UpdateMemberProfilePayload,
} from "../api/member-profile.api";

export const useUpdateMemberProfile = (memberId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateMemberProfilePayload) =>
      updateMemberProfile(memberId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["member-profile", memberId] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
