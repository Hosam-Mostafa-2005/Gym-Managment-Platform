// src/types/notification.types.ts
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CATEGORY,
  type NotificationCategory,
} from "../constants/notification.js";

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface INotification {
  id?: string;
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
}

export interface CreateNotificationDto {
  user: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: NotificationCategory;
  priority?: "NORMAL" | "HIGH" | "URGENT";
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationQueryDto {
  category?: string;
  status?: "all" | "unread" | "read";
  search?: string;
  page?: number;
  limit?: number;
}
