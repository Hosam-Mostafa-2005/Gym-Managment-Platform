// src/features/notifications/components/NotificationsList.tsx
import React from "react";
import { NotificationItem } from "./NotificationItem";
import type { Notification } from "../types/notifications.types";

interface NotificationsListProps {
  notifications: Notification[];
}

export const NotificationsList: React.FC<NotificationsListProps> = ({
  notifications,
}) => {
  return (
    <div className="flex flex-col gap-3">
      {notifications.map((notification) => (
        <NotificationItem key={notification.id} notification={notification} />
      ))}
    </div>
  );
};
