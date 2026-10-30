// src/features/gamification/components/StreakCard.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { Flame, Trophy, CalendarCheck } from "lucide-react";
import type { StreakInfo } from "../types/gamification.types";

interface StreakCardProps {
  streak: StreakInfo;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const { t, i18n } = useTranslation(["achievements"]);
  const { currentStreak, longestStreak, isActiveStreak, lastWorkoutDate } = streak;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition-all hover:border-[#2A313A]">
      {/* Glow highlight in background */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-orange-500/10 blur-2xl" />

      <div className="flex items-center justify-between pb-3 border-b border-[#1E2329]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-orange-500/30 bg-orange-500/15 text-orange-400">
            <Flame className="h-5 w-5 fill-orange-500/20" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">{t("kpi.streak.title")}</h3>
            <p className="text-[11px] text-gray-400">{t("kpi.streak.subtitle")}</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
            isActiveStreak
              ? "border-green-500/30 bg-green-500/15 text-[#5BE584]"
              : "border-gray-700 bg-gray-800 text-gray-400"
          }`}
        >
          {isActiveStreak ? t("kpi.streak.active") : t("kpi.streak.inactive")}
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between">
        <div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {currentStreak}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              {currentStreak === 1 ? t("kpi.streak.day") : t("kpi.streak.days")}
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            {isActiveStreak
              ? currentStreak > 0
                ? t("kpi.streak.onFire")
                : t("kpi.streak.startStreak")
              : t("kpi.streak.reigniteStreak")}
          </p>
        </div>

        <div className="flex flex-col items-end rtl:items-start text-right rtl:text-left">
          <div className="flex items-center gap-1 text-xs font-medium text-amber-400">
            <Trophy className="h-3.5 w-3.5" />
            <span>
              {t("kpi.streak.bestStreak", {
                count: longestStreak,
                unit: longestStreak === 1 ? t("kpi.streak.day") : t("kpi.streak.days"),
              })}
            </span>
          </div>
          {lastWorkoutDate && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-gray-500">
              <CalendarCheck className="h-3 w-3" />
              <span>
                {t("kpi.streak.lastWorkout", {
                  date: new Date(lastWorkoutDate).toLocaleDateString(i18n.language === "ar" ? "ar-EG" : "en-US"),
                })}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};