// src/features/dashboard/member/components/DailyNutritionCard.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { Utensils, Flame, ArrowRight, Sparkles, Plus } from "lucide-react";
import type { DailyNutritionSnapshot } from "../../types/dashboard.types";

interface DailyNutritionCardProps {
  nutrition?: DailyNutritionSnapshot | null;
}

export const DailyNutritionCard: React.FC<DailyNutritionCardProps> = ({
  nutrition,
}) => {
  const navigate = useNavigate();

  if (!nutrition || (!nutrition.hasActivePlan && !nutrition.onboardingCompleted)) {
    return (
      <div className="flex flex-col justify-between rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
        <div>
          <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
                <Utensils className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Nutrition Snapshot
                </h2>
                <p className="text-xs text-gray-400">Daily fuel & macros</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#161B22] text-[#5BE584]">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-white">
              No Active Nutrition Plan
            </h3>
            <p className="mt-1 max-w-xs text-xs text-gray-400">
              Personalize your daily calories and macro targets to match your
              fitness goals.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/nutrition/onboarding")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#5BE584] px-4 py-2.5 text-xs font-semibold text-black shadow-sm transition hover:bg-[#46c26d]"
        >
          Set Up Nutrition Plan <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  const caloriePct = Math.min(100, nutrition.calorieProgressPct || 0);
  const proteinPct = Math.min(100, nutrition.proteinProgressPct || 0);
  const carbsPct = Math.min(100, nutrition.carbsProgressPct || 0);
  const fatPct = Math.min(100, nutrition.fatProgressPct || 0);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-[#1E2329] bg-[#101418] p-5 shadow-sm transition hover:border-[#2A313C]">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1E2329] pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#5BE584]/10 text-[#5BE584]">
              <Utensils className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-white">
                Nutrition Snapshot
              </h2>
              <p className="text-xs text-gray-400">
                {nutrition.planName || "Active Plan"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => navigate("/nutrition")}
            className="inline-flex items-center gap-1 text-xs font-medium text-[#5BE584] transition hover:underline"
          >
            Hub <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Calories Summary */}
        <div className="mt-4 rounded-lg bg-[#161B22] p-3.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1.5 font-medium text-gray-300">
              <Flame className="h-3.5 w-3.5 text-amber-400" />
              Calories Today
            </span>
            <span className="text-gray-400">
              <span className="font-semibold text-white">
                {nutrition.loggedCalories.toLocaleString()}
              </span>{" "}
              / {nutrition.targetCalories.toLocaleString()} kcal
            </span>
          </div>

          {/* Progress Bar */}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[#21262D]">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                caloriePct > 100
                  ? "bg-amber-500"
                  : "bg-gradient-to-r from-[#5BE584] to-[#46c26d]"
              }`}
              style={{ width: `${caloriePct}%` }}
            />
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
            <span>{caloriePct}% target met</span>
            <span>
              {nutrition.remainingCalories > 0
                ? `${nutrition.remainingCalories.toLocaleString()} kcal remaining`
                : "Calorie target reached"}
            </span>
          </div>
        </div>

        {/* Macro Nutrients Breakdown */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {/* Protein */}
          <div className="rounded-lg border border-[#1E2329] bg-[#12171D] p-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Protein
            </span>
            <div className="mt-1 text-xs font-semibold text-white">
              {Math.round(nutrition.loggedProteinG)}g
            </div>
            <div className="text-[10px] text-gray-500">
              of {Math.round(nutrition.targetProteinG)}g
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#21262D]">
              <div
                className="h-full rounded-full bg-[#5BE584]"
                style={{ width: `${proteinPct}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div className="rounded-lg border border-[#1E2329] bg-[#12171D] p-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Carbs
            </span>
            <div className="mt-1 text-xs font-semibold text-white">
              {Math.round(nutrition.loggedCarbsG)}g
            </div>
            <div className="text-[10px] text-gray-500">
              of {Math.round(nutrition.targetCarbsG)}g
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#21262D]">
              <div
                className="h-full rounded-full bg-cyan-400"
                style={{ width: `${carbsPct}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div className="rounded-lg border border-[#1E2329] bg-[#12171D] p-2.5 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-400">
              Fat
            </span>
            <div className="mt-1 text-xs font-semibold text-white">
              {Math.round(nutrition.loggedFatG)}g
            </div>
            <div className="text-[10px] text-gray-500">
              of {Math.round(nutrition.targetFatG)}g
            </div>
            <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#21262D]">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${fatPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Logged count badge */}
        <div className="mt-3 text-center text-xs text-gray-400">
          {nutrition.logsCount > 0
            ? `${nutrition.logsCount} food log${nutrition.logsCount === 1 ? "" : "s"} recorded today`
            : "No meals logged yet today"}
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-4 pt-3 border-t border-[#1E2329]">
        <button
          type="button"
          onClick={() => navigate("/nutrition")}
          className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#5BE584]/15 px-3.5 py-2 text-xs font-semibold text-[#5BE584] transition hover:bg-[#5BE584]/25"
        >
          <Plus className="h-3.5 w-3.5" /> Log Food / View Meals
        </button>
      </div>
    </div>
  );
};
