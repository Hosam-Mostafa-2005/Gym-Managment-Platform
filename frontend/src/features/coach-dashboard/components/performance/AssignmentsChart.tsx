// src/features/coach-dashboard/components/performance/AssignmentsChart.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { DashboardChartPoint } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface AssignmentsChartProps {
  data?: DashboardChartPoint[];
}

export const AssignmentsChart: React.FC<AssignmentsChartProps> = ({
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
              {t("analyticsView.assignmentsVelocity")}
            </h3>
            <InfoTooltip
              title={t("analyticsView.tooltips.velocityTitle")}
              description={t("analyticsView.tooltips.velocityDesc")}
              calculation={t("analyticsView.tooltips.velocityCalc")}
              unit={t("analyticsView.tooltips.velocityUnit")}
              dateRange={t("analyticsView.tooltips.velocityRange")}
              limitations={t("analyticsView.tooltips.velocityLimit")}
            />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {t("analyticsView.assignmentsVelocitySub")}
          </p>
        </div>
      </div>

      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
                itemStyle={{ color: "#5BE584" }}
                formatter={(value: any) => [
                  value,
                  t("analyticsView.assignmentsCreated"),
                ]}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              />
              <Bar
                dataKey="value"
                fill="#5BE584"
                radius={[4, 4, 0, 0]}
                maxBarSize={20}
              />
            </BarChart>
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
