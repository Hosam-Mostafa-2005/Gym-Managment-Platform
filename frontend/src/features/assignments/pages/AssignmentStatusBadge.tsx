import React from "react";
import { useTranslation } from "react-i18next";

export type AssignmentStatus = "Active" | "Completed" | "At Risk";

interface AssignmentStatusBadgeProps {
  status: AssignmentStatus | string;
}

export const AssignmentStatusBadge: React.FC<AssignmentStatusBadgeProps> = ({
  status,
}) => {
  const { t } = useTranslation(["assignments"]);

  switch (status) {
    case "Active":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          {t("status.active", "Active")}
        </span>
      );
    case "Completed":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
          ✓ {t("status.completed", "Completed")}
        </span>
      );
    case "At Risk":
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          {t("status.atRisk", "At Risk")}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-800 text-zinc-400">
          {status}
        </span>
      );
  }
};
