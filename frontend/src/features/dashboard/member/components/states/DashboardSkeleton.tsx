// src/features/dashboard/member/components/states/DashboardSkeleton.tsx
import React from "react";

export const DashboardSkeleton: React.FC = () => {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-6 p-4 md:p-6 lg:p-8 animate-pulse">
      <div className="flex flex-col gap-2 pb-2">
        <div className="h-8 w-48 rounded-md bg-[#1E2329]" />
        <div className="h-4 w-64 rounded-md bg-[#1E2329]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-xl bg-[#0D1117] border border-[#1E2329]"
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <div className="h-48 rounded-xl bg-[#0D1117] border border-[#1E2329]" />
          <div className="h-80 rounded-xl bg-[#0D1117] border border-[#1E2329]" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="h-64 rounded-xl bg-[#0D1117] border border-[#1E2329]" />
          <div className="h-96 rounded-xl bg-[#0D1117] border border-[#1E2329]" />
        </div>
      </div>
    </main>
  );
};
