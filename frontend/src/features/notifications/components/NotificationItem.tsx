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
  RotateCcw,
  UserCheck,
  UserX,
  ShieldCheck,
  Lock,
  Trophy,
  Flame,
  Target,
  Sparkles,
  Calendar,
  Apple,
} from "lucide-react";
import type { Notification } from "../types/notifications.types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import { useMarkNotificationUnread } from "../hooks/use-mark-notification-unread";
import { useDeleteNotification } from "../hooks/use-delete-notification";

interface NotificationItemProps {
  notification: Notification;
}

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

const getNotificationIcon = (type: string, category: string) => {
  const normalizedType = type?.toUpperCase() || "";
  const normalizedCat = category?.toUpperCase() || "";

  if (normalizedType.includes("ACHIEVEMENT")) {
    return <Trophy className="h-4 w-4" />;
  }
  if (normalizedType.includes("STREAK")) {
    return <Flame className="h-4 w-4" />;
  }
  if (normalizedType.includes("GOAL")) {
    return <Target className="h-4 w-4" />;
  }
  if (normalizedType.includes("ENCOURAGEMENT")) {
    return <Sparkles className="h-4 w-4" />;
  }
  if (normalizedType.includes("APPOINTMENT")) {
    return <Calendar className="h-4 w-4" />;
  }
  if (normalizedType === "COACHING_INVITATION_RECEIVED" || normalizedType === "COACHING_INVITATION_ACCEPTED") {
    return <UserCheck className="h-4 w-4" />;
  }
  if (normalizedType === "COACHING_INVITATION_DECLINED" || normalizedType === "COACHING_RELATIONSHIP_TERMINATED") {
    return <UserX className="h-4 w-4" />;
  }
  if (normalizedType === "HISTORY_SHARING_GRANTED") {
    return <ShieldCheck className="h-4 w-4" />;
  }
  if (normalizedType === "HISTORY_SHARING_REVOKED") {
    return <Lock className="h-4 w-4" />;
  }
  if (normalizedCat === "NUTRITION") {
    return <Apple className="h-4 w-4" />;
  }
  if (normalizedCat === "WORKOUT" || normalizedType.includes("WORKOUT") || normalizedType.includes("SESSION")) {
    return <Dumbbell className="h-4 w-4" />;
  }
  if (normalizedType === "ASSIGNMENT" || normalizedType === "WORKOUT_ASSIGNED") {
    return <ClipboardList className="h-4 w-4" />;
  }
  if (normalizedType === "MEASUREMENT" || normalizedType === "BODY_MEASUREMENT_RECORDED") {
    return <Scale className="h-4 w-4" />;
  }
  if (normalizedCat === "SYSTEM") {
    return <Info className="h-4 w-4" />;
  }
  return <Bell className="h-4 w-4" />;
};

const getCategoryBadgeStyles = (category: string) => {
  switch (category?.toUpperCase()) {
    case "WORKOUT":
      return "bg-[#5BE584]/15 border-[#5BE584]/30 text-[#5BE584]";
    case "NUTRITION":
      return "bg-emerald-500/15 border-emerald-500/30 text-emerald-400";
    case "COACHING":
      return "bg-blue-500/15 border-blue-500/30 text-blue-400";
    case "ACHIEVEMENT":
      return "bg-yellow-500/15 border-yellow-500/30 text-yellow-400";
    default:
      return "bg-gray-800/80 border-gray-700 text-gray-400";
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
}) => {
  const navigate = useNavigate();
  const { mutate: markAsRead, isPending: isMarkingRead } =
    useMarkNotificationRead();
  const { mutate: markAsUnread, isPending: isMarkingUnread } =
    useMarkNotificationUnread();
  const { mutate: deleteNotification, isPending: isDeleting } =
    useDeleteNotification();

  const isUnread = !notification.readAt;
  const isHighPriority = notification.priority === "HIGH";

  const handleClick = () => {
    if (isUnread) markAsRead(notification.id);
    if (notification.actionUrl) {
      navigate(notification.actionUrl.replace(window.location.origin, ""));
    } else if (notification.type === "COACHING_INVITATION_RECEIVED") {
      navigate("/dashboard");
    } else if (notification.category === "ACHIEVEMENT") {
      navigate("/gamification");
    }
  };

  const handleToggleRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUnread) {
      markAsRead(notification.id);
    } else {
      markAsUnread(notification.id);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification(notification.id);
  };

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
        isUnread
          ? "border-[#1E2329] bg-[#151A20] hover:border-[#5BE584]/40"
          : "border-[#1E2329] bg-[#0D1117] hover:border-[#2A313A]"
      }`}
    >
      {/* Left green active indicator bar */}
      {isUnread && (
        <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-[#5BE584]" />
      )}

      {/* Type Icon */}
      <div
        className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
          isUnread
            ? "border-green-500/20 bg-green-500/10 text-[#5BE584]"
            : "border-[#1E2329] bg-[#090B0F] text-gray-500"
        }`}
      >
        {getNotificationIcon(notification.type, notification.category)}
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col gap-1 pr-14 sm:pr-20 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-semibold line-clamp-1 ${
                isUnread ? "text-gray-100" : "text-gray-300"
              }`}
            >
              {notification.title}
            </h4>
            {/* Category Pill */}
            {notification.category && (
              <span
                className={`rounded-full border px-2 py-0.2 text-[9px] font-bold tracking-wider uppercase ${getCategoryBadgeStyles(
                  notification.category,
                )}`}
              >
                {notification.category}
              </span>
            )}
            {/* High Priority Pill */}
            {isHighPriority && (
              <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.2 text-[9px] font-bold text-red-400">
                High Priority
              </span>
            )}
          </div>

          <span
            title={new Date(notification.createdAt).toLocaleString()}
            className="shrink-0 text-[11px] font-medium text-gray-500"
          >
            {formatTimeAgo(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-gray-400 line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Quick Action Buttons (visible on hover) */}
      <div className="absolute right-3 top-3 flex opacity-0 transition-opacity group-hover:opacity-100 items-center gap-1 bg-[#0D1117]/95 backdrop-blur-sm rounded-lg border border-[#1E2329] px-1 py-0.5">
        <button
          onClick={handleToggleRead}
          disabled={isMarkingRead || isMarkingUnread}
          title={isUnread ? "Mark as read" : "Mark as unread"}
          aria-label={isUnread ? "Mark as read" : "Mark as unread"}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-[#1E2329] hover:text-[#5BE584]"
        >
          {isUnread ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <RotateCcw className="h-3.5 w-3.5" />
          )}
        </button>

        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          title="Delete notification"
          aria-label="Delete notification"
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
