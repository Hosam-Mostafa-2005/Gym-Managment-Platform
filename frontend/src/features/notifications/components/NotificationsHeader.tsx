// src/features/notifications/components/NotificationsHeader.tsx

import React from "react";
import { CheckCheck, Settings2 } from "lucide-react";
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-notifications-read";
import type { NotificationCategory } from "../types/notifications.types";

interface NotificationsHeaderProps {
  unreadCount: number;
  activeCategory: NotificationCategory | "ALL";
  onOpenPreferences: () => void;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
  activeCategory,
  onOpenPreferences,
}) => {
  const { mutate: markAllRead, isPending } = useMarkAllNotificationsRead();

  const handleMarkAll = () => {
    markAllRead(activeCategory === "ALL" ? undefined : activeCategory);
  };

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#1E2329] pb-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <span className="inline-flex items-center justify-center rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-0.5 text-[11px] font-bold text-[#5BE584]">
              {unreadCount} Unread
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Stay up to date with activity, milestones, and updates across your gym.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={onOpenPreferences}
          className="inline-flex items-center gap-2 rounded-xl border border-[#1E2329] bg-[#101418] px-3.5 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#1E2329] hover:text-white"
        >
          <Settings2 className="h-4 w-4" />
          Preferences
        </button>

        <button
          type="button"
          onClick={handleMarkAll}
          disabled={unreadCount === 0 || isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-[#1E2329] bg-[#151A20] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#1E2329] hover:text-[#5BE584] disabled:opacity-50 disabled:pointer-events-none"
        >
          <CheckCheck className="h-4 w-4" />
          {activeCategory !== "ALL"
            ? `Mark ${activeCategory.toLowerCase()} read`
            : "Mark all as read"}
        </button>
      </div>
    </div>
  );
};
