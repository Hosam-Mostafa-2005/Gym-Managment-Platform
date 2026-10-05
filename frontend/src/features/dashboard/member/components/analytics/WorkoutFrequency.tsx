// src/features/dashboard/member/components/analytics/WorkoutFrequency.tsx
import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";

interface WorkoutFrequencyProps {
  byWeekday?: any[];
  byHour?: any[];
}

export const WorkoutFrequency: React.FC<WorkoutFrequencyProps> = ({
  byWeekday = [],
  byHour = [],
}) => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">Sessions by Day</h2>
        </div>
        <div className="h-[180px] w-full">
          {byWeekday.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byWeekday}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "#1E2329" }}
                  contentStyle={{
                    backgroundColor: "#0D1117",
                    borderColor: "#1E2329",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="sessions" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              No data
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">Sessions by Time</h2>
        </div>
        <div className="h-[180px] w-full">
          {byHour.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={byHour}
                margin={{ top: 0, right: 0, left: -30, bottom: 0 }}
              >
                <XAxis
                  dataKey="hour"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                />
                <Tooltip
                  cursor={{ fill: "#1E2329" }}
                  contentStyle={{
                    backgroundColor: "#0D1117",
                    borderColor: "#1E2329",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                />
                <Bar dataKey="sessions" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              No data
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
