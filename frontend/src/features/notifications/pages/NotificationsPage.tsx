// src/features/notifications/pages/NotificationsPage.tsx
import React, { useState } from "react";
import { useNotifications } from "../hooks/use-notifications";

import { NotificationsHeader } from "../components/NotificationsHeader";
import { NotificationFilters } from "../components/NotificationFilters";
import { NotificationsList } from "../components/NotificationsList";
import { NotificationPreferencesModal } from "../components/NotificationPreferencesModal";

import { NotificationsLoading } from "../components/states/NotificationsLoading";
import { NotificationsError } from "../components/states/NotificationsError";
import { NotificationsEmpty } from "../components/states/NotificationsEmpty";
import type { NotificationCategory } from "../types/notifications.types";

const NotificationsPage: React.FC = () => {
  const [category, setCategory] = useState<NotificationCategory | "ALL">("ALL");
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");
  const [search, setSearch] = useState("");
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  // Query notifications with category, status, and search filters
  const { data, isLoading, isError, error, refetch } = useNotifications({
    category,
    status,
    search,
  });

  const notifications = data?.notifications || [];
  const unreadCount = data?.unreadCount || 0;
  const categoryUnreadCounts = data?.categoryUnreadCounts || {};

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-20">
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-6">
        <NotificationsHeader
          unreadCount={unreadCount}
          activeCategory={category}
          onOpenPreferences={() => setIsPreferencesOpen(true)}
        />

        <div className="flex flex-col gap-5">
          <NotificationFilters
            category={category}
            onCategoryChange={setCategory}
            status={status}
            onStatusChange={setStatus}
            search={search}
            onSearchChange={setSearch}
            categoryUnreadCounts={categoryUnreadCounts}
            totalUnread={unreadCount}
          />

          {isLoading ? (
            <NotificationsLoading />
          ) : isError ? (
            <NotificationsError
              message={error instanceof Error ? error.message : undefined}
              onRetry={() => refetch()}
            />
          ) : notifications.length > 0 ? (
            <NotificationsList notifications={notifications} />
          ) : (
            <NotificationsEmpty filter={status} />
          )}
        </div>
      </div>

      {/* Notification Preferences Modal */}
      <NotificationPreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </div>
  );
};

export default NotificationsPage;
