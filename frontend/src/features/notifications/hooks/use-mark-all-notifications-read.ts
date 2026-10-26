// src/features/notifications/hooks/use-mark-all-notifications-read.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "../api/notifications.api";
import { toast } from "sonner";

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (category?: string | void) =>
      markAllNotificationsAsRead(category || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });
};
