// src/features/member-insights/components/states/InsightsError.tsx

import React from "react";
import { AlertCircle } from "lucide-react";

interface InsightsErrorProps {
  message?: string;
  onRetry: () => void;
}

export const InsightsError: React.FC<InsightsErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1014] p-8">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-lg font-semibold text-gray-100">
          Unable to load member insights
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          {message ||
            "We encountered an unexpected error while retrieving the analytics."}
        </p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-[#1E2329] px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-[#2A313A]"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};
