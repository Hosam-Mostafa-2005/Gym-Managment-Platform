// src/features/coach-dashboard/components/performance/CompletionRateChart.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { DashboardChartPoint } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface CompletionRateChartProps {
  data?: DashboardChartPoint[];
}

export const CompletionRateChart: React.FC<CompletionRateChartProps> = ({
  data = [],
}) => {
  const { t } = useTranslation(["coachDashboard"]);
  const hasData = data && data.length > 0;

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 h-full transition-colors hover:border-[#2a313a]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-gray-100">
              {t("analyticsView.completionRateTrend")}
            </h3>
            <InfoTooltip
              title={t("analyticsView.tooltips.completionTitle")}
              description={t("analyticsView.tooltips.completionDesc")}
              calculation={t("analyticsView.tooltips.completionCalc")}
              unit={t("analyticsView.tooltips.completionUnit")}
              dateRange={t("analyticsView.tooltips.completionRange")}
              limitations={t("analyticsView.tooltips.completionLimit")}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("analyticsView.completionRateSub")}
          </p>
        </div>
      </div>

      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
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
                tickFormatter={(val) => {
                  try {
                    const d = new Date(val);
                    return `${d.getMonth() + 1}/${d.getDate()}`;
                  } catch {
                    return val;
                  }
                }}
              />
              <YAxis
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, 100]}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1014",
                  borderColor: "#1e2329",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#f3f4f6",
                }}
                itemStyle={{ color: "#5BE584" }}
                formatter={(value: any) => [
                  `${value}%`,
                  t("analyticsView.completionRateTrend"),
                ]}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5BE584"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#5BE584", stroke: "#0d1014" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            {t("analyticsView.noSessionTelemetry")}
          </div>
        )}
      </div>
    </div>
  );
};
