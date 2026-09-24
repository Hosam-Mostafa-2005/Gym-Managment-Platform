// src/features/members-management/components/states/MembersLoading.tsx
import React from "react";

export const MembersLoading: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 h-[240px]"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-[#16291d] border border-[#23422e]" />
            <div className="flex flex-col gap-2 flex-1">
              <div className="h-4 w-1/2 rounded bg-[#1e2329]" />
              <div className="h-3 w-1/3 rounded bg-[#13171d]" />
            </div>
            <div className="h-5 w-16 rounded bg-[#13171d]" />
          </div>
          <div className="border-t border-[#1e2329] pt-4 flex-1">
            <div className="h-3 w-1/4 rounded bg-[#1e2329] mb-2" />
            <div className="h-4 w-3/4 rounded bg-[#13171d]" />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="h-8 rounded bg-[#13171d]" />
            <div className="h-8 rounded bg-[#13171d]" />
          </div>
        </div>
      ))}
    </div>
  );
};
