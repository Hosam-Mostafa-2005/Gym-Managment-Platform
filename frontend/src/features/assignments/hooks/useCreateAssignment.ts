import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import i18n from "@/i18n";
import { createAssignment } from "../api/assignments.api";
import type { CreateAssignmentPayload } from "../types/assignment.types";

export function useCreateAssignment(options?: { redirectTo?: string | null }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      queryClient.invalidateQueries({ queryKey: ["my-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      if (variables?.member) {
        queryClient.invalidateQueries({
          queryKey: ["member-profile", variables.member],
        });
      }
      toast.success(
        i18n.t(
          "assignments:toasts.createdSuccess",
          "Assignment created successfully! 🎉",
        ),
      );
      if (options?.redirectTo !== null) {
        navigate(options?.redirectTo || "/assignments");
      }
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message ||
          i18n.t(
            "assignments:toasts.createError",
            "Failed to create assignment.",
          ),
      );
    },
  });
}
