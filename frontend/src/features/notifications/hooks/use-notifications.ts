// src/features/notifications/hooks/use-notifications.ts
import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../api/notifications.api";
import type { NotificationQueryDto } from "../types/notifications.types";

export const useNotifications = (params?: NotificationQueryDto) => {
  return useQuery({
    queryKey: params ? ["notifications", params] : ["notifications"],
    queryFn: () => getNotifications(params),
  });
};
