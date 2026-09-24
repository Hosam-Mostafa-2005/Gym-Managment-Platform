// src/features/notifications/hooks/use-mark-notification-read.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationAsRead } from "../api/notifications.api";

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
};
