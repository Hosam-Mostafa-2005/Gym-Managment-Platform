// src/features/nutrition/pages/NutritionOverviewPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Flame,
  Plus,
  Trash2,
  CalendarDays,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useNutritionOverview, useDeleteFoodLog } from "../hooks/useNutrition";
import { FoodLogDialog } from "../components/FoodLogDialog";
import { NutritionNavTabs } from "../components/NutritionNavTabs";
import type { MealType } from "../types/nutrition.types";

const MEAL_ORDER: Array<{ key: MealType; defaultTime: string }> = [
  { key: "BREAKFAST", defaultTime: "08:00" },
  { key: "MORNING_SNACK", defaultTime: "11:00" },
  { key: "LUNCH", defaultTime: "13:30" },
  { key: "AFTERNOON_SNACK", defaultTime: "16:30" },
  { key: "DINNER", defaultTime: "19:30" },
  { key: "EVENING_SNACK", defaultTime: "21:30" },
  { key: "PRE_WORKOUT", defaultTime: "Training Window" },
  { key: "POST_WORKOUT", defaultTime: "Training Window" },
];

export const NutritionOverviewPage: React.FC = () => {
  const { t } = useTranslation(["nutrition"]);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  );
  const [isLogDialogOpen, setIsLogDialogOpen] = useState(false);
  const [activeMealTypeForDialog, setActiveMealTypeForDialog] = useState<MealType>("BREAKFAST");

  const { data: overview, isLoading, error, refetch } = useNutritionOverview(selectedDate);
  const { mutate: deleteLog, isPending: isDeleting } = useDeleteFoodLog();

  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const handleToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const openLogDialogForMeal = (mealType: MealType) => {
    setActiveMealTypeForDialog(mealType);
    setIsLogDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
          <p className="text-sm text-zinc-400">{t("overview.loading")}</p>
        </div>
      </div>
    );
  }

  if (error || !overview) {
    return (
      <div className="min-h-full w-full bg-[#090B0F] p-6 text-zinc-100">
        <div className="mx-auto max-w-4xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400 mb-3" />
          <h2 className="text-lg font-bold text-red-200">{t("overview.loadErrorTitle")}</h2>
          <p className="text-sm text-red-300/80 mt-1 mb-4">
            {error instanceof Error ? error.message : "An unexpected error occurred."}
          </p>
          <button
            onClick={() => refetch()}
            className="rounded-xl bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            {t("overview.retry")}
          </button>
        </div>
      </div>
    );
  }

  const { intake, plan, hasActivePlan, onboardingCompleted, logsByMealType } = overview;
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col gap-6">
        {/* Navigation Tabs */}
        <NutritionNavTabs onboardingCompleted={onboardingCompleted} />

        {/* Header & Date Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
              <span>{t("overview.title")}</span>
              {plan && (
                <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-3 py-0.5 text-xs font-semibold text-[#5BE584]">
                  {plan.source === "COACH_ASSIGNED" ? t("overview.sourceCoach") : t("overview.sourceSelf")}
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              {t("overview.subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Date Navigator */}
            <div className="flex items-center rounded-xl border border-zinc-800 bg-[#101418] p-1 shadow-sm">
              <button
                onClick={handlePrevDay}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title={t("overview.prevDay")}
              >
                <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
              </button>
              <button
                onClick={handleToday}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  isToday
                    ? "bg-[#5BE584]/20 text-[#5BE584]"
                    : "text-zinc-300 hover:bg-zinc-800"
                }`}
              >
                {isToday ? t("overview.today") : selectedDate}
              </button>
              <button
                onClick={handleNextDay}
                className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 transition-colors"
                title={t("overview.nextDay")}
              >
                <ChevronRight className="h-4 w-4 rtl:rotate-180" />
              </button>
            </div>

            {/* Quick Log Action */}
            <button
              onClick={() => openLogDialogForMeal("BREAKFAST")}
              className="flex items-center gap-2 rounded-xl bg-[#5BE584] px-4 py-2 text-sm font-semibold text-zinc-950 hover:bg-[#4dd374] transition-all shadow-md shadow-[#5BE584]/10"
            >
              <Plus className="h-4 w-4" />
              <span>{t("overview.logFood")}</span>
            </button>
          </div>
        </div>

        {/* Empty State / Onboarding Prompt */}
        {!hasActivePlan && (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-[#101418] to-[#101418] p-8 shadow-xl">
            <div className="max-w-2xl space-y-4">
              <div className="flex items-center gap-2 text-amber-400 text-sm font-semibold tracking-wide uppercase">
                <Sparkles className="h-4 w-4" />
                <span>{t("overview.unassignedBannerTitle")}</span>
              </div>
              <h2 className="text-2xl font-bold text-zinc-100">
                {t("overview.unassignedBannerHeading")}
              </h2>
              <p className="text-zinc-300 text-sm leading-relaxed">
                {t("overview.unassignedBannerDesc")}
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/nutrition/onboarding"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-6 py-3 text-sm font-bold text-zinc-950 hover:bg-[#4dd374] transition-all shadow-lg shadow-[#5BE584]/20"
                >
                  <span>{t("overview.startAssessmentBtn")}</span>
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </Link>
                <div className="text-xs text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#5BE584]" />
                  <span>{t("overview.prefillsNote")}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Macro Progress KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Calories */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                {t("overview.calories")}
              </span>
              <Flame className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {intake.loggedCalories}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  {t("overview.caloriesProgress", { target: intake.targetCalories })}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {intake.remainingCalories > 0
                  ? t("overview.caloriesRemaining", { count: intake.remainingCalories })
                  : t("overview.caloriesTargetReached")}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  intake.calorieProgressPct > 105
                    ? "bg-red-400"
                    : "bg-amber-400"
                }`}
                style={{ width: `${Math.min(100, intake.calorieProgressPct)}%` }}
              />
            </div>
          </div>

          {/* Protein */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {t("overview.protein")}
              </span>
              <span className="text-xs font-bold text-emerald-400">
                {intake.proteinProgressPct}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {intake.loggedProteinG}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  {t("overview.proteinProgress", { target: intake.targetProteinG })}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {t("overview.proteinDesc")}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, intake.proteinProgressPct)}%` }}
              />
            </div>
          </div>

          {/* Carbohydrates */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                {t("overview.carbs")}
              </span>
              <span className="text-xs font-bold text-blue-400">
                {intake.carbsProgressPct}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {intake.loggedCarbsG}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  {t("overview.carbsProgress", { target: intake.targetCarbsG })}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {t("overview.carbsDesc")}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-blue-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, intake.carbsProgressPct)}%` }}
              />
            </div>
          </div>

          {/* Fats */}
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-purple-400">
                {t("overview.fat")}
              </span>
              <span className="text-xs font-bold text-purple-400">
                {intake.fatProgressPct}%
              </span>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-zinc-100">
                {intake.loggedFatG}{" "}
                <span className="text-sm font-normal text-zinc-400">
                  {t("overview.fatProgress", { target: intake.targetFatG })}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {t("overview.fatDesc")}
              </p>
            </div>
            <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, intake.fatProgressPct)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Active Plan Quick Card */}
        {plan && (
          <div className="rounded-2xl border border-zinc-800/80 bg-[#101418] p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-100">{plan.name}</h3>
                <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300 font-mono">
                  {t("overview.version", { version: plan.version })}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {plan.source === "COACH_ASSIGNED" && plan.coach ? (
                  <span className="flex items-center gap-1.5 text-emerald-400">
                    <UserCheck className="h-3.5 w-3.5" />
                    <span>{t("overview.assignedByCoach", { name: plan.coach.name, email: plan.coach.email })}</span>
                  </span>
                ) : (
                  <span>{t("overview.selfGuidedPlan")}</span>
                )}
                {plan.notes && ` • "${plan.notes}"`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/nutrition/plan"
                className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#161B22] px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-zinc-500 hover:text-zinc-100 transition-all"
              >
                <CalendarDays className="h-3.5 w-3.5" />
                <span>{t("overview.viewFullSchedule")}</span>
              </Link>
            </div>
          </div>
        )}

        {/* Meals Breakdown & Daily Log Entries */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-zinc-100">{t("overview.todayScheduleHeading")}</h2>
            <span className="text-xs text-zinc-400">
              {t("overview.totalItemsLogged", { count: overview.todayLogs.length })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MEAL_ORDER.map((mealMeta) => {
              // Planned meal from active plan if matching
              const plannedMeal = plan?.meals.find((m) => m.mealType === mealMeta.key);
              const loggedItems = logsByMealType[mealMeta.key] || [];

              // Skip snacks that have neither planned items nor logged items to keep view concise
              if (!plannedMeal && loggedItems.length === 0 && mealMeta.key.includes("SNACK")) {
                return null;
              }

              const mealLoggedCalories = loggedItems.reduce((acc, it) => acc + it.calories, 0);
              const mealLoggedProtein = Number(
                loggedItems.reduce((acc, it) => acc + it.protein, 0).toFixed(1),
              );

              const mealLabel = t(`meals.${mealMeta.key}` as any);

              return (
                <div
                  key={mealMeta.key}
                  className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 flex flex-col justify-between shadow-sm space-y-4"
                >
                  {/* Meal Header */}
                  <div className="flex items-center justify-between border-b border-zinc-800/60 pb-3">
                    <div>
                      <h3 className="text-base font-bold text-zinc-100">{mealLabel}</h3>
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                        <Clock className="h-3 w-3 text-zinc-500" />
                        <span>
                          {plannedMeal?.suggestedTime || (mealMeta.defaultTime === "Training Window" ? t("meals.trainingWindow") : mealMeta.defaultTime)}
                        </span>
                        {plannedMeal && (
                          <span className="text-zinc-500">
                            {t("overview.targetKcal", { target: plannedMeal.targetCalories || plannedMeal.totalCalories })}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-extrabold text-amber-400">
                        {t("overview.mealLoggedKcal", { calories: mealLoggedCalories })}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {t("overview.mealLoggedProtein", { protein: mealLoggedProtein })}
                      </div>
                    </div>
                  </div>

                  {/* Planned items recommendation (if available) */}
                  {plannedMeal && plannedMeal.items.length > 0 && (
                    <div className="rounded-xl bg-[#161B22]/70 border border-zinc-800/60 p-3 space-y-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                        {t("overview.plannedItems")}
                      </span>
                      <div className="space-y-1.5">
                        {plannedMeal.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between text-xs text-zinc-300"
                          >
                            <span>
                              {item.foodName} ({item.quantity} {item.unit})
                            </span>
                            <span className="text-zinc-400 font-mono">
                              {item.calories} kcal • {item.protein}g P
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actual Logged Items */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
                      {t("overview.actualLogged")}
                    </span>
                    {loggedItems.length > 0 ? (
                      <div className="space-y-2">
                        {loggedItems.map((log) => (
                          <div
                            key={log.id}
                            className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#161B22] p-2.5 hover:border-zinc-700 transition-colors"
                          >
                            <div>
                              <div className="text-sm font-semibold text-zinc-100">
                                {log.foodName}
                              </div>
                              <div className="text-xs text-zinc-400">
                                {log.quantity} {log.unit} • P: {log.protein}g • C: {log.carbs}g • F: {log.fat}g
                                {log.notes && ` • "${log.notes}"`}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-bold text-amber-400">
                                {t("overview.mealLoggedKcal", { calories: log.calories })}
                              </span>
                              <button
                                onClick={() => deleteLog(log.id)}
                                disabled={isDeleting}
                                title={t("overview.removeLogItem")}
                                className="rounded-lg p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-1">
                        {t("overview.noItemsLoggedForMeal", { meal: mealLabel.toLowerCase() })}
                      </p>
                    )}
                  </div>

                  {/* Add Food Button */}
                  <button
                    onClick={() => openLogDialogForMeal(mealMeta.key)}
                    className="w-full rounded-xl border border-dashed border-zinc-700/80 py-2.5 text-xs font-semibold text-zinc-300 hover:border-[#5BE584] hover:text-[#5BE584] hover:bg-[#5BE584]/5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>{t("overview.logFoodToMeal", { meal: mealLabel })}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Food Log Dialog */}
      <FoodLogDialog
        isOpen={isLogDialogOpen}
        onClose={() => setIsLogDialogOpen(false)}
        defaultMealType={activeMealTypeForDialog}
        defaultDate={selectedDate}
      />
    </div>
  );
};

export default NutritionOverviewPage;
