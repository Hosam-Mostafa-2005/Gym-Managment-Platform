// src/features/notifications/hooks/use-mark-all-notifications-read.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAllNotificationsAsRead } from "../api/notifications.api";
import { toast } from "sonner"; // Assuming Sonner based on standard modern stack conventions

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: () => {
      toast.error("Failed to mark all as read");
    },
  });
};
