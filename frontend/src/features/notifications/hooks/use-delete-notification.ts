// src/features/notifications/hooks/use-delete-notification.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../api/notifications.api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success(t("toasts.deleted"));
    },
    onError: () => {
      toast.error(t("toasts.deleteFailed"));
    },
  });
};
