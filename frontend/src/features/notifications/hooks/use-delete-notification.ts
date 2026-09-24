// src/features/notifications/hooks/use-delete-notification.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification } from "../api/notifications.api";
import { toast } from "sonner";

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success("Notification deleted");
    },
    onError: () => {
      toast.error("Failed to delete notification");
    },
  });
};
