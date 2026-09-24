// src/features/profile/components/states/ProfileLoading.tsx
import React from "react";

export const ProfileLoading: React.FC = () => {
  return (
    <div
      className="min-h-full w-full p-4 md:p-6 lg:p-8 flex flex-col gap-6 animate-pulse"
      aria-label="Loading Profile"
    >
      {/* Header Skeleton */}
      <div className="flex flex-col gap-6 rounded-lg border border-[#1e2329] bg-[#0d1014] p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 shrink-0 rounded-xl bg-[#16291d] border border-[#23422e]" />
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-3">
                <div className="h-5 w-48 rounded bg-[#1e2329]" />
                <div className="h-4 w-20 rounded bg-[#16291d]" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-28 rounded bg-[#1e2329]" />
                <div className="h-3 w-3 rounded-full bg-[#1e2329]" />
                <div className="h-3 w-36 rounded bg-[#1e2329]" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-8 w-24 rounded bg-[#1e2329]" />
            <div className="h-8 w-36 rounded bg-[#13171d] border border-[#1e2329]" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[#1e2329] pt-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="h-3 w-20 rounded bg-[#1e2329]" />
              <div className="h-5 w-16 rounded bg-[#13171d]" />
            </div>
          ))}
        </div>
      </div>

      {/* Grid Cards Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col justify-between rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 h-24"
          >
            <div className="h-3 w-24 rounded bg-[#1e2329]" />
            <div className="h-6 w-12 rounded bg-[#13171d]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-lg border border-[#1e2329] bg-[#0d1014] p-6 h-64" />
        <div className="rounded-lg border border-[#1e2329] bg-[#0d1014] p-6 h-64" />
      </div>
    </div>
  );
};
