// src/features/dashboard/member/components/activity/WorkoutActivity.tsx
import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface WorkoutActivityProps {
  last30Days?: any[];
  last12Months?: any[];
}

export const WorkoutActivity: React.FC<WorkoutActivityProps> = ({
  last30Days = [],
  last12Months = [],
}) => {
  const [view, setView] = useState<"30D" | "12M">("30D");

  const data = view === "30D" ? last30Days : last12Months;
  const xAxisKey = view === "30D" ? "date" : "month";

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">Volume Activity</h2>
        </div>
        <div className="flex rounded-lg border border-[#1E2329] bg-[#090B0F] p-1">
          <button
            onClick={() => setView("30D")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === "30D"
                ? "bg-[#1E2329] text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            30 Days
          </button>
          <button
            onClick={() => setView("12M")}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              view === "12M"
                ? "bg-[#1E2329] text-white"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            12 Months
          </button>
        </div>
      </div>

      <div className="h-[250px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1E2329"
              />
              <XAxis
                dataKey={xAxisKey}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: "#1E2329", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "#0D1117",
                  borderColor: "#1E2329",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
              <Bar
                dataKey="volume"
                fill="#5BE584"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No volume data available for this period.
          </div>
        )}
      </div>
    </div>
  );
};
