// src/features/nutrition/types/nutrition.types.ts

export type MealType =
  | "BREAKFAST"
  | "MORNING_SNACK"
  | "LUNCH"
  | "AFTERNOON_SNACK"
  | "DINNER"
  | "EVENING_SNACK"
  | "PRE_WORKOUT"
  | "POST_WORKOUT";

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
  | "EXTRA_ACTIVE"
  | "EXTREMELY_ACTIVE";

export type DietaryPreference =
  | "STANDARD"
  | "VEGETARIAN"
  | "VEGAN"
  | "PESCATARIAN"
  | "KETO"
  | "PALEO";

export type TargetPace = "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE";

export interface FoodItem {
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
  isCustom?: boolean;
  userId?: string | null;
  source?: string | null;
}

export interface CreateCustomFoodPayload {
  name: string;
  nameAr?: string;
  category: string;
  servingUnit: string;
  servingSize: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  allergens?: string[];
}

export type UpdateCustomFoodPayload = Partial<CreateCustomFoodPayload>;

export interface NutritionPlanMealItem {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface NutritionPlanMeal {
  id: string;
  name: string;
  mealType: MealType;
  suggestedTime?: string | null;
  order: number;
  targetCalories?: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  items: NutritionPlanMealItem[];
}

export interface NutritionPlan {
  id: string;
  name: string;
  source: "SELF_GUIDED" | "COACH_ASSIGNED";
  version: number;
  notes?: string | null;
  activatedAt?: string | null;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  totalPlanCalories: number;
  totalPlanProteinG: number;
  totalPlanCarbsG: number;
  totalPlanFatG: number;
  coach?: {
    id: string;
    name: string;
    email: string;
  } | null;
  meals: NutritionPlanMeal[];
}

export interface FoodLogItem {
  id: string;
  mealType: MealType;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  notes?: string | null;
  loggedAt: string;
}

export interface DailyIntakeMetrics {
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  loggedCalories: number;
  loggedProteinG: number;
  loggedCarbsG: number;
  loggedFatG: number;
  remainingCalories: number;
  proteinProgressPct: number;
  carbsProgressPct: number;
  fatProgressPct: number;
  calorieProgressPct: number;
}

export interface NutritionOverview {
  date: string;
  hasActivePlan: boolean;
  onboardingCompleted: boolean;
  plan: NutritionPlan | null;
  intake: DailyIntakeMetrics;
  todayLogs: FoodLogItem[];
  logsByMealType: Record<string, FoodLogItem[]>;
}

export interface NutritionProfile {
  id: string;
  userId: string;
  age: number;
  gender: "MALE" | "FEMALE";
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  dailyActivityNotes?: string | null;
  trainingDaysPerWeek: number;
  trainingType?: string | null;
  goal: NutritionGoal;
  targetPace: TargetPace;
  preferredMealsCount: number;
  dietaryPreference: DietaryPreference;
  allergies: string[];
  excludedFoods: string[];
  hasMedicalClearance: boolean;
  safetyScreeningNotes?: string | null;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

export interface SuggestedMeasurement {
  weightKg: number;
  heightCm?: number | null;
  measuredAt: string;
  daysOld: number;
  isRecent: boolean;
}

export interface MemberProfileResponse {
  profile: NutritionProfile | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  suggestedMeasurement: SuggestedMeasurement | null;
}

export interface OnboardingPayload {
  age: number;
  gender: "MALE" | "FEMALE";
  heightCm: number;
  currentWeightKg: number;
  activityLevel: ActivityLevel;
  dailyActivityNotes?: string;
  trainingDaysPerWeek?: number;
  trainingType?: string;
  goal: NutritionGoal;
  targetPace?: TargetPace;
  preferredMealsCount?: number;
  dietaryPreference?: DietaryPreference;
  allergies?: string[];
  excludedFoods?: string[];
  hasMedicalClearance?: boolean;
  safetyScreeningNotes?: string;
  activateImmediately?: boolean;
}

export interface LogFoodPayload {
  foodId: string;
  date: string;
  mealType: MealType;
  quantity: number;
  unit?: string;
  notes?: string;
}

export interface UpdateFoodLogPayload {
  quantity?: number;
  mealType?: MealType;
  notes?: string;
}

export interface NutritionHistoryDay {
  date: string;
  isLogged: boolean;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  targetCalories: number;
  targetProtein: number;
  adherencePct: number;
}

export interface NutritionHistoryResponse {
  timeline: NutritionHistoryDay[];
  loggedDaysCount: number;
  totalDays: number;
  loggingConsistencyPct: number;
  avgCaloriesOnLoggedDays: number;
  activePlanTargets: {
    calories: number;
    protein: number;
  };
}

export interface CoachEligibleMember {
  memberId: string;
  name: string;
  email: string;
  goal: string;
  dietaryPreference: string;
  hasActivePlan: boolean;
  activePlan: {
    id: string;
    name: string;
    source: string;
    targetCalories: number;
    targetProteinG: number;
  } | null;
  lastLoggedAt: string | null;
}

export interface CoachMemberNutritionView {
  overview: NutritionOverview;
  history: NutritionHistoryResponse;
  profile: NutritionProfile | null;
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  suggestedMeasurement: SuggestedMeasurement | null;
}

export interface CreateCoachPlanPayload {
  memberId: string;
  name: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  notes?: string;
  meals: Array<{
    name: string;
    mealType: MealType;
    suggestedTime?: string;
    order: number;
    items: Array<{
      foodId: string;
      quantity: number;
      unit?: string;
    }>;
  }>;
}
