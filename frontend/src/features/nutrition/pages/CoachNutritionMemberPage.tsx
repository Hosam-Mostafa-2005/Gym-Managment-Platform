// src/features/nutrition/pages/CoachNutritionMemberPage.tsx
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Check,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  useCoachMemberNutrition,
  useCreateCoachPlan,
  useSearchFoods,
} from "../hooks/useNutrition";
import type { MealType, FoodItem } from "../types/nutrition.types";

interface BuilderMealItem {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface BuilderMeal {
  id: string;
  name: string;
  mealType: MealType;
  suggestedTime: string;
  items: BuilderMealItem[];
}

export const CoachNutritionMemberPage: React.FC = () => {
  const { memberId = "" } = useParams<{ memberId: string }>();
  const { t, i18n } = useTranslation(["nutrition"]);
  const [activeTab, setActiveTab] = useState<"overview" | "builder">("overview");

  const {
    data: memberData,
    isLoading,
    error,
    refetch,
  } = useCoachMemberNutrition(memberId);
  const { mutate: createPlanMutation, isPending: isAssigning } = useCreateCoachPlan();

  // Plan Builder State
  const [planName, setPlanName] = useState("Custom Coach Nutrition Plan");
  const [targetCalories, setTargetCalories] = useState<number>(2400);
  const [targetProteinG, setTargetProteinG] = useState<number>(180);
  const [targetCarbsG, setTargetCarbsG] = useState<number>(240);
  const [targetFatG, setTargetFatG] = useState<number>(75);
  const [coachNotes, setCoachNotes] = useState("");
  const [meals, setMeals] = useState<BuilderMeal[]>([
    {
      id: "meal-1",
      name: "Breakfast",
      mealType: "BREAKFAST",
      suggestedTime: "08:00",
      items: [],
    },
    {
      id: "meal-2",
      name: "Lunch",
      mealType: "LUNCH",
      suggestedTime: "13:00",
      items: [],
    },
    {
      id: "meal-3",
      name: "Dinner",
      mealType: "DINNER",
      suggestedTime: "19:30",
      items: [],
    },
  ]);

  // Food Search in Builder
  const [activeMealIdForSearch, setActiveMealIdForSearch] = useState<string | null>(null);
  const [foodSearchQuery, setFoodSearchQuery] = useState("");
  const { data: foodSearchResult } = useSearchFoods({
    search: foodSearchQuery,
    limit: 15,
  });

  const [builderError, setBuilderError] = useState<string | null>(null);
  const [builderSuccess, setBuilderSuccess] = useState<string | null>(null);

  const handleAddFoodToMeal = (mealId: string, food: FoodItem) => {
    const displayName = i18n.language === "ar" && food.nameAr ? food.nameAr : food.name;
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: [
            ...m.items,
            {
              foodId: food.id,
              foodName: displayName,
              quantity: food.servingSize || 100,
              unit: food.servingUnit,
              calories: food.calories,
              protein: food.protein,
              carbs: food.carbs,
              fat: food.fat,
            },
          ],
        };
      }),
    );
    setActiveMealIdForSearch(null);
    setFoodSearchQuery("");
  };

  const handleRemoveFoodItem = (mealId: string, itemIndex: number) => {
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        return {
          ...m,
          items: m.items.filter((_, idx) => idx !== itemIndex),
        };
      }),
    );
  };

  const handleUpdateItemQuantity = (
    mealId: string,
    itemIndex: number,
    newQuantity: number,
  ) => {
    if (newQuantity <= 0) return;
    setMeals((prev) =>
      prev.map((m) => {
        if (m.id !== mealId) return m;
        const newItems = [...m.items];
        const item = newItems[itemIndex];
        const factor = newQuantity / (item.quantity || 1);
        newItems[itemIndex] = {
          ...item,
          quantity: newQuantity,
          calories: Math.round(item.calories * factor),
          protein: Number((item.protein * factor).toFixed(1)),
          carbs: Number((item.carbs * factor).toFixed(1)),
          fat: Number((item.fat * factor).toFixed(1)),
        };
        return { ...m, items: newItems };
      }),
    );
  };

  const handleAddMealSection = () => {
    const newId = `meal-${Date.now()}`;
    setMeals((prev) => [
      ...prev,
      {
        id: newId,
        name: `Meal ${prev.length + 1}`,
        mealType: "AFTERNOON_SNACK",
        suggestedTime: "16:00",
        items: [],
      },
    ]);
  };

  const handleRemoveMealSection = (mealId: string) => {
    setMeals((prev) => prev.filter((m) => m.id !== mealId));
  };

  const handleAssignPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setBuilderError(null);
    setBuilderSuccess(null);

    if (!planName.trim()) {
      setBuilderError(t("coach.errPlanName"));
      return;
    }
    if (targetCalories < 800) {
      setBuilderError(t("coach.errMinCalories"));
      return;
    }

    const validMeals = meals.filter((m) => m.items.length > 0);
    if (validMeals.length === 0) {
      setBuilderError(t("coach.errAddFood"));
      return;
    }

    createPlanMutation(
      {
        memberId,
        name: planName.trim(),
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatG,
        notes: coachNotes.trim() || undefined,
        meals: validMeals.map((m, idx) => ({
          name: m.name,
          mealType: m.mealType,
          suggestedTime: m.suggestedTime,
          order: idx + 1,
          items: m.items.map((it) => ({
            foodId: it.foodId,
            quantity: Number(it.quantity) || 0,
            unit: it.unit,
          })),
        })),
      },
      {
        onSuccess: () => {
          setBuilderSuccess(t("coach.planSuccess"));
          refetch();
          setActiveTab("overview");
        },
        onError: (err: any) => {
          setBuilderError(
            err.response?.data?.message || err.message || t("coach.errFailed"),
          );
        },
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  if (error || !memberData) {
    return (
      <div className="min-h-full w-full bg-[#090B0F] p-6 text-zinc-100">
        <div className="mx-auto max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/10 p-8 text-center space-y-4">
          <ShieldAlert className="mx-auto h-10 w-10 text-red-400" />
          <h2 className="text-lg font-bold text-red-200">{t("coach.unauthorizedTitle")}</h2>
          <p className="text-sm text-red-300/80">
            {error instanceof Error ? error.message : t("coach.unauthorizedDesc")}
          </p>
          <Link
            to="/coach/nutrition"
            className="inline-flex items-center gap-2 rounded-xl bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
          >
            <ArrowLeft className="h-4 w-4 rtl:rotate-180" />
            <span>{t("coach.returnToRoster")}</span>
          </Link>
        </div>
      </div>
    );
  }

  const { overview, history, user } = memberData;
  const activePlan = overview.plan;

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
        {/* Top Back Nav & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              to="/coach/nutrition"
              title={t("coach.memberDetailBack")}
              className="rounded-xl border border-zinc-800 bg-[#101418] p-2 text-zinc-400 hover:border-zinc-700 hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 rtl:rotate-180" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
                  {user?.name ? t("coach.memberDetailTitle", { name: user.name }) : t("coach.title")}
                </h1>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-semibold text-emerald-400">
                  {t("coach.activeCoachedAthlete")}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{user?.email}</p>
            </div>
          </div>

          {/* Sub tabs */}
          <div className="flex items-center rounded-xl border border-zinc-800 bg-[#101418] p-1">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "overview"
                  ? "bg-[#5BE584] text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t("coach.intakeAndProgress")}
            </button>
            <button
              onClick={() => setActiveTab("builder")}
              className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                activeTab === "builder"
                  ? "bg-[#5BE584] text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {t("coach.customPlanBuilder")}
            </button>
          </div>
        </div>

        {builderSuccess && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-xs text-emerald-300 flex items-center gap-2">
            <Check className="h-4 w-4" />
            <span>{builderSuccess}</span>
          </div>
        )}

        {/* TAB 1: OVERVIEW & PROGRESS */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Active Plan Card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#5BE584]">
                    {t("coach.currentActivePlan")}
                  </span>
                  <h2 className="text-xl font-bold text-zinc-100 mt-0.5">
                    {activePlan ? activePlan.name : t("coach.noActivePlanAssigned")}
                  </h2>
                  <p className="text-xs text-zinc-400 mt-1">
                    {activePlan
                      ? `Source: ${activePlan.source === "COACH_ASSIGNED" ? t("coach.sourceCoach") : t("coach.sourceSelf")} (${t("overview.version", { version: activePlan.version })})`
                      : t("coach.athleteNoPlan")}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("builder")}
                  className="rounded-xl bg-[#5BE584] px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-[#4dd374] transition-all"
                >
                  {t("coach.createAssignNewPlan")}
                </button>
              </div>

              {activePlan && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800/80">
                    <div className="text-xs text-zinc-400">{t("plan.targetCalories")}</div>
                    <div className="text-lg font-bold text-amber-400">
                      {activePlan.targetCalories} kcal
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800/80">
                    <div className="text-xs text-zinc-400">{t("plan.targetProtein")}</div>
                    <div className="text-lg font-bold text-emerald-400">
                      {activePlan.targetProteinG} g
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800/80">
                    <div className="text-xs text-zinc-400">{t("plan.targetCarbs")}</div>
                    <div className="text-lg font-bold text-blue-400">
                      {activePlan.targetCarbsG} g
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800/80">
                    <div className="text-xs text-zinc-400">{t("plan.targetFat")}</div>
                    <div className="text-lg font-bold text-purple-400">
                      {activePlan.targetFatG} g
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Today's Intake vs Targets */}
            <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 shadow-sm space-y-4">
              <h3 className="text-base font-bold text-zinc-100">
                {t("coach.todayActualLogged", { date: overview.date })}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800">
                  <div className="text-xs text-zinc-400">{t("coach.loggedCalories")}</div>
                  <div className="text-xl font-bold text-amber-400">
                    {overview.intake.loggedCalories}{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      / {overview.intake.targetCalories}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800">
                  <div className="text-xs text-zinc-400">{t("coach.loggedProtein")}</div>
                  <div className="text-xl font-bold text-emerald-400">
                    {overview.intake.loggedProteinG}g{" "}
                    <span className="text-xs font-normal text-zinc-500">
                      / {overview.intake.targetProteinG}g
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800">
                  <div className="text-xs text-zinc-400">{t("coach.loggedCarbs")}</div>
                  <div className="text-xl font-bold text-blue-400">
                    {overview.intake.loggedCarbsG}g
                  </div>
                </div>
                <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800">
                  <div className="text-xs text-zinc-400">{t("coach.loggedFat")}</div>
                  <div className="text-xl font-bold text-purple-400">
                    {overview.intake.loggedFatG}g
                  </div>
                </div>
              </div>

              {/* Logged items */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  {t("coach.foodItemsLoggedToday", { count: overview.todayLogs.length })}
                </span>
                {overview.todayLogs.length > 0 ? (
                  <div className="space-y-1.5">
                    {overview.todayLogs.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs"
                      >
                        <div>
                          <span className="font-semibold text-zinc-200">{item.foodName}</span>{" "}
                          <span className="text-zinc-400">
                            ({item.quantity} {item.unit}) • {t(`meals.${item.mealType}` as any) || item.mealType}
                          </span>
                        </div>
                        <div className="font-mono text-zinc-300">
                          {item.calories} kcal • P: {item.protein}g • C: {item.carbs}g • F: {item.fat}g
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-1">
                    {t("coach.athleteNoLogsToday")}
                  </p>
                )}
              </div>
            </div>

            {/* 30-Day Adherence Stats */}
            <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-zinc-100">
                  {t("coach.historicalCompliance")}
                </h3>
                <span className="rounded-lg bg-zinc-800 px-3 py-1 text-xs text-zinc-300 font-semibold">
                  {t("coach.consistencyRate", { pct: history.loggingConsistencyPct })}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {t("coach.complianceSub", {
                  logged: history.loggedDaysCount,
                  total: history.totalDays,
                  avg: history.avgCaloriesOnLoggedDays,
                })}
              </p>
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOM PLAN BUILDER */}
        {activeTab === "builder" && (
          <form
            onSubmit={handleAssignPlan}
            className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 shadow-sm space-y-6"
          >
            {builderError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                {builderError}
              </div>
            )}

            <div className="border-b border-zinc-800/80 pb-4">
              <h2 className="text-xl font-bold text-zinc-100">{t("coach.builderHeading")}</h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                {t("coach.builderDesc", { name: user?.name || "" })}
              </p>
            </div>

            {/* Plan Targets Form */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t("coach.planNameLabel")}</label>
                <input
                  type="text"
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t("coach.targetCaloriesLabel")}</label>
                <input
                  type="number"
                  min="800"
                  max="10000"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t("coach.targetProteinLabel")}</label>
                <input
                  type="number"
                  min="0"
                  value={targetProteinG}
                  onChange={(e) => setTargetProteinG(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t("coach.targetCarbsLabel")}</label>
                <input
                  type="number"
                  min="0"
                  value={targetCarbsG}
                  onChange={(e) => setTargetCarbsG(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">{t("coach.targetFatLabel")}</label>
                <input
                  type="number"
                  min="0"
                  value={targetFatG}
                  onChange={(e) => setTargetFatG(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                />
              </div>
            </div>

            {/* Coach Notes */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                {t("coach.coachNotesLabel")}
              </label>
              <input
                type="text"
                value={coachNotes}
                onChange={(e) => setCoachNotes(e.target.value)}
                placeholder={t("coach.coachNotesPlaceholder")}
                className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-3.5 py-2 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
              />
            </div>

            {/* Meals Configuration */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-zinc-100 uppercase tracking-wider">
                  {t("coach.prescribedMealsHeading", { count: meals.length })}
                </h3>
                <button
                  type="button"
                  onClick={handleAddMealSection}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-[#161B22] px-3 py-1.5 text-xs font-semibold text-zinc-200 hover:border-[#5BE584] hover:text-[#5BE584]"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t("coach.addMealSection")}</span>
                </button>
              </div>

              <div className="space-y-4">
                {meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-xl border border-zinc-800 bg-[#161B22] p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) =>
                            setMeals((prev) =>
                              prev.map((m) =>
                                m.id === meal.id ? { ...m, name: e.target.value } : m,
                              ),
                            )
                          }
                          className="rounded-lg border border-zinc-700 bg-[#0D1014] px-2.5 py-1 text-xs font-bold text-zinc-100"
                        />
                        <input
                          type="text"
                          value={meal.suggestedTime}
                          onChange={(e) =>
                            setMeals((prev) =>
                              prev.map((m) =>
                                m.id === meal.id
                                  ? { ...m, suggestedTime: e.target.value }
                                  : m,
                              ),
                            )
                          }
                          placeholder="08:00"
                          className="w-20 rounded-lg border border-zinc-700 bg-[#0D1014] px-2.5 py-1 text-xs text-zinc-300 font-mono text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMealSection(meal.id)}
                        className="text-zinc-500 hover:text-red-400 p-1"
                        title={t("coach.removeMeal")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Meal Food Items */}
                    <div className="space-y-2">
                      {meal.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between rounded-lg bg-[#0D1014] p-2.5 text-xs border border-zinc-800"
                        >
                          <div>
                            <span className="font-semibold text-zinc-200">{it.foodName}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min="1"
                                value={it.quantity}
                                onChange={(e) =>
                                  handleUpdateItemQuantity(
                                    meal.id,
                                    idx,
                                    parseFloat(e.target.value) || 0,
                                  )
                                }
                                className="w-16 rounded border border-zinc-700 bg-[#161B22] px-2 py-0.5 text-xs text-zinc-100 text-center"
                              />
                              <span className="text-zinc-400">{it.unit}</span>
                            </div>
                            <span className="font-mono text-amber-400 font-semibold">
                              {it.calories} kcal
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFoodItem(meal.id, idx)}
                              className="text-zinc-500 hover:text-red-400"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {/* Add Food Button / Search Box */}
                      {activeMealIdForSearch === meal.id ? (
                        <div className="rounded-xl border border-zinc-700 bg-[#0D1014] p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-zinc-300">
                              {t("coach.searchCatalogToAdd")}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMealIdForSearch(null);
                                setFoodSearchQuery("");
                              }}
                              className="text-zinc-400 hover:text-zinc-200 text-xs"
                            >
                              {t("coach.cancel")}
                            </button>
                          </div>
                          <input
                            type="text"
                            value={foodSearchQuery}
                            onChange={(e) => setFoodSearchQuery(e.target.value)}
                            placeholder={t("coach.searchCatalogPlaceholder")}
                            className="w-full rounded-lg border border-zinc-700 bg-[#161B22] px-3 py-1.5 text-xs text-zinc-100 focus:border-[#5BE584] focus:outline-none"
                            autoFocus
                          />
                          <div className="max-h-36 overflow-y-auto divide-y divide-zinc-800 text-xs">
                            {foodSearchResult?.foods.map((food) => {
                              const foodName = i18n.language === "ar" && food.nameAr ? food.nameAr : food.name;
                              return (
                                <button
                                  type="button"
                                  key={food.id}
                                  onClick={() => handleAddFoodToMeal(meal.id, food)}
                                  className="w-full text-left rtl:text-right p-2 hover:bg-zinc-800/50 flex justify-between items-center"
                                >
                                  <span className="font-medium text-zinc-200">{foodName}</span>
                                  <span className="text-zinc-400">
                                    {food.calories} kcal ({food.servingSize} {food.servingUnit})
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setActiveMealIdForSearch(meal.id)}
                          className="w-full rounded-lg border border-dashed border-zinc-700 py-1.5 text-xs text-zinc-400 hover:text-[#5BE584] hover:border-[#5BE584] flex items-center justify-center gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          <span>{t("coach.addFoodToMeal", { name: meal.name })}</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-zinc-400 hover:text-zinc-200"
              >
                {t("coach.cancel")}
              </button>
              <button
                type="submit"
                disabled={isAssigning}
                className="flex items-center gap-2 rounded-xl bg-[#5BE584] px-6 py-2.5 text-xs font-bold text-zinc-950 hover:bg-[#4dd374] disabled:opacity-50 transition-all shadow-md shadow-[#5BE584]/20"
              >
                {isAssigning ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t("coach.assigningPlanBtn")}</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>{t("coach.assignPlanBtn")}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CoachNutritionMemberPage;