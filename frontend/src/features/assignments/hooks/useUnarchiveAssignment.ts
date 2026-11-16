import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { unarchiveAssignment } from "../api/assignments.api";

export function useUnarchiveAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unarchiveAssignment,

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

      toast.success("Assignment unarchived successfully.");
    },

    onError: (err: any) => {
      const message =
        err?.response?.data?.message || "Failed to unarchive assignment.";
      toast.error(message);
    },
  });
}
