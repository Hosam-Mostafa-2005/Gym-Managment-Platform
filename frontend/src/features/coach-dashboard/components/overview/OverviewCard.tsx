// src/features/coach-dashboard/components/overview/OverviewCard.tsx

import React from "react";
import type { LucideIcon } from "lucide-react";

export interface OverviewCardProps {
  title: string;
  value: string | number;
  secondaryValue?: string | number;
  secondaryLabel?: string;
  icon: LucideIcon;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  secondaryValue,
  secondaryLabel,
  icon: Icon,
}) => {
  return (
    <div
      className="
        group relative flex min-h-[145px] flex-col justify-between
        overflow-hidden rounded-xl
        border border-[#1e2329]
        bg-[#0d1014]
        p-5
        transition-all duration-200
        hover:-translate-y-0.5
        hover:border-[#2a313a]
        hover:bg-[#0f1318]
      "
    >
      {/* Accent Line */}
      <div
        className="
          absolute left-0 top-0 h-[2px] w-0
          bg-[#5BE584]
          transition-all duration-300
          group-hover:w-full
        "
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3
          className="
            max-w-[130px]
            text-[11px]
            font-semibold
            uppercase
            tracking-[0.12em]
            leading-relaxed
            text-gray-500
          "
        >
          {title}
        </h3>

        <div
          className="
            flex h-9 w-9 shrink-0 items-center justify-center
            rounded-lg
            border border-[#23422e]
            bg-[#16291d]
            transition-colors
            group-hover:border-[#315c3e]
          "
        >
          <Icon
            className="h-[17px] w-[17px] text-[#5BE584]"
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Value */}
      <div className="mt-6 flex items-baseline gap-2">
        <span
          className="
            text-3xl
            font-bold
            leading-none
            tracking-tight
            text-gray-100
            tabular-nums
          "
        >
          {value}
        </span>

        {secondaryValue !== undefined && (
          <span className="text-xs font-medium text-gray-600 tabular-nums">
            / {secondaryValue} {secondaryLabel}
          </span>
        )}
      </div>
    </div>
  );
};
