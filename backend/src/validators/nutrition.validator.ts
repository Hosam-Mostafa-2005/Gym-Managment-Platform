import { z } from "zod";

const MealTypeEnum = z.enum([
  "BREAKFAST",
  "MORNING_SNACK",
  "LUNCH",
  "AFTERNOON_SNACK",
  "DINNER",
  "EVENING_SNACK",
  "PRE_WORKOUT",
  "POST_WORKOUT",
]);

const NutritionGoalEnum = z.enum([
  "FAT_LOSS",
  "MAINTENANCE",
  "MUSCLE_GAIN",
  "SPORTS_PERFORMANCE",
]);

const ActivityLevelEnum = z.enum([
  "SEDENTARY",
  "LIGHTLY_ACTIVE",
  "MODERATELY_ACTIVE",
  "VERY_ACTIVE",
  "EXTREMELY_ACTIVE",
]);

const DietaryPreferenceEnum = z.enum([
  "STANDARD",
  "VEGETARIAN",
  "VEGAN",
  "PESCATARIAN",
  "KETO",
  "PALEO",
]);

const TargetPaceEnum = z.enum(["CONSERVATIVE", "MODERATE", "AGGRESSIVE"]);

export const onboardingSchema = z.object({
  body: z.object({
    age: z.coerce.number().int().min(12, "Age must be at least 12").max(120, "Age must be at most 120"),
    gender: z.enum(["MALE", "FEMALE"]),
    heightCm: z.coerce.number().positive("Height must be positive").min(50).max(300),
    currentWeightKg: z.coerce.number().positive("Weight must be positive").min(25).max(400),
    activityLevel: ActivityLevelEnum,
    dailyActivityNotes: z.string().trim().max(500).optional(),
    trainingDaysPerWeek: z.coerce.number().int().min(0).max(7).optional().default(3),
    trainingType: z.string().trim().max(100).optional(),
    goal: NutritionGoalEnum,
    targetPace: TargetPaceEnum.optional().default("MODERATE"),
    preferredMealsCount: z.coerce.number().int().min(3).max(5).optional().default(3),
    dietaryPreference: DietaryPreferenceEnum.optional().default("STANDARD"),
    allergies: z.array(z.string().trim()).optional().default([]),
    excludedFoods: z.array(z.string().trim()).optional().default([]),
    hasMedicalClearance: z.boolean().optional().default(true),
    safetyScreeningNotes: z.string().trim().max(500).optional(),
    activateImmediately: z.boolean().optional().default(true),
  }),
});

export const logFoodSchema = z.object({
  body: z.object({
    foodId: z.string().min(1, "Food ID is required"),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be formatted as YYYY-MM-DD"),
    mealType: MealTypeEnum,
    quantity: z.coerce.number().positive("Quantity must be greater than zero"),
    unit: z.string().trim().max(50).optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

export const updateFoodLogSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().positive("Quantity must be greater than zero").optional(),
    mealType: MealTypeEnum.optional(),
    notes: z.string().trim().max(500).optional(),
  }),
});

export const createCoachPlanSchema = z.object({
  body: z.object({
    memberId: z.string().min(1, "Member ID is required"),
    name: z.string().trim().min(2, "Plan name must be at least 2 characters").max(100),
    targetCalories: z.coerce.number().int().min(800, "Calories must be at least 800 kcal").max(10000),
    targetProteinG: z.coerce.number().nonnegative("Protein cannot be negative").max(1000),
    targetCarbsG: z.coerce.number().nonnegative("Carbohydrates cannot be negative").max(1000),
    targetFatG: z.coerce.number().nonnegative("Fat cannot be negative").max(1000),
    notes: z.string().trim().max(1000).optional(),
    meals: z
      .array(
        z.object({
          name: z.string().trim().min(1, "Meal name is required"),
          mealType: MealTypeEnum,
          suggestedTime: z.string().trim().max(50).optional(),
          order: z.coerce.number().int().min(1),
          items: z
            .array(
              z.object({
                foodId: z.string().min(1, "Food ID is required"),
                quantity: z.coerce.number().positive("Quantity must be greater than 0"),
                unit: z.string().trim().max(50).optional(),
              }),
            )
            .min(1, "Each meal must contain at least one food item"),
        }),
      )
      .min(1, "A nutrition plan must contain at least one meal"),
  }),
});
