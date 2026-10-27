// src/features/nutrition/pages/NutritionPlanPage.tsx
import React from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Sparkles,
  UserCheck,
  Flame,
  ArrowRight,
  ShieldCheck,
  Loader2,
  Utensils,
} from "lucide-react";
import { useNutritionOverview } from "../hooks/useNutrition";
import { NutritionNavTabs } from "../components/NutritionNavTabs";

export const NutritionPlanPage: React.FC = () => {
  const { data: overview, isLoading } = useNutritionOverview();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }

  const plan = overview?.plan;

  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-[1300px] flex-col gap-6">
        <NutritionNavTabs onboardingCompleted={overview?.onboardingCompleted} />

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
              <span>Personalized Meal Plan Schedule</span>
              {plan && (
                <span className="rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-3 py-0.5 text-xs font-semibold text-[#5BE584]">
                  Version {plan.version}
                </span>
              )}
            </h1>
            <p className="text-sm text-zinc-400 mt-0.5">
              Structured meal schedule tailored to your daily caloric and macronutrient targets
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/nutrition/onboarding"
              className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-[#161B22] px-4 py-2 text-xs font-semibold text-zinc-200 hover:border-[#5BE584] hover:text-[#5BE584] transition-all"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Regenerate / Adjust Plan</span>
            </Link>
          </div>
        </div>

        {!plan ? (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-12 text-center space-y-4">
            <Utensils className="mx-auto h-12 w-12 text-zinc-600" />
            <h2 className="text-xl font-bold text-zinc-100">No Active Meal Plan</h2>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              You haven&apos;t generated an active nutrition plan yet. Complete the quick onboarding
              assessment to calculate your daily targets and generate your first meal plan.
            </p>
            <Link
              to="/nutrition/onboarding"
              className="inline-flex items-center gap-2 rounded-xl bg-[#5BE584] px-6 py-2.5 text-sm font-bold text-zinc-950 hover:bg-[#4dd374] transition-all shadow-md shadow-[#5BE584]/20"
            >
              <span>Start Assessment</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Top Plan Targets Summary Card */}
            <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-xl font-extrabold text-zinc-100">{plan.name}</h2>
                    <span className="rounded-md bg-zinc-800/80 px-2.5 py-0.5 text-xs text-zinc-300 font-mono">
                      {plan.source === "COACH_ASSIGNED" ? "Coach Assigned" : "Self-Guided"}
                    </span>
                  </div>
                  {plan.coach && (
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Coached by {plan.coach.name} ({plan.coach.email})</span>
                    </div>
                  )}
                  {plan.notes && (
                    <p className="text-xs text-zinc-400 mt-1 italic">&ldquo;{plan.notes}&rdquo;</p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-[#161B22] p-3 text-center border border-zinc-800/80">
                    <div className="text-[11px] text-zinc-400">Total Plan Calories</div>
                    <div className="text-xl font-black text-amber-400 mt-0.5">
                      {plan.totalPlanCalories}{" "}
                      <span className="text-xs font-normal text-zinc-500">kcal</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Targets vs Plan Total Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-[#161B22] p-3.5 border border-zinc-800 text-center">
                  <div className="text-xs text-zinc-400">Target Calories</div>
                  <div className="text-lg font-extrabold text-amber-400 mt-0.5">
                    {plan.targetCalories} kcal
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Plan: {plan.totalPlanCalories} kcal
                  </div>
                </div>

                <div className="rounded-xl bg-[#161B22] p-3.5 border border-zinc-800 text-center">
                  <div className="text-xs text-zinc-400">Target Protein</div>
                  <div className="text-lg font-extrabold text-emerald-400 mt-0.5">
                    {plan.targetProteinG} g
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Plan: {plan.totalPlanProteinG} g
                  </div>
                </div>

                <div className="rounded-xl bg-[#161B22] p-3.5 border border-zinc-800 text-center">
                  <div className="text-xs text-zinc-400">Target Carbs</div>
                  <div className="text-lg font-extrabold text-blue-400 mt-0.5">
                    {plan.targetCarbsG} g
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Plan: {plan.totalPlanCarbsG} g
                  </div>
                </div>

                <div className="rounded-xl bg-[#161B22] p-3.5 border border-zinc-800 text-center">
                  <div className="text-xs text-zinc-400">Target Fat</div>
                  <div className="text-lg font-extrabold text-purple-400 mt-0.5">
                    {plan.targetFatG} g
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Plan: {plan.totalPlanFatG} g
                  </div>
                </div>
              </div>
            </div>

            {/* Individual Meals List */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-100">Meal Schedule & Prescribed Foods</h3>
              <div className="space-y-4">
                {plan.meals.map((meal) => (
                  <div
                    key={meal.id}
                    className="rounded-2xl border border-zinc-800 bg-[#101418] p-5 shadow-sm space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800/60 pb-3">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <h4 className="text-base font-bold text-zinc-100">{meal.name}</h4>
                          <span className="rounded-lg bg-zinc-800/80 px-2 py-0.5 text-xs text-zinc-300">
                            {meal.mealType}
                          </span>
                        </div>
                        {meal.suggestedTime && (
                          <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                            <Clock className="h-3 w-3 text-zinc-500" />
                            <span>Suggested Window: {meal.suggestedTime}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-bold text-amber-400 text-sm">
                          {meal.totalCalories} kcal
                        </span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300">P: {meal.totalProteinG}g</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300">C: {meal.totalCarbsG}g</span>
                        <span className="text-zinc-500">•</span>
                        <span className="text-zinc-300">F: {meal.totalFatG}g</span>
                      </div>
                    </div>

                    {/* Meal Food Items Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[500px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-zinc-800/60 text-zinc-400 uppercase tracking-wider text-[10px]">
                            <th className="pb-2">Food Item</th>
                            <th className="pb-2">Prescribed Portion</th>
                            <th className="pb-2 text-right">Calories</th>
                            <th className="pb-2 text-right">Protein</th>
                            <th className="pb-2 text-right">Carbs</th>
                            <th className="pb-2 text-right">Fat</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800/40">
                          {meal.items.map((it) => (
                            <tr key={it.id} className="hover:bg-zinc-800/20">
                              <td className="py-2.5 font-medium text-zinc-200">{it.foodName}</td>
                              <td className="py-2.5 text-zinc-400">
                                {it.quantity} {it.unit}
                              </td>
                              <td className="py-2.5 text-right font-semibold text-amber-400">
                                {it.calories}
                              </td>
                              <td className="py-2.5 text-right text-emerald-400">{it.protein}g</td>
                              <td className="py-2.5 text-right text-blue-400">{it.carbs}g</td>
                              <td className="py-2.5 text-right text-purple-400">{it.fat}g</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NutritionPlanPage;
