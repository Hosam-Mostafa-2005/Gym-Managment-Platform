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
import { useTranslation } from "react-i18next";
import type { Notification } from "../types/notifications.types";
import { useMarkNotificationRead } from "../hooks/use-mark-notification-read";
import { useMarkNotificationUnread } from "../hooks/use-mark-notification-unread";
import { useDeleteNotification } from "../hooks/use-delete-notification";
import {
  localizeNotification,
  formatNotificationTimeAgo,
} from "../utils/notification-localization";

interface NotificationItemProps {
  notification: Notification;
}

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
  if (
    normalizedType === "COACHING_INVITATION_RECEIVED" ||
    normalizedType === "COACHING_INVITATION_ACCEPTED"
  ) {
    return <UserCheck className="h-4 w-4" />;
  }
  if (
    normalizedType === "COACHING_INVITATION_DECLINED" ||
    normalizedType === "COACHING_RELATIONSHIP_TERMINATED"
  ) {
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
  if (
    normalizedCat === "WORKOUT" ||
    normalizedType.includes("WORKOUT") ||
    normalizedType.includes("SESSION")
  ) {
    return <Dumbbell className="h-4 w-4" />;
  }
  if (normalizedType === "ASSIGNMENT" || normalizedType === "WORKOUT_ASSIGNED") {
    return <ClipboardList className="h-4 w-4" />;
  }
  if (
    normalizedType === "MEASUREMENT" ||
    normalizedType === "BODY_MEASUREMENT_RECORDED"
  ) {
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
  const { t, i18n } = useTranslation("notifications");
  const navigate = useNavigate();
  const { mutate: markAsRead, isPending: isMarkingRead } =
    useMarkNotificationRead();
  const { mutate: markAsUnread, isPending: isMarkingUnread } =
    useMarkNotificationUnread();
  const { mutate: deleteNotification, isPending: isDeleting } =
    useDeleteNotification();

  const isUnread = !notification.readAt;
  const isHighPriority = notification.priority === "HIGH";

  const { title: localizedTitle, message: localizedMessage } =
    localizeNotification(notification, t, i18n.language);

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

  const categoryLabel = notification.category
    ? (t(`filters.categories.${notification.category}` as any, {
        defaultValue: notification.category,
      }) as string)
    : "";

  return (
    <div
      onClick={handleClick}
      className={`group relative flex cursor-pointer items-start gap-4 rounded-xl border p-4 transition-all ${
        isUnread
          ? "border-[#1E2329] bg-[#151A20] hover:border-[#5BE584]/40"
          : "border-[#1E2329] bg-[#0D1117] hover:border-[#2A313A]"
      }`}
    >
      {/* Left green active indicator bar (mirrored in RTL) */}
      {isUnread && (
        <div className="absolute left-0 rtl:left-auto rtl:right-0 top-0 h-full w-1 rounded-l-xl rtl:rounded-l-none rtl:rounded-r-xl bg-[#5BE584]" />
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
      <div className="flex flex-1 flex-col gap-1 pr-16 rtl:pr-0 rtl:pl-16 sm:pr-20 sm:rtl:pr-0 sm:rtl:pl-20 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h4
              className={`text-sm font-semibold line-clamp-1 ${
                isUnread ? "text-gray-100" : "text-gray-300"
              }`}
            >
              {localizedTitle}
            </h4>
            {/* Category Pill */}
            {notification.category && (
              <span
                className={`rounded-full border px-2 py-0.2 text-[9px] font-bold tracking-wider uppercase ${getCategoryBadgeStyles(
                  notification.category,
                )}`}
              >
                {categoryLabel}
              </span>
            )}
            {/* High Priority Pill */}
            {isHighPriority && (
              <span className="rounded-full border border-red-500/30 bg-red-500/15 px-2 py-0.2 text-[9px] font-bold text-red-400">
                {t("item.highPriority")}
              </span>
            )}
          </div>

          <span
            title={new Date(notification.createdAt).toLocaleString()}
            className="shrink-0 text-[11px] font-medium text-gray-500"
          >
            {formatNotificationTimeAgo(
              notification.createdAt,
              t,
              i18n.language,
            )}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-gray-400 line-clamp-2 break-words">
          {localizedMessage}
        </p>
      </div>

      {/* Quick Action Buttons (visible on hover / RTL mirrored) */}
      <div className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-2.5 sm:right-3 sm:rtl:right-auto sm:rtl:left-3 sm:top-3 flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity items-center gap-1 bg-[#0D1117]/95 backdrop-blur-sm rounded-lg border border-[#1E2329] px-1 py-0.5 shadow-sm">
        <button
          onClick={handleToggleRead}
          disabled={isMarkingRead || isMarkingUnread}
          title={isUnread ? t("item.markRead") : t("item.markUnread")}
          aria-label={isUnread ? t("item.markRead") : t("item.markUnread")}
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
          title={t("item.delete")}
          aria-label={t("item.delete")}
          className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
