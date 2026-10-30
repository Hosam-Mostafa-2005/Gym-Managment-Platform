// src/features/dashboard/member/components/ProgressSnapshot.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { TrendingUp, Scale, History, ArrowRight } from "lucide-react";
import type {
  MemberDashboardOverview,
  WorkoutVolumeDaily,
  WorkoutVolumeMonthly,
} from "../../types/dashboard.types";

interface ProgressSnapshotProps {
  overview: MemberDashboardOverview;
  volumeLast30Days?: WorkoutVolumeDaily[];
  volumeLast12Months?: WorkoutVolumeMonthly[];
  onOpenAnalytics?: () => void;
}

export const ProgressSnapshot: React.FC<ProgressSnapshotProps> = ({
  overview,
  volumeLast30Days = [],
  volumeLast12Months = [],
  onOpenAnalytics,
}) => {
  const { t } = useTranslation(["dashboard"]);
  const navigate = useNavigate();
  const [range, setRange] = useState<"30D" | "12M">("30D");

  const chartData =
    range === "30D"
      ? volumeLast30Days.map((d) => ({ label: d.date, volume: d.volume }))
      : volumeLast12Months.map((m) => ({ label: m.month, volume: m.volume }));

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      {/* Header with Title and Range Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1E2329] pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {t("member.progressSnapshot.title")}
            </h2>
            <p className="text-xs text-gray-400">
              {t("member.progressSnapshot.subtitle")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-[#1E2329] bg-[#0D1014] p-1">
            <button
              type="button"
              onClick={() => setRange("30D")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                range === "30D"
                  ? "bg-[#1E2329] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t("member.progressSnapshot.range30D")}
            </button>
            <button
              type="button"
              onClick={() => setRange("12M")}
              className={`rounded px-2.5 py-1 text-xs font-medium transition ${
                range === "12M"
                  ? "bg-[#1E2329] text-white"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {t("member.progressSnapshot.range12M")}
            </button>
          </div>

          <button
            type="button"
            onClick={() => navigate("/measurements")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            <Scale className="h-3.5 w-3.5 text-emerald-400" />
            <span>{t("member.progressSnapshot.measurements")}</span>
          </button>

          <button
            type="button"
            onClick={() => navigate("/workout-sessions")}
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-1.5 text-xs font-medium text-gray-300 transition hover:border-gray-500 hover:text-white"
          >
            <History className="h-3.5 w-3.5 text-blue-400" />
            <span>{t("member.progressSnapshot.history")}</span>
          </button>
        </div>
      </div>

      {/* Main Content: Chart + Metrics */}
      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-4">
        {/* Compact Volume Chart */}
        <div className="lg:col-span-3">
          <div className="h-52 w-full">
            {chartData && chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <XAxis
                    dataKey="label"
                    stroke="#4B5563"
                    fontSize={11}
                    tickLine={false}
                    interval={range === "30D" ? 6 : 1}
                  />
                  <YAxis
                    stroke="#4B5563"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#161B22",
                      borderColor: "#30363D",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: "#fff",
                    }}
                    formatter={(value: any) => [
                      `${Number(value).toLocaleString()} kg`,
                      t("member.progressSnapshot.volumeTooltip"),
                    ]}
                  />
                  <Bar dataKey="volume" fill="#5BE584" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-xs text-gray-500">
                {t("member.progressSnapshot.noVolumeData")}
              </div>
            )}
          </div>
        </div>

        {/* Supporting KPI Metrics Sidecar */}
        <div className="flex flex-col justify-between gap-3 border-t border-[#1E2329] pt-4 lg:border-t-0 lg:border-l lg:pl-6 lg:pt-0 rtl:lg:border-l-0 rtl:lg:border-r rtl:lg:pl-0 rtl:lg:pr-6">
          <div>
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              {t("member.progressSnapshot.avgDuration")}
            </span>
            <div className="mt-1 text-lg font-bold text-white">
              {t("member.progressSnapshot.mins", {
                count: overview.averageWorkoutDuration ?? 0,
              })}
            </div>
            <p className="text-[11px] text-gray-500">
              {t("member.progressSnapshot.avgDurationSubtitle")}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              {t("member.progressSnapshot.avgVolume")}
            </span>
            <div className="mt-1 text-lg font-bold text-white">
              {overview.averageVolumePerWorkout?.toLocaleString() ?? 0} kg
            </div>
            <p className="text-[11px] text-gray-500">
              {t("member.progressSnapshot.avgVolumeSubtitle")}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase">
              {t("member.progressSnapshot.completionRate")}
            </span>
            <div className="mt-1 text-lg font-bold text-[#5BE584]">
              {overview.completionRate ?? 0}%
            </div>
            <p className="text-[11px] text-gray-500">
              {t("member.progressSnapshot.completionRateSubtitle")}
            </p>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (onOpenAnalytics) {
                  onOpenAnalytics();
                } else {
                  navigate("/measurements");
                }
              }}
              className="inline-flex w-full items-center justify-between rounded-lg border border-[#1E2329] bg-[#161B22] px-3 py-2 text-xs font-medium text-gray-300 hover:border-[#5BE584]/40 hover:text-white transition"
            >
              <span>{t("member.progressSnapshot.viewFullAnalytics")}</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#5BE584] rtl:rotate-180" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
