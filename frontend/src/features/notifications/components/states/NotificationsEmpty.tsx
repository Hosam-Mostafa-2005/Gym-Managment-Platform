// src/features/notifications/components/states/NotificationsEmpty.tsx
import React from "react";
import { Bell } from "lucide-react";
import { useTranslation } from "react-i18next";

interface NotificationsEmptyProps {
  filter?: string;
}

export const NotificationsEmpty: React.FC<NotificationsEmptyProps> = ({
  filter,
}) => {
  const { t } = useTranslation("notifications");
  const isUnread = filter === "unread";

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-[#1E2329] bg-[#0D1117]">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#151A20] border border-[#1E2329]">
        <Bell className="h-5 w-5 text-gray-500" />
      </div>
      <h3 className="mb-1 text-sm font-semibold text-gray-100">
        {isUnread
          ? t("states.empty.unreadTitle")
          : t("states.empty.defaultTitle")}
      </h3>
      <p className="text-xs text-gray-500 max-w-sm">
        {isUnread
          ? t("states.empty.unreadDesc")
          : t("states.empty.defaultDesc")}
      </p>
    </div>
  );
};
