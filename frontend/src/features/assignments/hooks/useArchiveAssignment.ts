import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { archiveAssignment } from "../api/assignments.api";

export function useArchiveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: archiveAssignment,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });

      toast.success("Assignment archived successfully.");
    },

    onError: () => {
      toast.error("Failed to archive assignment.");
    },
  });
}
