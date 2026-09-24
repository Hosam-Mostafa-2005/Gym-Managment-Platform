// src/features/notifications/components/NotificationsHeader.tsx
import React from "react";
import { CheckCheck } from "lucide-react";
import { useMarkAllNotificationsRead } from "../hooks/use-mark-all-notifications-read";

interface NotificationsHeaderProps {
  unreadCount: number;
}

export const NotificationsHeader: React.FC<NotificationsHeaderProps> = ({
  unreadCount,
}) => {
  const { mutate: markAllRead, isPending } = useMarkAllNotificationsRead();

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
          Stay up to date with activity and updates across your gym.
        </p>
      </div>

      <button
        onClick={() => markAllRead()}
        disabled={unreadCount === 0 || isPending}
        className="inline-flex w-fit items-center gap-2 rounded-md border border-[#1E2329] bg-[#151A20] px-4 py-2 text-xs font-semibold text-gray-300 transition-colors hover:bg-[#1E2329] hover:text-[#5BE584] disabled:opacity-50 disabled:pointer-events-none"
      >
        <CheckCheck className="h-4 w-4" />
        Mark all as read
      </button>
    </div>
  );
};
