// src/features/profile/components/coach/CoachCharts.tsx
import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { useTranslation } from "react-i18next";
import type { CoachCharts as ChartsType } from "../../types/profile.types";

interface CoachChartsProps {
  charts: ChartsType;
}

export const CoachCharts: React.FC<CoachChartsProps> = ({ charts }) => {
  const { t } = useTranslation(["profile"]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Workout Sessions Chart */}
      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-100">
            {t("coach.charts.sessions30D")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("coach.charts.sessions30DSubtitle")}
          </p>
        </div>
        <div className="h-48 w-full">
          {charts?.sessionsLast30Days?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={charts.sessionsLast30Days}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2329"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1014",
                    borderColor: "#1e2329",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    color: "#f3f4f6",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#5BE584"
                  strokeWidth={2}
                  fill="#5BE584"
                  fillOpacity={0.15}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              {t("coach.charts.noData")}
            </div>
          )}
        </div>
      </div>

      {/* Member Growth Chart */}
      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-100">
            {t("coach.charts.memberGrowth6M")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("coach.charts.memberGrowth6MSubtitle")}
          </p>
        </div>
        <div className="h-48 w-full">
          {charts?.membersGrowth?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={charts.membersGrowth}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2329"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1014",
                    borderColor: "#1e2329",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    color: "#f3f4f6",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#5BE584"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              {t("coach.charts.noData")}
            </div>
          )}
        </div>
      </div>

      {/* Completion Rate Trend Chart */}
      <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-100">
            {t("coach.charts.completionWeekly")}
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("coach.charts.completionWeeklySubtitle")}
          </p>
        </div>
        <div className="h-48 w-full">
          {charts?.completionRateTrend?.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={charts.completionRateTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2329"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6b7280"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0d1014",
                    borderColor: "#1e2329",
                    borderRadius: "0.5rem",
                    fontSize: "12px",
                    color: "#f3f4f6",
                  }}
                  formatter={(v: any) => [`${v}%`, t("coach.charts.completion")]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#5BE584"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              {t("coach.charts.noData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachCharts;
