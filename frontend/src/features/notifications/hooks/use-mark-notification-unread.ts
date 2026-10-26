// src/features/notifications/hooks/use-mark-notification-unread.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsUnread } from "../api/notifications.api";

export const useMarkNotificationUnread = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsUnread,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
};
