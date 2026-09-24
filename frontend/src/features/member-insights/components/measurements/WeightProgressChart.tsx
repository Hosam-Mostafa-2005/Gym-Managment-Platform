// src/features/member-insights/components/measurements/WeightProgressChart.tsx

import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "../../types/member-insights.types";

interface WeightProgressChartProps {
  data: ChartPoint[];
}

export const WeightProgressChart: React.FC<WeightProgressChartProps> = ({
  data,
}) => {
  const formatDate = (val: string) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
    }).format(new Date(val));
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1014] p-6">
      <div className="mb-6 flex flex-col gap-1">
        <h3 className="text-sm font-semibold text-gray-100">Weight Progress</h3>
        <p className="text-xs text-gray-500">Historical mass trajectory (kg)</p>
      </div>
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1E2329"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={formatDate}
              />
              <YAxis
                stroke="#6B7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1014",
                  borderColor: "#1E2329",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F3F4F6",
                }}
                itemStyle={{ color: "#5BE584" }}
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(val) => [`${val} kg`, "Weight"] as [string, string]}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#5BE584"
                strokeWidth={2}
                dot={{
                  r: 4,
                  fill: "#0D1014",
                  stroke: "#5BE584",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 6, fill: "#5BE584" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No weight history available.
          </div>
        )}
      </div>
    </div>
  );
};
