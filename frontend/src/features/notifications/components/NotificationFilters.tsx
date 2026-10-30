// src/features/notifications/components/NotificationFilters.tsx

import React from "react";
import {
  Bell,
  Dumbbell,
  Utensils,
  Users,
  Trophy,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import type { NotificationCategory } from "../types/notifications.types";

interface NotificationFiltersProps {
  category: NotificationCategory | "ALL";
  onCategoryChange: (category: NotificationCategory | "ALL") => void;
  status: "all" | "unread" | "read";
  onStatusChange: (status: "all" | "unread" | "read") => void;
  search: string;
  onSearchChange: (search: string) => void;
  categoryUnreadCounts?: Record<string, number>;
  totalUnread?: number;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  category,
  onCategoryChange,
  status,
  onStatusChange,
  search,
  onSearchChange,
  categoryUnreadCounts = {},
  totalUnread = 0,
}) => {
  const { t } = useTranslation("notifications");

  const CATEGORIES: {
    id: NotificationCategory | "ALL";
    label: string;
    icon: React.ElementType;
    unreadCount: number;
  }[] = [
    {
      id: "ALL",
      label: t("filters.categories.ALL"),
      icon: Bell,
      unreadCount: totalUnread,
    },
    {
      id: "WORKOUT",
      label: t("filters.categories.WORKOUT"),
      icon: Dumbbell,
      unreadCount: categoryUnreadCounts["WORKOUT"] || 0,
    },
    {
      id: "NUTRITION",
      label: t("filters.categories.NUTRITION"),
      icon: Utensils,
      unreadCount: categoryUnreadCounts["NUTRITION"] || 0,
    },
    {
      id: "COACHING",
      label: t("filters.categories.COACHING"),
      icon: Users,
      unreadCount: categoryUnreadCounts["COACHING"] || 0,
    },
    {
      id: "ACHIEVEMENT",
      label: t("filters.categories.ACHIEVEMENT"),
      icon: Trophy,
      unreadCount: categoryUnreadCounts["ACHIEVEMENT"] || 0,
    },
    {
      id: "SYSTEM",
      label: t("filters.categories.SYSTEM"),
      icon: ShieldCheck,
      unreadCount: categoryUnreadCounts["SYSTEM"] || 0,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      {/* Search and Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("filters.searchPlaceholder")}
            className="w-full rounded-xl border border-[#1E2329] bg-[#0D1117] pl-9 pr-9 rtl:pl-9 rtl:pr-9 py-2 text-xs text-gray-200 placeholder-gray-500 focus:border-[#5BE584] focus:outline-none focus:ring-1 focus:ring-[#5BE584]"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              aria-label={t("filters.clearSearch")}
              className="absolute right-2.5 rtl:right-auto rtl:left-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Read / Unread Status Filter */}
        <div className="flex items-center gap-1 rounded-xl border border-[#1E2329] bg-[#0D1117] p-1 self-start sm:self-auto">
          <button
            onClick={() => onStatusChange("all")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === "all"
                ? "bg-[#1E2329] text-gray-100"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("filters.all")}
          </button>
          <button
            onClick={() => onStatusChange("unread")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === "unread"
                ? "bg-[#1E2329] text-[#5BE584]"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("filters.unread")}
          </button>
          <button
            onClick={() => onStatusChange("read")}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              status === "read"
                ? "bg-[#1E2329] text-gray-100"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {t("filters.read")}
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = category === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? "border-[#5BE584]/40 bg-[#161B22] text-[#5BE584] shadow-sm"
                  : "border-[#1E2329] bg-[#0D1117] text-gray-400 hover:border-gray-700 hover:text-gray-200"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{cat.label}</span>
              {cat.unreadCount > 0 && (
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    isActive
                      ? "bg-[#5BE584]/20 text-[#5BE584]"
                      : "bg-[#1E2329] text-gray-400"
                  }`}
                >
                  {cat.unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
