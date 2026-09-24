// src/features/profile/components/states/ProfileError.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

export interface ProfileErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const ProfileError: React.FC<ProfileErrorProps> = ({
  message,
  onRetry,
}) => {
  return (
    <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center p-6 bg-[#090B0F]">
      <div className="flex max-w-md flex-col items-center gap-4 rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
        <AlertCircle className="h-10 w-10 text-red-400" />
        <h2 className="text-lg font-semibold text-gray-100">
          Failed to load profile telemetry
        </h2>
        <p className="text-sm text-gray-400">
          {message ||
            "An unexpected error occurred while communicating with backend profile services."}
        </p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-2 rounded-md bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 px-4 py-2 text-xs font-semibold text-red-300 transition-colors"
          >
            Retry Connection
          </button>
        )}
      </div>
    </div>
  );
};
