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
    <div className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-4 transition-colors hover:border-[#2a313a]">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase line-clamp-1">
          {title}
        </h3>
        <Icon className="h-4 w-4 text-[#5BE584]/70" aria-hidden="true" />
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-bold text-gray-100 tabular-nums leading-none">
          {value}
        </span>
        {secondaryValue !== undefined && (
          <span className="text-[11px] font-medium text-gray-500 tabular-nums">
            of {secondaryValue} {secondaryLabel}
          </span>
        )}
      </div>
    </div>
  );
};
