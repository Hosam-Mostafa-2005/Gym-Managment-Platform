// src/features/member-insights/components/workouts/WorkoutDurationChart.tsx

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

interface WorkoutDurationChartProps {
  data: ChartPoint[];
}

export const WorkoutDurationChart: React.FC<WorkoutDurationChartProps> = ({
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
        <h3 className="text-sm font-semibold text-gray-100">
          Workout Duration Trend
        </h3>
        <p className="text-xs text-gray-500">
          Chronological active session length (min)
        </p>
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0D1014",
                  borderColor: "#1E2329",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#F3F4F6",
                }}
                itemStyle={{ color: "#818CF8" }} // Subtle indigo for contrast
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(val) =>
                  [`${val} min`, "Duration"] as [string, string]
                }
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#818CF8"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: "#818CF8" }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No duration history available.
          </div>
        )}
      </div>
    </div>
  );
};
