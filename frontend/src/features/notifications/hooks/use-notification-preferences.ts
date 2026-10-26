// src/features/notifications/hooks/use-notification-preferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../api/notifications.api";
import type { NotificationPreference } from "../types/notifications.types";
import { toast } from "sonner";

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreference>) =>
      updateNotificationPreferences(preferences),
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences"], updated);
      toast.success("Notification preferences updated");
    },
    onError: () => {
      toast.error("Failed to update notification preferences");
    },
  });
};
