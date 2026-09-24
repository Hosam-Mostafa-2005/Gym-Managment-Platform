// src/features/notifications/components/states/NotificationsError.tsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface NotificationsErrorProps {
  message?: string;
  onRetry: () => void;
}

export const NotificationsError: React.FC<NotificationsErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center rounded-lg border border-red-500/20 bg-red-500/5">
      <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
      <h3 className="mb-1 text-sm font-semibold text-gray-100">
        Failed to load notifications
      </h3>
      <p className="mb-4 text-xs text-gray-400">
        {message ||
          "We encountered a problem while fetching your recent activity."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md bg-[#151A20] border border-[#1E2329] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.04] hover:text-white"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Try Again
      </button>
    </div>
  );
};
