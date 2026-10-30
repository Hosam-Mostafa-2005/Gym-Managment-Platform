// src/features/notifications/hooks/use-notification-preferences.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../api/notifications.api";
import type { NotificationPreference } from "../types/notifications.types";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

export const useNotificationPreferences = () => {
  return useQuery({
    queryKey: ["notification-preferences"],
    queryFn: getNotificationPreferences,
    staleTime: 1000 * 60 * 5,
  });
};

export const useUpdateNotificationPreferences = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation("notifications");

  return useMutation({
    mutationFn: (preferences: Partial<NotificationPreference>) =>
      updateNotificationPreferences(preferences),
    onSuccess: (updated) => {
      queryClient.setQueryData(["notification-preferences"], updated);
      toast.success(t("toasts.preferencesUpdated"));
    },
    onError: () => {
      toast.error(t("toasts.preferencesUpdateFailed"));
    },
  });
};
