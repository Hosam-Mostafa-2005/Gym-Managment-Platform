// src/features/coach-dashboard/components/performance/AssignmentsChart.tsx
import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import type { DashboardChartPoint } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface AssignmentsChartProps {
  data?: DashboardChartPoint[];
}

export const AssignmentsChart: React.FC<AssignmentsChartProps> = ({
  data = [],
}) => {
  const hasData = data && data.length > 0;

  return (
    <div className="flex flex-col rounded-lg border border-[#1e2329] bg-[#0d1014] p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-100">
            Assignments Velocity
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Last 30 Days Creation Volume
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
                formatter={(value: any) => [value, "Assignments"]}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
              />
              <Bar
                dataKey="value"
                fill="#5BE584"
                radius={[2, 2, 0, 0]}
                opacity={0.85}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-gray-500">
            No assignments volume data available.
          </div>
        )}
      </div>
    </div>
  );
};
