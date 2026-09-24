// src/features/body-measurements/components/states/MeasurementsEmpty.tsx
import React from "react";
import { Ruler } from "lucide-react";

export const MeasurementsEmpty: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-[#1E2329] bg-[#0D1117]">
    <Ruler className="mb-3 h-8 w-8 text-gray-500" />
    <h3 className="mb-1 text-sm font-medium text-gray-300">
      No measurements yet
    </h3>
    <p className="text-xs text-gray-500">
      This member does not have any recorded body measurements.
    </p>
  </div>
);
