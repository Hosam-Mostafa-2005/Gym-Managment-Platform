const mapNotification = (notification: any) => ({
  id: notification.id ?? notification._id,
  user: notification.userId ?? notification.user,
  title: notification.title,
  message: notification.message,
  type: notification.type,
  category: notification.category,
  priority: notification.priority || "NORMAL",
  readAt: notification.readAt,
  isRead: Boolean(notification.readAt),
  actionUrl: notification.actionUrl,
  metadata: notification.metadata,
  createdAt: notification.createdAt,
  updatedAt: notification.updatedAt,
});

export default mapNotification;
