// src/features/dashboard/member/components/analytics/ProgressChart.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { LineChart as LineChartIcon } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface ProgressChartProps {
  exercises?: any[];
  sets?: any[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  exercises = [],
  sets = [],
}) => {
  const { t } = useTranslation(["dashboard"]);
  const [metric, setMetric] = useState<"exercises" | "sets">("sets");
  const data = metric === "exercises" ? exercises : sets;

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 transition-colors hover:border-[#2A313A]">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            {t("member.analyticsView.weeklyOutput")}
          </h2>
          <InfoTooltip
            title={t("member.analyticsView.weeklyOutputTooltipTitle")}
            description={t("member.analyticsView.weeklyOutputTooltipDesc")}
            calculation={t("member.analyticsView.weeklyOutputTooltipCalc")}
            unit={metric === "sets" ? "sets / week" : "exercises / week"}
            dateRange={t("member.analyticsView.weeklyOutputTooltipRange")}
            limitations={t("member.analyticsView.weeklyOutputTooltipLimit")}
          />
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as "exercises" | "sets")}
          className="rounded-md border border-[#1E2329] bg-[#090B0F] px-2 py-1 text-xs text-gray-300 focus:border-[#5BE584] focus:outline-none"
        >
          <option value="sets">{t("member.analyticsView.totalSets")}</option>
          <option value="exercises">{t("member.analyticsView.exercises")}</option>
        </select>
      </div>

      <div className="h-[200px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1E2329"
              />
              <XAxis
                dataKey="week"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                dy={10}
                tickFormatter={(val) => val.replace("Week of ", "")}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1117",
                  borderColor: "#1E2329",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(val: any) => [
                  val,
                  metric === "sets"
                    ? t("member.analyticsView.setsCompleted")
                    : t("member.analyticsView.exercisesCompleted"),
                ]}
              />
              <Line
                type="monotone"
                dataKey={metric}
                stroke="#5BE584"
                strokeWidth={2}
                dot={{ r: 4, fill: "#0D1117", stroke: "#5BE584" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            {t("member.analyticsView.noWeeklyOutputData")}
          </div>
        )}
      </div>
    </div>
  );
};
