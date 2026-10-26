// src/features/dashboard/member/components/overview/OverviewCard.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";
import { InfoTooltip, type InfoTooltipProps } from "@/components/ui/info-tooltip";

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  highlight?: boolean;
  infoTooltip?: InfoTooltipProps;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  highlight = false,
  infoTooltip,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#1E2329] bg-[#0D1117] p-5 transition-all duration-200 hover:border-[#2A313A] hover:bg-[#101418]">
      <div className="flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate text-xs font-medium uppercase tracking-wider text-gray-400">
            {title}
          </span>
          {infoTooltip && <InfoTooltip {...infoTooltip} />}
        </div>
        <Icon
          className={`h-4 w-4 shrink-0 ${highlight ? "text-[#5BE584]" : "text-gray-500"}`}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white tabular-nums">{value}</span>
        {description && (
          <span className="text-xs font-medium text-gray-500">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
