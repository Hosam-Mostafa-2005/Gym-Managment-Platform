import { Types } from "mongoose";
import { NOTIFICATION_TYPE } from "../constants/notification.js";

export type NotificationType =
  (typeof NOTIFICATION_TYPE)[keyof typeof NOTIFICATION_TYPE];

export interface INotification {
  user: Types.ObjectId;

  title: string;

  message: string;

  type: NotificationType;

  readAt?: Date;

  actionUrl?: string;

  metadata?: Record<string, unknown>;

  isActive: boolean;
}

export interface CreateNotificationDto {
  user: Types.ObjectId;

  title: string;

  message: string;

  type: NotificationType;

  actionUrl?: string;

  metadata?: Record<string, unknown>;
}
