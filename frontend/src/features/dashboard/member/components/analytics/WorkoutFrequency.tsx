// src/features/dashboard/member/components/analytics/WorkoutFrequency.tsx
import React from "react";
import { useTranslation } from "react-i18next";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Calendar } from "lucide-react";
import { InfoTooltip } from "@/components/ui/info-tooltip";

interface WorkoutFrequencyProps {
  byWeekday?: any[];
  byHour?: any[];
}

export const WorkoutFrequency: React.FC<WorkoutFrequencyProps> = ({
  byWeekday = [],
  byHour = [],
}) => {
  const { t } = useTranslation(["dashboard"]);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 rounded-xl border border-[#1E2329] bg-[#0D1117] p-6 transition-colors hover:border-[#2A313A]">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            {t("member.analyticsView.sessionsByDay")}
          </h2>
          <InfoTooltip
            title={t("member.analyticsView.sessionsByDayTooltipTitle")}
            description={t("member.analyticsView.sessionsByDayTooltipDesc")}
            calculation={t("member.analyticsView.sessionsByDayTooltipCalc")}
            unit={t("member.analyticsView.sessionsByDayTooltipUnit")}
            dateRange={t("member.analyticsView.sessionsByDayTooltipRange")}
            limitations={t("member.analyticsView.sessionsByDayTooltipLimit")}
          />
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
                  formatter={(val: any) => [
                    val,
                    t("member.analyticsView.sessions"),
                  ]}
                />
                <Bar dataKey="sessions" fill="#3B82F6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              {t("member.analyticsView.noWeekdayData")}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-400" />
          <h2 className="text-sm font-semibold text-white">
            {t("member.analyticsView.sessionsByTime")}
          </h2>
          <InfoTooltip
            title={t("member.analyticsView.sessionsByTimeTooltipTitle")}
            description={t("member.analyticsView.sessionsByTimeTooltipDesc")}
            calculation={t("member.analyticsView.sessionsByTimeTooltipCalc")}
            unit={t("member.analyticsView.sessionsByTimeTooltipUnit")}
            dateRange={t("member.analyticsView.sessionsByTimeTooltipRange")}
            limitations={t("member.analyticsView.sessionsByTimeTooltipLimit")}
          />
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
                  formatter={(val: any) => [
                    val,
                    t("member.analyticsView.sessions"),
                  ]}
                />
                <Bar dataKey="sessions" fill="#10B981" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-gray-500">
              {t("member.analyticsView.noHourData")}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
