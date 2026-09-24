// src/features/notifications/components/NotificationItem.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Dumbbell,
  ClipboardList,
  Scale,
  Info,
  Trash2,
  Check,
} from "lucide-react";
import type { Notification } from "../types/notifications.types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import { useDeleteNotification } from "../hooks/use-delete-notification";

interface NotificationItemProps {
  notification: Notification;
}

// Simple local time formatter
const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
};

const getIcon = (type: string) => {
  switch (type?.toUpperCase()) {
    case "WORKOUT":
    case "SESSION":
    case "WORKOUT_COMPLETED":
      return <Dumbbell className="h-4 w-4" />;
    case "ASSIGNMENT":
    case "WORKOUT_ASSIGNED":
      return <ClipboardList className="h-4 w-4" />;
    case "MEASUREMENT":
    case "BODY_MEASUREMENT_RECORDED":
      return <Scale className="h-4 w-4" />;
    case "SYSTEM":
      return <Info className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const navigate = useNavigate();
  const { mutate: markAsRead, isPending: isMarking } =
    useMarkNotificationRead();
  const { mutate: deleteNotification, isPending: isDeleting } =
    useDeleteNotification();

  const isUnread = !notification.readAt;

  const handleClick = () => {
    if (isUnread) markAsRead(notification.id);
    if (notification.actionUrl) {
      // Handles both absolute and relative paths gracefully assuming standard router setup
      navigate(notification.actionUrl.replace(window.location.origin, ""));
    }
  };

  const handleMarkReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread) markAsRead(notification.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-all ${
        isUnread
          ? "border-[#1E2329] bg-[#151A20] hover:border-[#5BE584]/40"
          : "border-[#1E2329] bg-[#0D1117] hover:border-[#2A313A]"
      }`}
    >
      {isUnread && (
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-lg bg-[#5BE584]" />
      )}

      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
          isUnread
            ? "border-green-500/20 bg-green-500/10 text-[#5BE584]"
            : "border-[#1E2329] bg-[#090B0F] text-gray-500"
        }`}
      >
        {getIcon(notification.type)}
      </div>

      <div className="flex flex-1 flex-col gap-1 pr-14 sm:pr-20">
        <div className="flex items-start justify-between gap-2">
          <h4
            className={`text-sm font-semibold line-clamp-1 ${isUnread ? "text-gray-100" : "text-gray-300"}`}
          >
            {notification.title}
          </h4>
          <span className="shrink-0 text-[11px] font-medium text-gray-500">
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Action Buttons (Visible on hover on desktop) */}
      <div className="absolute right-3 top-3 flex opacity-0 transition-opacity group-hover:opacity-100 items-center gap-1 bg-[#0D1117]/90 backdrop-blur-sm rounded-md px-1 py-0.5">
        {isUnread && (
          <button
            onClick={handleMarkReadClick}
            disabled={isMarking}
            aria-label="Mark as read"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-[#1E2329] hover:text-[#5BE584]"
          >
            <Check className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          aria-label="Delete notification"
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
