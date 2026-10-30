// src/features/body-measurements/components/states/MeasurementsError.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

export const MeasurementsError: React.FC<{
  message?: string;
  onRetry: () => void;
}> = ({ message, onRetry }) => {
  const { t } = useTranslation("bodyMeasurements");

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center p-6 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
      <h2 className="mb-2 text-lg font-semibold text-gray-100">
        {t("states.errorTitle")}
      </h2>
      <p className="mb-6 text-sm text-gray-400">
        {message || t("states.errorDefault")}
      </p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-[#1E2329] px-4 py-2 text-sm font-medium text-gray-100 hover:bg-[#2A313A] transition-colors"
      >
        {t("states.tryAgain")}
      </button>
    </div>
  );
};
