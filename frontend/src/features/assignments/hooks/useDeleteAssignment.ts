import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { deleteAssignment } from "../api/assignments.api";

export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAssignment,

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
      toast.success(
        i18n.t(
          "assignments:toasts.deleteSuccess",
          "Assignment deleted successfully!",
        ),
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          i18n.t(
            "assignments:toasts.deleteError",
            "Failed to delete assignment.",
          ),
      );
    },
  });
};
