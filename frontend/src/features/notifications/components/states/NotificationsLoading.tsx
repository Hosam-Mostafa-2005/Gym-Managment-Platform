// src/features/notifications/components/states/NotificationsLoading.tsx
import React from "react";

export const NotificationsLoading: React.FC = () => {
  return (
    <div className="flex w-full flex-col gap-3 animate-pulse">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-lg border border-[#1E2329] bg-[#0D1117] p-4"
        >
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#1E2329]" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="h-4 w-1/4 rounded bg-[#1E2329]" />
            <div className="h-3 w-3/4 rounded bg-[#151A20]" />
            <div className="mt-1 h-2 w-16 rounded bg-[#151A20]" />
          </div>
        </div>
      ))}
    </div>
  );
};
