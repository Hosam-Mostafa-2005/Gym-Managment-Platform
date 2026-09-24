// src/features/notifications/components/states/NotificationsEmpty.tsx
import React from "react";
import { Bell } from "lucide-react";

interface NotificationsEmptyProps {
  filter: "all" | "unread";
}

export const NotificationsEmpty: React.FC<NotificationsEmptyProps> = ({
  filter,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-lg border border-[#1E2329] bg-[#0D1117]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#151A20] border border-[#1E2329]">
        <Bell className="h-5 w-5 text-gray-500" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-100">
        {filter === "unread"
          ? "No unread notifications"
          : "No notifications yet"}
      </h3>
      <p className="text-xs text-gray-500 max-w-sm">
        {filter === "unread"
          ? "You're all caught up! You have no pending unread alerts."
          : "When there is activity related to your account or assignments, it will appear here."}
      </p>
    </div>
  );
};
