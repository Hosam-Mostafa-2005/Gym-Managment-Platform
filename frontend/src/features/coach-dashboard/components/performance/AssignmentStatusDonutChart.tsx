// src/features/coach-dashboard/components/performance/AssignmentStatusDonutChart.tsx
import React from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation(["coachDashboard"]);
  const hasData = data && data.length > 0 && data.some((d) => d.count > 0);
  const total = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  const getStatusLabel = (status: string) => {
    return t(`analyticsView.statusValues.${status}`, { defaultValue: status });
  };

  return (
    <div className="flex flex-col rounded-xl border border-[#1e2329] bg-[#0d1014] p-5 h-full transition-colors hover:border-[#2a313a]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChartIcon className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-100">
            {t("analyticsView.assignmentStatusDistribution")}
          </h3>
          <InfoTooltip
            title={t("analyticsView.tooltips.distributionTitle")}
            description={t("analyticsView.tooltips.distributionDesc")}
            calculation={t("analyticsView.tooltips.distributionCalc")}
            unit={t("analyticsView.tooltips.distributionUnit")}
            dateRange={t("analyticsView.tooltips.distributionRange")}
            limitations={t("analyticsView.tooltips.distributionLimit")}
          />
        </div>
        <span className="text-xs font-mono font-medium text-gray-500">
          {t("analyticsView.totalCount", { count: total })}
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
                          <span className="font-semibold">{getStatusLabel(item.status)}</span>
                        </div>
                        <div className="mt-1 flex items-center justify-between gap-4 text-gray-400">
                          <span>{item.count}</span>
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
            <span>{t("analyticsView.noAssignmentRecords")}</span>
            <span className="text-[11px] text-gray-600">
              {t("analyticsView.createAssignmentsPrompt")}
            </span>
          </div>
        )}
      </div>

      {/* Legend */}
      {hasData && (
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4 border-t border-[#1e2329] pt-3 text-xs">
          {data.map((item) => (
            <div key={item.status} className="flex items-center gap-1.5">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-gray-400">{getStatusLabel(item.status)}:</span>
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
