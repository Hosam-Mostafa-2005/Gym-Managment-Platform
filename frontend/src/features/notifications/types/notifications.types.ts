// src/features/notifications/types/notifications.types.ts

export type NotificationType =
  "WORKOUT" | "ASSIGNMENT" | "MEASUREMENT" | "SYSTEM" | string;

export interface Notification {
  id: string;
  user: string; // User ID reference
  title: string;
  message: string;
  type: NotificationType;
  readAt: string | null;
  actionUrl: string | null;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data: T;
  message?: string;
}
