// src/features/coach-dashboard/components/performance/AssignmentStatusDonutChart.tsx
import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { AssignmentStatusPoint } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface AssignmentStatusDonutChartProps {
  data?: AssignmentStatusPoint[];
}

export const AssignmentStatusDonutChart: React.FC<
  AssignmentStatusDonutChartProps
> = ({ data = [] }) => {
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <div className="flex flex-col rounded-xl border border-[#1e2329] bg-[#0d1014] p-5 h-full transition-colors hover:border-[#2a313a]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-100">
            Assignment Status Distribution
          </h3>
          <InfoTooltip
            title="Assignment Portfolio Breakdown"
            description="Operational distribution of workout assignments across your athlete roster by status: Active, Completed, or Cancelled."
            calculation="COUNT(assignments) grouped by status / total assignments × 100"
            unit="assignments & percentage"
            dateRange="All current & historical assignments"
            limitations="Cancelled assignments include workouts aborted by athlete or coach with reason."
          />
        </div>
        <span className="text-xs font-mono font-medium text-gray-500">
          {total} Total
        </span>
      </div>

      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={48}
                outerRadius={72}
                paddingAngle={4}
                dataKey="count"
                nameKey="status"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color || "#5BE584"}
                    stroke="#0d1014"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as AssignmentStatusPoint;
                    return (
                      <div className="rounded-lg border border-[#1e2329] bg-[#101418] p-2.5 text-xs text-white shadow-xl">
                        <div className="flex items-center gap-2">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="font-semibold">{item.status}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 text-gray-400">
                          <span>{item.count} assignments</span>
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
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-gray-500">
            <span>No assignment records found.</span>
            <span className="text-[11px] text-gray-600">
              Create assignments to see your portfolio distribution.
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      {hasData && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-4 border-t border-[#1e2329] pt-3 text-xs">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{item.status}:</span>
              <span className="font-mono font-medium text-gray-200">
                {item.count} ({item.percentage}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
