// src/features/body-measurements/components/shared/MeasurementStatusBadge.tsx
import React from "react";

export const MeasurementStatusBadge: React.FC<{ isActive: boolean }> = ({
  isActive,
}) => {
  if (isActive) {
    return (
      <span className="inline-flex rounded border border-green-500/20 bg-green-500/10 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-green-400 uppercase">
        Active
      </span>
    );
  }
  return (
    <span className="inline-flex rounded border border-gray-700 bg-[#1E2329] px-2 py-0.5 text-[10px] font-semibold tracking-wider text-gray-400 uppercase">
      Inactive
    </span>
  );
};
