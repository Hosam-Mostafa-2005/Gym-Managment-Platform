// src/features/notifications/api/notifications.api.ts

import { api } from "@/lib/axios";
import type {
  ApiResponse,
  Notification,
  NotificationsResponse,
  NotificationPreference,
  NotificationQueryDto,
} from "../types/notifications.types";

export const getNotifications = async (
  params?: NotificationQueryDto,
): Promise<NotificationsResponse> => {
  const queryParams: Record<string, any> = {};
  if (params?.category && params.category !== "ALL") {
    queryParams.category = params.category;
  }
  if (params?.status && params.status !== "all") {
    queryParams.status = params.status;
  }
  if (params?.search && params.search.trim()) {
    queryParams.search = params.search.trim();
  }
  if (params?.page) {
    queryParams.page = params.page;
  }
  if (params?.limit) {
    queryParams.limit = params.limit;
  }

  const response = await api.get<ApiResponse<NotificationsResponse>>(
    "/notifications",
    { params: queryParams },
  );
  return response.data.data;
};

export const markAllNotificationsAsRead = async (
  category?: string,
): Promise<void> => {
  const payload = category && category !== "ALL" ? { category } : undefined;
  await api.patch("/notifications/read-all", payload);
};

export const markNotificationAsRead = async (
  id: string,
): Promise<Notification> => {
  const response = await api.patch<ApiResponse<{ notification: Notification }>>(
    `/notifications/${id}/read`,
  );
  return response.data.data.notification;
};

export const markNotificationAsUnread = async (
  id: string,
): Promise<Notification> => {
  const response = await api.patch<ApiResponse<{ notification: Notification }>>(
    `/notifications/${id}/unread`,
  );
  return response.data.data.notification;
};

export const deleteNotification = async (id: string): Promise<void> => {
  await api.delete(`/notifications/${id}`);
};

export const getNotificationPreferences = async (): Promise<NotificationPreference> => {
  const response = await api.get<ApiResponse<{ preferences: NotificationPreference }>>(
    "/notifications/preferences",
  );
  return response.data.data.preferences;
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreference>,
): Promise<NotificationPreference> => {
  const response = await api.patch<ApiResponse<{ preferences: NotificationPreference }>>(
    "/notifications/preferences",
    preferences,
  );
  return response.data.data.preferences;
};
