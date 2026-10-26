// src/types/nutrition.types.ts

export type Gender = "MALE" | "FEMALE";

export type NutritionGoal =
  | "FAT_LOSS"
  | "MAINTENANCE"
  | "MUSCLE_GAIN"
  | "SPORTS_PERFORMANCE";

export type ActivityLevel =
  | "SEDENTARY"
  | "LIGHTLY_ACTIVE"
  | "MODERATELY_ACTIVE"
  | "VERY_ACTIVE"
  | "EXTRA_ACTIVE";

export type PlanSource = "SELF_GUIDED" | "COACH_ASSIGNED";

export type PlanStatus = "ACTIVE" | "INACTIVE" | "SUPERSEDED" | "DRAFT";

export type DietaryPreference =
  | "STANDARD"
  | "VEGETARIAN"
  | "VEGAN"
  | "PESCATARIAN"
  | "KETO"
  | "PALEO"
  | "MEDITERRANEAN"
  | "HIGH_PROTEIN";

export type MealType =
  | "BREAKFAST"
  | "MORNING_SNACK"
  | "LUNCH"
  | "AFTERNOON_SNACK"
  | "DINNER"
  | "EVENING_SNACK"
  | "PRE_WORKOUT"
  | "POST_WORKOUT";

export type TargetPace = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";

export interface MacroNutrients {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  fiberG?: number;
}

export interface CalculationInput {
  age: number;
  gender: Gender;
  weightKg: number;
  heightCm: number;
  activityLevel: ActivityLevel;
  goal: NutritionGoal;
  targetPace?: TargetPace;
  preferredMealsCount?: number;
}

export interface CalculationResult {
  bmr: number;
  tdee: number;
  activityMultiplier: number;
  goal: NutritionGoal;
  calorieAdjustment: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  macroPercentages: {
    proteinPct: number;
    carbsPct: number;
    fatPct: number;
  };
  formulaVersion: string;
  assumptions: string;
  disclaimer: string;
  safetyAdvisory?: string | null;
}

export interface FoodItemDto {
  id: string;
  name: string;
  nameAr?: string | null;
  category: string;
  servingUnit: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number | null;
  sugar?: number | null;
  sodium?: number | null;
  allergens: string[];
  isVerified: boolean;
  source?: string | null;
}

export interface FoodNutrientCalculation {
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface MealItemInput {
  foodId: string;
  quantity: number;
  unit: string;
}

export interface MealInput {
  name: string;
  mealType: MealType;
  suggestedTime?: string;
  items: MealItemInput[];
}

export interface PlanGenerationOptions {
  dietaryPreference?: DietaryPreference;
  allergies?: string[];
  excludedFoods?: string[];
  preferredMealsCount?: number;
}

export interface DailyNutritionSummary {
  date: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  loggedCalories: number;
  loggedProteinG: number;
  loggedCarbsG: number;
  loggedFatG: number;
  remainingCalories: number;
  calorieAdherencePct: number;
  isLoggedDay: boolean;
  mealCounts: Record<string, number>;
}
