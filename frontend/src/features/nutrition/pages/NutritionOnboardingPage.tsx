// src/features/nutrition/pages/NutritionOnboardingPage.tsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Scale,
  ShieldCheck,
  Flame,
  Activity,
  HeartHandshake,
  UtensilsCrossed,
  Info,
  Loader2,
} from "lucide-react";
import { useNutritionProfile, useCompleteOnboarding } from "../hooks/useNutrition";
import { NutritionNavTabs } from "../components/NutritionNavTabs";
import type {
  ActivityLevel,
  NutritionGoal,
  TargetPace,
  DietaryPreference,
} from "../types/nutrition.types";
const ALLERGEN_OPTIONS = [
  { id: "dairy", label: "Dairy / Lactose" },
  { id: "eggs", label: "Eggs" },
  { id: "peanuts", label: "Peanuts" },
  { id: "tree_nuts", label: "Tree Nuts (Almonds, Walnuts)" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "gluten", label: "Wheat / Gluten" },
  { id: "soy", label: "Soy" },
];
export const NutritionOnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: profileData, isLoading: isLoadingProfile } = useNutritionProfile();
  const { mutate: completeOnboardingMutation, isPending: isSaving } = useCompleteOnboarding();
  const [currentStep, setCurrentStep] = useState(1);
  // Form State
  const [age, setAge] = useState<number>(28);
  const [gender, setGender] = useState<"MALE" | "FEMALE">("MALE");
  const [heightCm, setHeightCm] = useState<number>(175);
  const [currentWeightKg, setCurrentWeightKg] = useState<number>(75);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("MODERATELY_ACTIVE");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState<number>(4);
  const [trainingType, setTrainingType] = useState<string>("Hypertrophy & Strength");
  const [goal, setGoal] = useState<NutritionGoal>("FAT_LOSS");
  const [targetPace, setTargetPace] = useState<TargetPace>("MODERATE");
  const [preferredMealsCount, setPreferredMealsCount] = useState<number>(3);
  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>("STANDARD");
  const [allergies, setAllergies] = useState<string[]>([]);
  const [hasMedicalClearance, setHasMedicalClearance] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  // Auto pre-populate from profile or latest measurement
  useEffect(() => {
    if (profileData) {
      if (profileData.suggestedMeasurement) {
        setCurrentWeightKg(profileData.suggestedMeasurement.weightKg);
        if (profileData.suggestedMeasurement.heightCm) {
          setHeightCm(profileData.suggestedMeasurement.heightCm);
        }
      }
      if (profileData.profile) {
        const p = profileData.profile;
        setAge(p.age);
        setGender(p.gender);
        setHeightCm(p.heightCm);
        setCurrentWeightKg(p.currentWeightKg);
        setActivityLevel(p.activityLevel);
        setTrainingDaysPerWeek(p.trainingDaysPerWeek);
        setGoal(p.goal);
        setTargetPace(p.targetPace);
        setPreferredMealsCount(p.preferredMealsCount);
        setDietaryPreference(p.dietaryPreference);
        setAllergies(p.allergies || []);
      }
    }
  }, [profileData]);
  const toggleAllergen = (allergenId: string) => {
    setAllergies((prev) =>
      prev.includes(allergenId)
        ? prev.filter((a) => a !== allergenId)
        : [...prev, allergenId],
    );
  };
  // Live Scientific Target Preview (Mifflin–St Jeor)
  const calculationPreview = useMemo(() => {
    if (!currentWeightKg || !heightCm || !age) {
      return null;
    }
    const bmr =
      gender === "MALE"
        ? Math.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age + 5)
        : Math.round(10 * currentWeightKg + 6.25 * heightCm - 5 * age - 161);
    const multipliers: Record<ActivityLevel, number> = {
      SEDENTARY: 1.2,
      LIGHTLY_ACTIVE: 1.375,
      MODERATELY_ACTIVE: 1.55,
      VERY_ACTIVE: 1.725,
      EXTREMELY_ACTIVE: 1.9,
    };
    const tdee = Math.round(bmr * multipliers[activityLevel]);
    let adjustmentPct = 0;
    if (goal === "FAT_LOSS") {
      adjustmentPct = targetPace === "CONSERVATIVE" ? -0.15 : targetPace === "AGGRESSIVE" ? -0.25 : -0.2;
    } else if (goal === "MUSCLE_GAIN") {
      adjustmentPct = targetPace === "CONSERVATIVE" ? 0.08 : targetPace === "AGGRESSIVE" ? 0.15 : 0.12;
    } else if (goal === "SPORTS_PERFORMANCE") {
      adjustmentPct = 0.05;
    }
    let targetCalories = Math.round(tdee * (1 + adjustmentPct));
    const floor = gender === "MALE" ? 1500 : 1200;
    let floorApplied = false;
    if (targetCalories < floor) {
      targetCalories = floor;
      floorApplied = true;
    }
    const proteinG = Math.round(currentWeightKg * (goal === "FAT_LOSS" || goal === "MUSCLE_GAIN" ? 2.0 : 1.8));
    const fatG = Math.round((targetCalories * 0.25) / 9);
    const carbsG = Math.max(50, Math.round((targetCalories - (proteinG * 4 + fatG * 9)) / 4));
    return {
      bmr,
      tdee,
      targetCalories,
      floorApplied,
      floor,
      proteinG,
      carbsG,
      fatG,
    };
  }, [age, gender, heightCm, currentWeightKg, activityLevel, goal, targetPace]);
  const handleNext = () => {
    setErrorMsg(null);
    if (currentStep === 1) {
      if (!age || age < 12 || age > 120) {
        setErrorMsg("Please enter an age between 12 and 120.");
        return;
      }
      if (!heightCm || heightCm < 50 || heightCm > 300) {
        setErrorMsg("Please enter a valid height in cm.");
        return;
      }
      if (!currentWeightKg || currentWeightKg < 25 || currentWeightKg > 400) {
        setErrorMsg("Please enter a valid weight in kg.");
        return;
      }
    }
    setCurrentStep((prev) => Math.min(5, prev + 1));
  };
  const handleBack = () => {
    setErrorMsg(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };
  const handleComplete = () => {
    setErrorMsg(null);
    completeOnboardingMutation(
      {
        age,
        gender,
        heightCm,
        currentWeightKg,
        activityLevel,
        trainingDaysPerWeek,
        trainingType,
        goal,
        targetPace,
        preferredMealsCount,
        dietaryPreference,
        allergies,
        hasMedicalClearance,
        activateImmediately: true,
      },
      {
        onSuccess: () => {
          navigate("/nutrition");
        },
        onError: (err: any) => {
          setErrorMsg(err.response?.data?.message || err.message || "Failed to generate nutrition plan.");
        },
      },
    );
  };
  if (isLoadingProfile) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center bg-[#090B0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5BE584]" />
      </div>
    );
  }
  const suggested = profileData?.suggestedMeasurement;
  return (
    <div className="min-h-full w-full bg-[#090B0F] p-4 md:p-6 lg:p-8 pb-24 text-zinc-100">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <NutritionNavTabs onboardingCompleted={profileData?.profile?.onboardingCompleted} />
        {/* Wizard Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#5BE584]/15 border border-[#5BE584]/30 px-3 py-1 text-xs font-semibold text-[#5BE584]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Deterministic Energy Assessment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-100">
            Personalized Nutrition Calculator
          </h1>
          <p className="text-xs md:text-sm text-zinc-400 max-w-lg mx-auto">
            Science-backed Mifflin–St Jeor energy expenditure, optimal macro distributions, and tailored meal planning.
          </p>
        </div>
        {/* Step Indicator Progress */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          {[
            { num: 1, label: "Metrics" },
            { num: 2, label: "Activity" },
            { num: 3, label: "Goal" },
            { num: 4, label: "Diet & Allergies" },
            { num: 5, label: "Review & Activate" },
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-1.5 flex-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentStep === s.num
                    ? "bg-[#5BE584] text-zinc-950 ring-4 ring-[#5BE584]/20"
                    : currentStep > s.num
                      ? "bg-[#5BE584]/20 text-[#5BE584] border border-[#5BE584]/40"
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                }`}
              >
                {currentStep > s.num ? <Check className="h-4 w-4" /> : s.num}
              </div>
              <span
                className={`text-[11px] font-medium hidden sm:block ${
                  currentStep === s.num ? "text-zinc-100" : "text-zinc-500"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
            {errorMsg}
          </div>
        )}
        {/* Step 1: Body Metrics */}
        {currentStep === 1 && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 space-y-6 shadow-xl">
            {suggested && (
              <div className="rounded-xl border border-[#5BE584]/30 bg-[#5BE584]/10 p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <Scale className="h-5 w-5 text-[#5BE584] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-[#5BE584]">
                      Pre-filled from Recent Body Measurement
                    </h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Found {suggested.weightKg} kg {suggested.heightCm ? `• ${suggested.heightCm} cm` : ""}{" "}
                      recorded {suggested.daysOld === 0 ? "today" : `${suggested.daysOld} days ago`}. You can edit below if needed.
                    </p>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Gender */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                  Biological Gender (Required for BMR Equation)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["MALE", "FEMALE"] as const).map((g) => (
                    <button
                      type="button"
                      key={g}
                      onClick={() => setGender(g)}
                      className={`rounded-xl py-3 text-sm font-bold border transition-all ${
                        gender === g
                          ? "bg-[#5BE584]/20 text-[#5BE584] border-[#5BE584]"
                          : "bg-[#161B22] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                      }`}
                    >
                      {g === "MALE" ? "Male (+5 kcal constant)" : "Female (-161 kcal constant)"}
                    </button>
                  ))}
                </div>
              </div>
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Age (Years)
                </label>
                <input
                  type="number"
                  min="12"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-4 py-2.5 text-sm text-zinc-100 font-semibold focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              {/* Height */}
              <div>
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="50"
                  max="300"
                  value={heightCm}
                  onChange={(e) => setHeightCm(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-4 py-2.5 text-sm text-zinc-100 font-semibold focus:border-[#5BE584] focus:outline-none"
                />
              </div>
              {/* Weight */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
                  Current Body Weight (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="25"
                  max="400"
                  value={currentWeightKg}
                  onChange={(e) => setCurrentWeightKg(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-zinc-800 bg-[#161B22] px-4 py-2.5 text-sm text-zinc-100 font-semibold focus:border-[#5BE584] focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}
        {/* Step 2: Activity & Training */}
        {currentStep === 2 && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 space-y-6 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Daily Non-Exercise Activity Level (NEAT)
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    level: "SEDENTARY" as ActivityLevel,
                    label: "Sedentary (1.2x)",
                    desc: "Desk job, little to no intentional daily movement",
                  },
                  {
                    level: "LIGHTLY_ACTIVE" as ActivityLevel,
                    label: "Lightly Active (1.375x)",
                    desc: "Light daily walking, light physical tasks 1–3 days/wk",
                  },
                  {
                    level: "MODERATELY_ACTIVE" as ActivityLevel,
                    label: "Moderately Active (1.55x)",
                    desc: "Moderate exercise or active job 3–5 days/wk (Recommended for gym lifters)",
                  },
                  {
                    level: "VERY_ACTIVE" as ActivityLevel,
                    label: "Very Active (1.725x)",
                    desc: "Hard training, high physical output 6–7 days/wk",
                  },
                  {
                    level: "EXTREMELY_ACTIVE" as ActivityLevel,
                    label: "Extremely Active (1.9x)",
                    desc: "Daily heavy manual labor or competitive two-a-day athletics",
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.level}
                    onClick={() => setActivityLevel(item.level)}
                    className={`w-full text-left rounded-xl p-3.5 border transition-all ${
                      activityLevel === item.level
                        ? "bg-[#5BE584]/15 border-[#5BE584] text-zinc-100"
                        : "bg-[#161B22] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-semibold text-sm text-zinc-100">{item.label}</div>
                    <div className="text-xs text-zinc-400 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Training Frequency */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Gym Training Days Per Week
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((days) => (
                  <button
                    type="button"
                    key={days}
                    onClick={() => setTrainingDaysPerWeek(days)}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-all ${
                      trainingDaysPerWeek === days
                        ? "bg-[#5BE584] text-zinc-950 border-[#5BE584]"
                        : "bg-[#161B22] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {days}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 3: Goal & Pace */}
        {currentStep === 3 && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 space-y-6 shadow-xl">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-3">
                Primary Nutritional Objective
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    key: "FAT_LOSS" as NutritionGoal,
                    title: "Fat Loss (Caloric Deficit)",
                    desc: "Reduce body fat while preserving lean muscle mass",
                  },
                  {
                    key: "MAINTENANCE" as NutritionGoal,
                    title: "Maintenance (Equilibrium)",
                    desc: "Maintain body composition and optimize daily energy",
                  },
                  {
                    key: "MUSCLE_GAIN" as NutritionGoal,
                    title: "Muscle Gain (Caloric Surplus)",
                    desc: "Fuel progressive overload and hypertrophy with controlled surplus",
                  },
                  {
                    key: "SPORTS_PERFORMANCE" as NutritionGoal,
                    title: "Sports Performance",
                    desc: "High glycogen replenishment for intense athletic demands",
                  },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.key}
                    onClick={() => setGoal(item.key)}
                    className={`text-left rounded-xl p-4 border transition-all ${
                      goal === item.key
                        ? "bg-[#5BE584]/15 border-[#5BE584] text-zinc-100"
                        : "bg-[#161B22] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-bold text-sm text-zinc-100">{item.title}</div>
                    <div className="text-xs text-zinc-400 mt-1">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* Target Pace */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Adjustment Pace & Aggressiveness
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { pace: "CONSERVATIVE" as TargetPace, label: "Conservative", delta: "±10–15%" },
                  { pace: "MODERATE" as TargetPace, label: "Moderate (Recommended)", delta: "±20%" },
                  { pace: "AGGRESSIVE" as TargetPace, label: "Aggressive", delta: "±25%" },
                ].map((p) => (
                  <button
                    type="button"
                    key={p.pace}
                    onClick={() => setTargetPace(p.pace)}
                    className={`rounded-xl p-3 border text-center transition-all ${
                      targetPace === p.pace
                        ? "bg-[#5BE584]/20 border-[#5BE584] text-[#5BE584]"
                        : "bg-[#161B22] border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <div className="font-semibold text-xs text-zinc-200">{p.label}</div>
                    <div className="text-[11px] text-zinc-400 mt-0.5">{p.delta}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {/* Step 4: Dietary Preference & Allergies */}
        {currentStep === 4 && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 space-y-6 shadow-xl">
            {/* Preferred Meals Count */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Preferred Meals Per Day
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[3, 4, 5].map((cnt) => (
                  <button
                    type="button"
                    key={cnt}
                    onClick={() => setPreferredMealsCount(cnt)}
                    className={`rounded-xl py-3 border font-semibold text-sm text-center transition-all ${
                      preferredMealsCount === cnt
                        ? "bg-[#5BE584] text-zinc-950 border-[#5BE584]"
                        : "bg-[#161B22] text-zinc-300 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {cnt} Meals {cnt === 3 ? "(Standard)" : cnt === 4 ? "(+ 1 Snack)" : "(+ 2 Snacks)"}
                  </button>
                ))}
              </div>
            </div>
            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Dietary Preference
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {(
                  [
                    "STANDARD",
                    "VEGETARIAN",
                    "VEGAN",
                    "PESCATARIAN",
                    "KETO",
                    "PALEO",
                  ] as DietaryPreference[]
                ).map((pref) => (
                  <button
                    type="button"
                    key={pref}
                    onClick={() => setDietaryPreference(pref)}
                    className={`rounded-xl py-2.5 text-xs font-semibold border transition-all ${
                      dietaryPreference === pref
                        ? "bg-[#5BE584]/20 border-[#5BE584] text-[#5BE584]"
                        : "bg-[#161B22] text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    {pref}
                  </button>
                ))}
              </div>
            </div>
            {/* Common Allergens to Exclude */}
            <div>
              <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2">
                Allergies & Excluded Ingredients
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALLERGEN_OPTIONS.map((item) => {
                  const isChecked = allergies.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggleAllergen(item.id)}
                      className={`rounded-xl px-3 py-2 text-xs font-medium border text-center transition-all ${
                        isChecked
                          ? "bg-red-500/20 text-red-300 border-red-500/50"
                          : "bg-[#161B22] text-zinc-400 border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {/* Health Disclaimer Check */}
            <div className="rounded-xl border border-zinc-800 bg-[#161B22] p-4 flex items-center gap-3">
              <input
                type="checkbox"
                id="clearanceCheck"
                checked={hasMedicalClearance}
                onChange={(e) => setHasMedicalClearance(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-700 text-[#5BE584] focus:ring-[#5BE584]"
              />
              <label htmlFor="clearanceCheck" className="text-xs text-zinc-300">
                I confirm that I am medically cleared for physical training and nutritional adjustments.
              </label>
            </div>
          </div>
        )}
        {/* Step 5: Review & Activate */}
        {currentStep === 5 && calculationPreview && (
          <div className="rounded-2xl border border-zinc-800 bg-[#101418] p-6 space-y-6 shadow-xl">
            <div className="flex items-center gap-2 text-[#5BE584] text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="h-4 w-4" />
              <span>Calculated Target Summary</span>
            </div>
            {/* Macro Cards Preview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="rounded-xl bg-[#161B22] p-4 text-center border border-zinc-800">
                <div className="text-xs text-zinc-400">Target Calories</div>
                <div className="text-2xl font-black text-amber-400 mt-1">
                  {calculationPreview.targetCalories}
                </div>
                <div className="text-[10px] text-zinc-500">kcal / day</div>
              </div>
              <div className="rounded-xl bg-[#161B22] p-4 text-center border border-zinc-800">
                <div className="text-xs text-zinc-400">Protein</div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {calculationPreview.proteinG}g
                </div>
                <div className="text-[10px] text-zinc-500">~2.0 g/kg bodyweight</div>
              </div>
              <div className="rounded-xl bg-[#161B22] p-4 text-center border border-zinc-800">
                <div className="text-xs text-zinc-400">Carbohydrates</div>
                <div className="text-2xl font-black text-blue-400 mt-1">
                  {calculationPreview.carbsG}g
                </div>
                <div className="text-[10px] text-zinc-500">Energy & glycogen</div>
              </div>
              <div className="rounded-xl bg-[#161B22] p-4 text-center border border-zinc-800">
                <div className="text-xs text-zinc-400">Dietary Fat</div>
                <div className="text-2xl font-black text-purple-400 mt-1">
                  {calculationPreview.fatG}g
                </div>
                <div className="text-[10px] text-zinc-500">~25% of energy</div>
              </div>
            </div>
            {/* Scientific Breakdown Details */}
            <div className="rounded-xl bg-[#161B22] p-4 border border-zinc-800/80 space-y-2 text-xs text-zinc-300">
              <div className="flex justify-between">
                <span className="text-zinc-400">Basal Metabolic Rate (BMR):</span>
                <span className="font-semibold text-zinc-200">{calculationPreview.bmr} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Total Daily Energy Expenditure (TDEE):</span>
                <span className="font-semibold text-zinc-200">{calculationPreview.tdee} kcal</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Meal Structure:</span>
                <span className="font-semibold text-zinc-200">{preferredMealsCount} meals/day • {dietaryPreference}</span>
              </div>
              {calculationPreview.floorApplied && (
                <div className="text-amber-400 text-xs mt-2 pt-2 border-t border-zinc-800">
                  Note: Safe caloric floor ({calculationPreview.floor} kcal) applied to preserve hormonal health.
                </div>
              )}
            </div>
            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/50 p-3.5 text-[11px] text-zinc-400 flex items-start gap-2.5">
              <Info className="h-4 w-4 text-zinc-500 shrink-0 mt-0.5" />
              <span>
                Standardized equations provide deterministic estimates. Individual metabolic adaptation and
                daily physical expenditure may vary. Always consult with a qualified sports dietitian for
                medical nutrition therapy.
              </span>
            </div>
          </div>
        )}
        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-2">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-[#101418] px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}
          {currentStep < 5 ? (
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-2 rounded-xl bg-[#5BE584] px-5 py-2.5 text-sm font-bold text-zinc-950 hover:bg-[#4dd374] transition-all shadow-md shadow-[#5BE584]/15"
            >
              <span>Next Step</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleComplete}
              disabled={isSaving}
              className="flex items-center gap-2 rounded-xl bg-[#5BE584] px-6 py-3 text-sm font-black text-zinc-950 hover:bg-[#4dd374] disabled:opacity-50 transition-all shadow-lg shadow-[#5BE584]/20"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Generating Meal Plan...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Generate & Activate My Plan</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default NutritionOnboardingPage;