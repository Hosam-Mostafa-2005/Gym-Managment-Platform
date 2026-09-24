// src/features/body-measurements/components/shared/MeasurementStatCard.tsx
import React from "react";

interface MeasurementStatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
}

export const MeasurementStatCard: React.FC<MeasurementStatCardProps> = ({
  label,
  value,
  unit,
  icon,
}) => (
  <div className="flex flex-col justify-between gap-3 rounded-lg border border-[#1E2329] bg-[#0D1117] p-5 transition-colors hover:border-[#2A313A]">
    <div className="flex items-center gap-2 text-gray-500">
      {icon && <span className="h-4 w-4">{icon}</span>}
      <span className="text-[10px] font-semibold uppercase tracking-wider">
        {label}
      </span>
    </div>
    <div className="flex items-baseline gap-1">
      <span className="font-mono text-2xl font-bold text-gray-100">
        {value}
      </span>
      {unit && <span className="text-xs text-gray-500">{unit}</span>}
    </div>
  </div>
);
