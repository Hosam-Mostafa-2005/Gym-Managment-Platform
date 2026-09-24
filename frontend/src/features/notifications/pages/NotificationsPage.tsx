// src/features/notifications/pages/NotificationsPage.tsx
import React, { useState, useMemo } from "react";
import { useNotifications } from "../hooks/use-notifications";

import { NotificationsHeader } from "../components/NotificationsHeader";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationsList } from "../components/NotificationsList";

import { NotificationsLoading } from "../components/states/NotificationsLoading";
import { NotificationsError } from "../components/states/NotificationsError";
import { NotificationsEmpty } from "../components/states/NotificationsEmpty";

const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<"all" | "unread">("all");

  // This automatically inherits the Socket.IO invalidations existing in your app
  // because we are utilizing the same `["notifications"]` React Query key.
  const { data, isLoading, isError, error, refetch } = useNotifications();

  // Defensive fallback in case data shape changes slightly
  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.readAt);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-6">
        <NotificationsHeader unreadCount={unreadCount} />

        <div className="flex flex-col gap-5">
          <NotificationFilters filter={filter} onChange={setFilter} />

          {isLoading ? (
            <NotificationsLoading />
          ) : isError ? (
            <NotificationsError
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => refetch()}
            />
          ) : filteredNotifications.length > 0 ? (
            <NotificationsList notifications={filteredNotifications} />
          ) : (
            <NotificationsEmpty filter={filter} />
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
