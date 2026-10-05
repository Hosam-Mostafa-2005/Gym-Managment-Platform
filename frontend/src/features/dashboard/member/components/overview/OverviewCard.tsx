// src/features/dashboard/member/components/overview/OverviewCard.tsx
import React from "react";
import type { LucideIcon } from "lucide-react";

interface OverviewCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  highlight?: boolean;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({
  title,
  value,
  icon: Icon,
  description,
  highlight = false,
}) => {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-[#1E2329] bg-[#0D1117] p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
          {title}
        </span>
        <Icon
          className={`h-4 w-4 ${highlight ? "text-[#5BE584]" : "text-gray-500"}`}
        />
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        {description && (
          <span className="text-xs font-medium text-gray-500">
            {description}
          </span>
        )}
      </div>
    </div>
  );
};
