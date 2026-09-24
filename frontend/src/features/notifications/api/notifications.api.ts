// src/features/notifications/api/notifications.api.ts

import { api } from "@/lib/axios";
import type {
  ApiResponse,
  Notification,
  NotificationsResponse,
} from "../types/notifications.types";

export const getNotifications = async (): Promise<NotificationsResponse> => {
  const response =
    await api.get<ApiResponse<NotificationsResponse>>("/notifications");
  return response.data.data;
};

export const markAllNotificationsAsRead = async (): Promise<void> => {
  await api.patch("/notifications/read-all");
};

export const markNotificationAsRead = async (
  id: string,
): Promise<Notification> => {
  const response = await api.patch<ApiResponse<{ notification: Notification }>>(
    `/notifications/${id}/read`,
  );
  return response.data.data.notification;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};
