// src/features/coach-dashboard/components/quick-actions/QuickActionItem.tsx
import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface QuickActionItemProps {
  title: string;
  description: string;
  count: number;
  icon: LucideIcon;
  to: string;
}

export const QuickActionItem: React.FC<QuickActionItemProps> = ({
  title,
  description,
  count,
  icon: Icon,
  to,
}) => {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-4 transition-all hover:border-[#2a313a] hover:bg-white/[0.01]"
    >
      <div className="flex items-center gap-3.5 overflow-hidden">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#1e2329] bg-[#13171d] text-[#5BE584] transition-colors group-hover:border-[#5BE584]/30">
          <Icon className="h-4 w-4" />
        </div>
        <div className="flex flex-col overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200 truncate group-hover:text-white">
              {title}
            </span>
            <span className="inline-flex items-center justify-center rounded-full bg-[#16291d] px-2 py-0.5 font-mono text-[10px] font-bold text-[#5BE584] border border-[#23422e]">
              {count}
            </span>
          </div>
          <span className="text-xs text-gray-500 truncate mt-0.5">
            {description}
          </span>
        </div>
      </div>
      <div className="shrink-0 pl-3 text-gray-600 transition-transform group-hover:translate-x-1 group-hover:text-gray-300">
        <ArrowRight className="h-4 w-4" />
      </div>
    </Link>
  );
};
