// src/features/member-insights/components/shared/InsightStatCard.tsx

import React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface InsightStatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    suffix?: string;
  };
}

export const InsightStatCard: React.FC<InsightStatCardProps> = ({
  label,
  value,
  description,
  icon,
  trend,
}) => {
  const renderTrend = () => {
    if (!trend) return null;
    const isPositive = trend.value > 0;
    const isNegative = trend.value < 0;
    const isNeutral = trend.value === 0;

    const formattedValue = `${trend.value > 0 ? "+" : ""}${trend.value}${trend.suffix || ""}`;

    return (
      <div className="flex items-center gap-1 text-xs font-medium text-gray-400">
        {isPositive && <TrendingUp className="h-3 w-3" />}
        {isNegative && <TrendingDown className="h-3 w-3" />}
        {isNeutral && <Minus className="h-3 w-3" />}
        <span>{formattedValue}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col justify-between rounded-lg border border-[#1E2329] bg-[#0D1014] p-5">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="text-gray-500">{icon}</div>}
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase">
            {label}
          </span>
        </div>
        {renderTrend()}
      </div>
      <div className="flex flex-col">
        <span className="font-mono text-2xl font-bold text-gray-100">
          {value}
        </span>
        {description && (
          <span className="mt-1 text-xs text-gray-500">{description}</span>
        )}
      </div>
    </div>
  );
};
