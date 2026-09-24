// src/features/body-measurements/components/states/MeasurementsLoading.tsx
import React from "react";

export const MeasurementsLoading: React.FC = () => (
  <div className="min-h-full w-full p-4 md:p-6 lg:p-8 pb-20 animate-pulse">
    <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <div className="h-16 w-full border-b border-[#1E2329]" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mt-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-lg bg-[#0D1117] border border-[#1E2329]"
          />
        ))}
      </div>
      <div className="h-64 w-full rounded-xl bg-[#0D1117] border border-[#1E2329] mt-6" />
    </div>
  </div>
);
