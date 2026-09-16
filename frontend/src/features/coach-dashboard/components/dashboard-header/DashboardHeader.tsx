// src/features/coach-dashboard/components/dashboard-header/DashboardHeader.tsx
import React from "react";
import { Activity } from "lucide-react";

interface DashboardHeaderProps {
  generatedAt?: string | Date;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  generatedAt,
}) => {
  // Format the date to match the prototype's style: "Thursday, Oct 24 • Operational Shift 06:00 - 14:00"
  // Since we don't have shift data, we'll format the real generatedAt date elegantly.
  const formattedDate = generatedAt
    ? new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(generatedAt))
    : "Live Telemetry";

  return (
    <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold tracking-widest text-[#5BE584] uppercase">
            Command Overview
          </span>
          <span className="text-gray-600 text-[10px]">•</span>
          <span className="text-[10px] font-medium tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-[#5BE584] animate-pulse" />
            Telemetry Synced
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-gray-100">
          Coach Dashboard
        </h1>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <p>Everything that needs your attention today.</p>
          <span className="hidden md:inline-block text-gray-600">|</span>
          <p className="hidden md:inline-block font-medium text-gray-300">
            {formattedDate}
          </p>
        </div>
      </div>
    </div>
  );
};
