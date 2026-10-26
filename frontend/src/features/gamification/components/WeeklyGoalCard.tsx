// src/features/gamification/components/WeeklyGoalCard.tsx

import React from "react";
import { Target, CheckCircle2 } from "lucide-react";
import type { WeeklyGoalInfo } from "../types/gamification.types";

interface WeeklyGoalCardProps {
  weeklyGoal: WeeklyGoalInfo;
}

export const WeeklyGoalCard: React.FC<WeeklyGoalCardProps> = ({ weeklyGoal }) => {
  const { targetWorkouts, completedThisWeek, percent, weekStartDate } = weeklyGoal;
  const isCompleted = completedThisWeek >= targetWorkouts;

  return (
    <div className="relative overflow-hidden rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition-all hover:border-[#2A313A]">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#5BE584]/10 blur-2xl" />

      <div className="flex items-center justify-between pb-3 border-b border-[#1E2329]">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#5BE584]/30 bg-[#5BE584]/15 text-[#5BE584]">
            <Target className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-100">Weekly Target</h3>
            <p className="text-[11px] text-gray-400">
              Week of {new Date(weekStartDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${
            isCompleted
              ? "border-green-500/30 bg-green-500/15 text-[#5BE584]"
              : "border-blue-500/30 bg-blue-500/15 text-blue-400"
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-3 w-3" /> Goal Met!
            </>
          ) : (
            `${targetWorkouts - completedThisWeek} more to go`
          )}
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl font-extrabold tracking-tight text-white">
              {completedThisWeek}
            </span>
            <span className="text-xs font-semibold text-gray-400">
              / {targetWorkouts} workouts completed
            </span>
          </div>
          <span className="text-sm font-bold text-[#5BE584]">
            {percent}%
          </span>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full rounded-full bg-[#161B22] overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isCompleted ? "bg-[#5BE584]" : "bg-gradient-to-r from-blue-500 to-[#5BE584]"
            }`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
