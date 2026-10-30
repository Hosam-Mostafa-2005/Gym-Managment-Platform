// src/features/member-profile/components/states/MemberProfileError.tsx
import React from "react";
import { AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";

interface MemberProfileErrorProps {
  message?: string;
  onRetry: () => void;
}

export const MemberProfileError: React.FC<MemberProfileErrorProps> = ({
  message,
  onRetry,
}) => {
  const { t } = useTranslation(["profile"]);

  return (
    <div className="flex min-h-[50vh] w-full flex-col items-center justify-center p-6">
      <div className="flex max-w-md flex-col items-center text-center rounded-xl border border-[#1E2329] bg-[#0D1117] p-8">
        <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
        <h2 className="mb-2 text-lg font-semibold text-gray-100">
          {t("rosterMemberView.states.errorTitle")}
        </h2>
        <p className="mb-6 text-sm text-gray-400">
          {message || t("rosterMemberView.states.errorDefault")}
        </p>
        <button
          onClick={onRetry}
          className="rounded-lg bg-[#1E2329] px-4 py-2 text-sm font-medium text-gray-100 transition-colors hover:bg-[#2A313A]"
        >
          {t("rosterMemberView.states.retry")}
        </button>
      </div>
    </div>
  );
};

export default MemberProfileError;
