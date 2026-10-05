// src/features/dashboard/member/components/header/DashboardHeader.tsx
import React from "react";
import { Activity } from "lucide-react";

export const DashboardHeader: React.FC = () => {
  return (
    <header className="flex flex-col gap-1 pb-2">
      <div className="flex items-center gap-2">
        <Activity className="h-6 w-6 text-[#5BE584]" />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Dashboard
        </h1>
      </div>
      <p className="text-sm text-gray-400">
        Track your training, progress, and performance.
      </p>
    </header>
  );
};
