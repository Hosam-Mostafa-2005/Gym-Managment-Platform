// src/features/notifications/components/NotificationFilters.tsx
import React from "react";

interface NotificationFiltersProps {
  filter: "all" | "unread";
  onChange: (filter: "all" | "unread") => void;
}

export const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filter,
  onChange,
}) => {
  return (
    <div className="flex items-center gap-2 rounded-lg border border-[#1E2329] bg-[#0D1117] p-1.5 w-fit">
      <button
        onClick={() => onChange("all")}
        className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
          filter === "all"
            ? "bg-[#1E2329] text-gray-100"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
        }`}
      >
        All
      </button>
      <button
        onClick={() => onChange("unread")}
        className={`rounded-md px-4 py-1.5 text-xs font-semibold transition-colors ${
          filter === "unread"
            ? "bg-[#1E2329] text-gray-100"
            : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
        }`}
      >
        Unread
      </button>
    </div>
  );
};
