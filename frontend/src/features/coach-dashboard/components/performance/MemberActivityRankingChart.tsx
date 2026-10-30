// src/features/coach-dashboard/components/performance/MemberActivityRankingChart.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Trophy } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";
import type { MemberActivityRankingPoint } from "@/features/coach-dashboard/types/coach-dashboard.types";

interface MemberActivityRankingChartProps {
  data?: MemberActivityRankingPoint[];
}

export const MemberActivityRankingChart: React.FC<
  MemberActivityRankingChartProps
> = ({ data = [] }) => {
  const { t } = useTranslation(["coachDashboard"]);
  const hasData = data && data.length > 0;

  return (
    <div className="flex flex-col rounded-xl border border-[#1e2329] bg-[#0d1014] p-5 h-full transition-colors hover:border-[#2a313a]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4 text-[#5BE584]" />
          <h3 className="text-sm font-semibold text-gray-100">
            {t("analyticsView.topActiveMembers")}
          </h3>
          <InfoTooltip
            title={t("analyticsView.tooltips.rankingTitle")}
            description={t("analyticsView.tooltips.rankingDesc")}
            calculation={t("analyticsView.tooltips.rankingCalc")}
            unit={t("analyticsView.tooltips.rankingUnit")}
            dateRange={t("analyticsView.tooltips.rankingRange")}
            limitations={t("analyticsView.tooltips.rankingLimit")}
          />
        </div>
        <span className="text-xs text-gray-500">
          {t("analyticsView.byCompletedSessions")}
        </span>
      </div>

      <div className="h-48 w-full">
        {hasData ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={false}
                stroke="#1e2329"
              />
              <XAxis
                type="number"
                stroke="#6b7280"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#6b7280"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={85}
                tick={{ fill: "#d1d5db" }}
              />
              <Tooltip
                cursor={{ fill: "#1e2329", opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: "#0d1014",
                  borderColor: "#1e2329",
                  borderRadius: "0.5rem",
                  fontSize: "12px",
                  color: "#f3f4f6",
                }}
                formatter={(val: any) => [
                  t("analyticsView.sessionsTooltip", { count: val }),
                  t("analyticsView.completed"),
                ]}
              />
              <Bar
                dataKey="completedSessions"
                fill="#5BE584"
                radius={[0, 4, 4, 0]}
                maxBarSize={16}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-xs text-gray-500">
            <span>{t("analyticsView.noMemberActivityRecorded")}</span>
            <span className="text-[11px] text-gray-600">
              {t("analyticsView.assignedMembersPrompt")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
