// src/features/body-measurements/components/states/MeasurementsError.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

export const MeasurementsError: React.FC<{
  message?: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => (
  <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
    <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
    <h2 className="mb-2 text-lg font-semibold text-gray-100">
      Unable to load body measurements
    </h2>
    <p className="mb-6 text-sm text-gray-400">
      {message || "An unexpected error occurred."}
    </p>
    <button
      onClick={onRetry}
      className="rounded-lg bg-[#1E2329] px-4 py-2 text-sm font-medium text-gray-100 hover:bg-[#2A313A]"
    >
      Try Again
    </button>
  </div>
);
