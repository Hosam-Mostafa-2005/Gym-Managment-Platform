import type { INotification } from "../types/notification.types.js";

const mapNotification = (notification: INotification & { _id: unknown }) => ({
  id: notification._id,
  user: notification.user,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  readAt: notification.readAt,
  isRead: !!notification.readAt,
  actionUrl: notification.actionUrl,
  metadata: notification.metadata,
  createdAt: (notification as any).createdAt,
  updatedAt: (notification as any).updatedAt,
});

export default mapNotification;
