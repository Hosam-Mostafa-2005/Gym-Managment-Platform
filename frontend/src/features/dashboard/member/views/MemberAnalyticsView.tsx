// src/features/dashboard/member/views/MemberAnalyticsView.tsx
import React from "react";
import { Link, useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, BarChart3, Scale, History } from "lucide-react";
import { useMemberDashboard } from "../../hooks/use-dashboard";
import { WorkoutActivity } from "../components/activity/WorkoutActivity";
import { SessionDuration } from "../components/analytics/SessionDuration";
import { SessionStatusDistribution } from "../components/analytics/SessionStatusDistribution";
import { ProgressChart } from "../components/analytics/ProgressChart";
import { WorkoutFrequency } from "../components/analytics/WorkoutFrequency";
import { PerformanceTelemetry } from "../components/analytics/PerformanceTelemetry";
import type { MemberDashboardData } from "../../types/dashboard.types";

export const MemberAnalyticsView: React.FC = () => {
  const { t } = useTranslation(["dashboard"]);
  const contextData = useOutletContext<MemberDashboardData | undefined>();
  const { data: queryData } = useMemberDashboard();

  const data = contextData || queryData;
  if (!data || !data.charts) return null;

  const { charts, trends } = data;

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
              {t("member.analyticsView.title")}
            </h1>
            <p className="text-xs text-gray-400">
              {t("member.analyticsView.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white hover:border-[#5BE584]/40 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-180" />
            <span>{t("member.analyticsView.returnToOverview")}</span>
          </Link>
        </div>
      </div>

      {/* 1. Full Volume Activity Chart (30D vs 12M toggle) */}
      <WorkoutActivity
        last30Days={charts.workoutVolumeLast30Days}
        last12Months={charts.workoutVolumeLast12Months}
      />

      {/* 2. Operational Metrics: Duration Trend & Status Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SessionDuration trend={charts.sessionDurationTrend} />
        <SessionStatusDistribution data={charts.sessionStatusDistribution} />
      </div>

      {/* 3. Output Telemetry: Weekly Sets/Exercises & Frequency Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProgressChart
          exercises={charts.exercisesCompletedPerWeek}
          sets={charts.setsCompletedPerWeek}
        />
        <WorkoutFrequency
          byWeekday={charts.workoutFrequencyByWeekday}
          byHour={charts.workoutFrequencyByHour}
        />
      </div>

      {/* 4. Trends & Milestones Telemetry */}
      <PerformanceTelemetry trends={trends} />

      {/* Bottom Navigation Links */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#1E2329] bg-[#0D1014] p-4 text-xs text-gray-400">
        <span>{t("member.analyticsView.bottomPrompt")}</span>
        <div className="flex items-center gap-2">
          <Link
            to="/sessions"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            <span>{t("member.analyticsView.fullWorkoutHistory")}</span>
          </Link>
          <Link
            to="/measurements"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#101418] px-3 py-1.5 text-xs font-medium text-gray-300 hover:text-white transition"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("member.analyticsView.bodyMeasurements")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MemberAnalyticsView;
