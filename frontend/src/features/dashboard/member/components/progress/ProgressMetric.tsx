// src/features/dashboard/member/components/progress/ProgressMetric.tsx
import React from "react";

interface ProgressMetricProps {
  label: string;
  value: number;
  max?: number;
  format?: "percentage" | "number";
}

export const ProgressMetric: React.FC<ProgressMetricProps> = ({
  label,
  value,
  max = 100,
  format = "percentage",
}) => {
  const displayValue = format === "percentage" ? `${value}%` : value.toString();
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-400">{label}</span>
        <span className="font-bold text-white">{displayValue}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#1E2329]">
        <div
          className="h-full rounded-full bg-[#5BE584] transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
