// src/features/notifications/hooks/use-mark-all-notifications-read.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "../api/notifications.api";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: (category?: string | void) =>
      markAllNotificationsAsRead(category || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      toast.error(t("toasts.markAllFailed"));
    },
  });
};
