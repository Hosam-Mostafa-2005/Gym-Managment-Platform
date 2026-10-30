// src/features/nutrition/pages/NutritionHistoryPage.tsx
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { useNutritionHistory } from "../hooks/useNutrition";
import { NutritionNavTabs } from "../components/NutritionNavTabs";

export const NutritionHistoryPage: React.FC = () => {
  const { t, i18n } = useTranslation(["nutrition"]);
  const [daysRange, setDaysRange] = useState<number>(30);
  const { data: historyData, isLoading } = useNutritionHistory(daysRange);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  const {
    timeline = [],
    loggedDaysCount = 0,
    totalDays = daysRange,
    loggingConsistencyPct = 0,
    avgCaloriesOnLoggedDays = 0,
    activePlanTargets,
  } = historyData || {};

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
        <NutritionNavTabs />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
              <span>{t("history.title")}</span>
              <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-3 py-0.5 text-xs font-semibold text-[#5BE584]">
                {t("history.daysTrend", { days: daysRange })}
              </span>
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {t("history.subtitle")}
            </p>
          </div>

          {/* Time range selector */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-[#101418] p-1 shadow-sm">
            {[7, 14, 30, 60].map((d) => (
              <button
                key={d}
                onClick={() => setDaysRange(d)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  daysRange === d
                    ? "bg-[#5BE584] text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                }`}
              >
                {d}D
              </button>
            ))}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Consistency */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-[#5BE584]" />
              <span>{t("history.consistency")}</span>
            </div>
            <div className="text-3xl font-extrabold text-zinc-100">
              {loggingConsistencyPct}%
            </div>
            <p className="text-xs text-zinc-400">
              {t("history.consistencySub", { logged: loggedDaysCount, total: totalDays })}
            </p>
          </div>

          {/* Avg Calories on Logged Days */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4" />
              <span>{t("history.avgCalories")}</span>
            </div>
            <div className="text-3xl font-extrabold text-amber-400">
              {avgCaloriesOnLoggedDays}{" "}
              <span className="text-sm font-normal text-zinc-400">kcal</span>
            </div>
            <p className="text-xs text-zinc-400">
              Target: {activePlanTargets?.calories || 0} kcal (
              {avgCaloriesOnLoggedDays > 0 && activePlanTargets?.calories
                ? t("history.targetPct", {
                    pct: Math.round((avgCaloriesOnLoggedDays / activePlanTargets.calories) * 100),
                  })
                : t("history.noActiveTarget")}
              )
            </p>
          </div>

          {/* Target Protein */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4" />
              <span>{t("history.targetPreservation")}</span>
            </div>
            <div className="text-3xl font-extrabold text-emerald-400">
              {activePlanTargets?.protein || 0}{" "}
              <span className="text-sm font-normal text-zinc-400">g protein</span>
            </div>
            <p className="text-xs text-zinc-400">
              {t("history.targetPreservationSub")}
            </p>
          </div>
        </div>

        {/* Timeline Log Table */}
        <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <h3 className="text-base font-bold text-zinc-100">{t("history.timelineHeading")}</h3>
            <span className="text-xs text-zinc-400">
              {t("history.timelineSub")}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[540px] text-left rtl:text-right text-xs">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                  <th className="pb-2.5 text-left rtl:text-right">{t("history.colDate")}</th>
                  <th className="pb-2.5 text-left rtl:text-right">{t("history.colStatus")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colCaloriesLogged")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colTarget")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colProtein")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colCarbs")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colFat")}</th>
                  <th className="pb-2.5 text-right rtl:text-left">{t("history.colAdherence")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {timeline.map((day) => (
                  <tr
                    key={day.date}
                    className={`hover:bg-zinc-800/30 transition-colors ${
                      !day.isLogged ? "opacity-60" : ""
                    }`}
                  >
                    <td className="py-3 font-medium text-zinc-200 text-left rtl:text-right">
                      {new Date(day.date).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-3 text-left rtl:text-right">
                      {day.isLogged ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          <span>{t("history.statusLogged")}</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800 border border-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-400">
                          <XCircle className="h-3 w-3" />
                          <span>{t("history.statusUnlogged")}</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right rtl:text-left font-bold text-amber-400">
                      {day.isLogged ? `${day.calories} kcal` : "—"}
                    </td>
                    <td className="py-3 text-right rtl:text-left text-zinc-400">
                      {day.targetCalories > 0 ? `${day.targetCalories} kcal` : "—"}
                    </td>
                    <td className="py-3 text-right rtl:text-left text-emerald-400 font-medium">
                      {day.isLogged ? `${day.protein}g` : "—"}
                    </td>
                    <td className="py-3 text-right rtl:text-left text-blue-400 font-medium">
                      {day.isLogged ? `${day.carbs}g` : "—"}
                    </td>
                    <td className="py-3 text-right rtl:text-left text-purple-400 font-medium">
                      {day.isLogged ? `${day.fat}g` : "—"}
                    </td>
                    <td className="py-3 text-right rtl:text-left">
                      {day.isLogged && day.targetCalories > 0 ? (
                        <span
                          className={`font-semibold ${
                            Math.abs(day.adherencePct - 100) <= 10
                              ? "text-emerald-400"
                              : day.adherencePct < 90
                                ? "text-amber-400"
                                : "text-blue-400"
                          }`}
                        >
                          {day.adherencePct}%
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionHistoryPage;