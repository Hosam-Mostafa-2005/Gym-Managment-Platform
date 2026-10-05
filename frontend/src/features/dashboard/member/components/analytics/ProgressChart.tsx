// src/features/dashboard/member/components/analytics/ProgressChart.tsx
import React, { useState } from "react";
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

interface ProgressChartProps {
  exercises?: any[];
  sets?: any[];
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  exercises = [],
  sets = [],
}) => {
  const [metric, setMetric] = useState<"exercises" | "sets">("sets");
  const data = metric === "exercises" ? exercises : sets;

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">Weekly Output</h2>
        </div>
        <select
          value={metric}
          onChange={(e) => setMetric(e.target.value as "exercises" | "sets")}
          className="rounded-md border border-[#1E2329] bg-[#090B0F] px-2 py-1 text-xs text-gray-300 focus:border-[#5BE584] focus:outline-none"
        >
          <option value="sets">Total Sets</option>
          <option value="exercises">Exercises</option>
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
            No weekly output data.
          </div>
        )}
      </div>
    </div>
  );
};
