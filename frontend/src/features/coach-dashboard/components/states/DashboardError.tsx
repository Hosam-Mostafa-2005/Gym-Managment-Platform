// src/features/coach-dashboard/components/states/DashboardError.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, RefreshCw } from "lucide-react";

interface DashboardErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const DashboardError: React.FC<DashboardErrorProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation(["coachDashboard"]);

  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center rounded-xl border border-red-500/20 bg-[#161B22]/50 p-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-white">
        {t("states.errorTitle")}
      </h3>
      <p className="mt-1 max-w-md text-xs text-gray-400">
        {message || t("states.errorSubtitle")}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1E2329] border border-gray-700 px-4 py-2 text-xs font-semibold text-white transition hover:bg-gray-700"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>{t("states.retry")}</span>
        </button>
      )}
    </div>
  );
};
