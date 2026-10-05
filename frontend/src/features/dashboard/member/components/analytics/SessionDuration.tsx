// src/features/dashboard/member/components/analytics/SessionDuration.tsx
import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Clock } from "lucide-react";

interface SessionDurationProps {
  trend?: any[];
}

export const SessionDuration: React.FC<SessionDurationProps> = ({
  trend = [],
}) => {
  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6">
      <div className="mb-6 flex items-center gap-2">
        <Clock className="h-5 w-5 text-gray-400" />
        <h2 className="text-sm font-semibold text-white">Duration Trend</h2>
      </div>

      <div className="h-[200px] w-full">
        {trend.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDuration" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5BE584" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#5BE584" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#1E2329"
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#6b7280", fontSize: 10 }}
                dy={10}
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
              <Area
                type="monotone"
                dataKey="duration"
                stroke="#5BE584"
                fillOpacity={1}
                fill="url(#colorDuration)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            No duration data available.
          </div>
        )}
      </div>
    </div>
  );
};
