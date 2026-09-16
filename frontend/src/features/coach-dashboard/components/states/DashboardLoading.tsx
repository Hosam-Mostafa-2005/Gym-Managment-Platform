// src/features/coach-dashboard/components/states/DashboardLoading.tsx
import React from "react";
import { Loader2 } from "lucide-react";

export const DashboardLoading: React.FC = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center bg-[#090B0F]">
      <div className="flex flex-col items-center gap-3 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
        <p className="text-sm font-medium tracking-wide text-gray-300">
          Synchronizing command telemetry...
        </p>
      </div>
    </div>
  );
};
