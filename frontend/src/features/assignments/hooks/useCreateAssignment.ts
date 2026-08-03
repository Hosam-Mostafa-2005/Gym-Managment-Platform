import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createAssignment } from "../api/assignments.api";
import type { CreateAssignmentPayload } from "../types/assignment.types";

export function useCreateAssignment() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (payload: CreateAssignmentPayload) => createAssignment(payload),
    onSuccess: () => {
      // تحديث كاش التمارين عشان تسمع في الجدول فوراً
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Assignment created successfully! 🎉");
      navigate("/assignments"); // الرجوع لصفحة الجدول
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to create assignment.",
      );
    },
  });
}
