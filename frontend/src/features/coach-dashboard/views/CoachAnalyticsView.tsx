// src/features/coach-dashboard/views/CoachAnalyticsView.tsx
import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BarChart3, Users, ClipboardList } from "lucide-react";
import { useCoachDashboard } from "../hooks/use-coach-dashboard";
import { PerformanceTelemetry } from "../components/performance/PerformanceTelemetry";
import type { CoachDashboard } from "../types/coach-dashboard.types";

export const CoachAnalyticsView: React.FC = () => {
  const { t } = useTranslation(["coachDashboard"]);
  const contextData = useOutletContext<CoachDashboard | undefined>();
  const { data: queryData } = useCoachDashboard();

  const data = contextData || queryData;
  if (!data || !data.charts) return null;

  return (
    <div className="flex flex-col gap-6">
      {/* View Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#1E2329] bg-[#101418] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <BarChart3 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white">
              {t("analyticsView.title")}
            </h1>
            <p className="text-xs text-gray-400">
              {t("analyticsView.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/coach-dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:border-[#5BE584]/40 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t("analyticsView.returnToOverview")}</span>
          </Link>
          <Link
            to="/members"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <Users className="h-3.5 w-3.5 text-[#5BE584]" />
            <span>{t("analyticsView.athletesRoster")}</span>
          </Link>
        </div>
      </div>

      {/* Roster Telemetry Component (All 5 Team Analytics Charts) */}
      <PerformanceTelemetry charts={data.charts} />

      {/* Bottom Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E2329] bg-[#0D1014] p-4 text-xs text-gray-400">
        <span>{t("analyticsView.bottomPrompt")}</span>
        <div className="flex items-center gap-2">
          <Link
            to="/members"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <Users className="h-3.5 w-3.5 text-[#5BE584]" />
            <span>{t("analyticsView.manageAthletes")}</span>
          </Link>
          <Link
            to="/assignments"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <ClipboardList className="h-3.5 w-3.5 text-blue-400" />
            <span>{t("analyticsView.viewAllAssignments")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CoachAnalyticsView;
