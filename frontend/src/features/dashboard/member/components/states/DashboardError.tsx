// src/features/dashboard/member/components/states/DashboardError.tsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  onRetry: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({ onRetry }) => {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center p-4 md:p-6 lg:p-8 min-h-[60vh]">
      <div className="flex flex-col items-center text-center rounded-xl border border-red-500/20 bg-[#0D1117] p-12 max-w-md">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-lg font-bold text-white mb-2">
          Unable to Load Dashboard
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          We encountered a problem while retrieving your dashboard data. Please
          try again.
        </p>
        <button
          onClick={onRetry}
          className="flex items-center gap-2 rounded-md bg-[#1E2329] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2c333c]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </main>
  );
};
