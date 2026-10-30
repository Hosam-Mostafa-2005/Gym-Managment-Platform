import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import i18n from "@/i18n";
import { updateAssignment } from "../api/assignments.api";

export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Parameters<typeof updateAssignment>[1];
    }) => updateAssignment(id, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["assignments", variables.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["my-assignments"],
      });
      queryClient.invalidateQueries({
        queryKey: ["dashboard"],
      });
      toast.success(
        i18n.t(
          "assignments:toasts.updateSuccess",
          "Assignment updated successfully!",
        ),
      );
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          i18n.t(
            "assignments:toasts.updateError",
            "Failed to update assignment.",
          ),
      );
    },
  });
};
