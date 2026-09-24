// src/features/member-profile/components/states/MemberProfileLoading.tsx

import React from "react";

export const MemberProfileLoading: React.FC = () => {
  return (
    <div className="min-h-full w-full p-4 md:p-6 lg:p-8 pb-20 animate-pulse">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
        {/* Header Skeleton */}
        <div className="flex h-32 w-full items-center gap-6 rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
          <div className="h-16 w-16 shrink-0 rounded-full bg-[#1E2329]" />
          <div className="flex flex-col gap-3">
            <div className="h-6 w-48 rounded-md bg-[#1E2329]" />
            <div className="h-4 w-32 rounded-md bg-[#1E2329]" />
          </div>
        </div>

        {/* Overview Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="h-64 rounded-xl border border-[#1E2329] bg-[#0D1117] lg:col-span-5" />
          <div className="h-64 rounded-xl border border-[#1E2329] bg-[#0D1117] lg:col-span-4" />
          <div className="h-64 rounded-xl border border-[#1E2329] bg-[#0D1117] lg:col-span-3" />
        </div>

        {/* History Tables Skeletons */}
        <div className="h-80 rounded-xl border border-[#1E2329] bg-[#0D1117]" />
        <div className="h-80 rounded-xl border border-[#1E2329] bg-[#0D1117]" />
      </div>
    </div>
  );
};
