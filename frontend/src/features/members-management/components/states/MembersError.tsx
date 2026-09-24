// src/features/members-management/components/states/MembersError.tsx
import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

interface MembersErrorProps {
  message?: string;
  onRetry: () => void;
}

export const MembersError: React.FC<MembersErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-lg border border-red-500/20 bg-red-500/5 mt-6">
      <AlertCircle className="h-8 w-8 text-red-400 mb-3" />
      <h3 className="text-sm font-semibold text-gray-100">
        Failed to load members
      </h3>
      <p className="text-xs text-gray-400 mt-1 mb-4">
        {message ||
          "An unexpected error occurred while communicating with the server."}
      </p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-md bg-[#13171d] border border-[#1e2329] px-4 py-2 text-xs font-medium text-gray-300 transition-colors hover:bg-white/[0.03] hover:text-white"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        Retry Connection
      </button>
    </div>
  );
};
