import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  updateCoachProfile,
  type UpdateCoachProfilePayload,
} from "../api/coach-profile.api";

export const useUpdateCoachProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCoachProfilePayload) =>
      updateCoachProfile(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coach-profile"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      queryClient.invalidateQueries({ queryKey: ["currentUser"] });
      queryClient.invalidateQueries({ queryKey: ["auth"] });
      queryClient.invalidateQueries({ queryKey: ["coach-dashboard"] });
    },
  });
};
