// src/features/dashboard/member/components/analytics/SessionStatusDistribution.tsx
import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { SessionStatusPoint } from "@/features/dashboard/types/dashboard.types";

interface SessionStatusDistributionProps {
  data?: SessionStatusPoint[];
}

export const SessionStatusDistribution: React.FC<
  SessionStatusDistributionProps
> = ({ data = [] }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="flex flex-col rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 transition-colors hover:border-[#2A313A]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            Session Status Breakdown
          </h2>
          <InfoTooltip
            title="Session Status Distribution"
            description="Proportion of your workout sessions by final operational status: Completed, In Progress, or Cancelled."
            calculation="SUM(sessions) grouped by status / total sessions × 100"
            unit="percentage & count"
            dateRange="All time"
            limitations="Cancelled sessions record abandoned workouts; in progress denotes active sessions."
          />
        </div>
        <span className="text-xs font-mono font-medium text-gray-500">
          {total} Total Sessions
        </span>
      </div>

      <div className="h-[200px] w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || "#5BE584"}
                    stroke="#0D1117"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as SessionStatusPoint;
                    return (
                      <div className="rounded-lg border border-[#1E2329] bg-[#101418] p-2.5 text-xs text-white shadow-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold">{item.status}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 text-gray-400">
                          <span>{item.count} sessions</span>
                          <span className="font-mono text-[#5BE584]">
                            {item.percentage}%
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-sm text-gray-500">
            <span>No workout session history recorded yet.</span>
            <span className="text-xs text-gray-600">
              Start a workout to see your completion distribution.
            </span>
          </div>
        )}
      </div>

      {/* Custom Legend */}
      {hasData && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-[#1E2329] pt-3 text-xs">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{item.status}:</span>
              <span className="font-mono font-medium text-white">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
