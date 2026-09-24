// src/features/member-insights/components/workouts/WorkoutVolumeChart.tsx

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { ChartPoint } from "../../types/member-insights.types";

interface WorkoutVolumeChartProps {
  data: ChartPoint[];
}

export const WorkoutVolumeChart: React.FC<WorkoutVolumeChartProps> = ({
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
          Workout Volume History
        </h3>
        <p className="text-xs text-gray-500">
          Tonnage displaced per session (kg)
        </p>
      </div>
      <div className="h-64 w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BE584" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5BE584" stopOpacity={0} />
                </linearGradient>
              </defs>
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
                itemStyle={{ color: "#5BE584" }}
                labelFormatter={(label) => formatDate(label as string)}
                formatter={(val) =>
                  [`${val.toLocaleString()} kg`, "Volume"] as [string, string]
                }
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#5BE584"
                strokeWidth={2}
                fill="url(#volumeGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-gray-500">
            No volume history available.
          </div>
        )}
      </div>
    </div>
  );
};
