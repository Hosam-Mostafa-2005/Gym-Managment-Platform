// src/features/member-insights/components/states/InsightsLoading.tsx

import React from "react";

export const InsightsLoading: React.FC = () => {
  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-8 pb-20 animate-pulse">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        <div className="h-20 w-full border-b border-[#1E2329]" />

        {/* KPI Skeleton */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-lg border border-[#1E2329] bg-[#0D1014]"
            />
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 rounded-xl border border-[#1E2329] bg-[#0D1014]" />
          <div className="h-80 rounded-xl border border-[#1E2329] bg-[#0D1014]" />
        </div>

        {/* Performance & Timeline Skeleton */}
        <div className="h-40 rounded-xl border border-[#1E2329] bg-[#0D1014]" />
        <div className="h-80 rounded-xl border border-[#1E2329] bg-[#0D1014]" />
      </div>
    </div>
  );
};
