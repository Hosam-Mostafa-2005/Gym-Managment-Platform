// src/services/nutrition-calculator.service.ts
import AppError from "../utils/AppError.js";
import type {
  CalculationInput,
  CalculationResult,
  ActivityLevel,
  NutritionGoal,
  TargetPace,
} from "../types/nutrition.types.js";

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  SEDENTARY: 1.2,
  LIGHTLY_ACTIVE: 1.375,
  MODERATELY_ACTIVE: 1.55,
  VERY_ACTIVE: 1.725,
  EXTRA_ACTIVE: 1.9,
};

export const MIN_CALORIE_FLOORS = {
  MALE: 1500,
  FEMALE: 1200,
};

export const CALORIE_DENSITIES = {
  PROTEIN_KCAL_PER_G: 4,
  CARB_KCAL_PER_G: 4,
  FAT_KCAL_PER_G: 9,
};

export class NutritionCalculatorService {
  /**
   * Calculates Basal Metabolic Rate using the established Mifflin-St Jeor equation.
   * Male: 10 * weight(kg) + 6.25 * height(cm) - 5 * age + 5
   * Female: 10 * weight(kg) + 6.25 * height(cm) - 5 * age - 161
   */
  public calculateBmr(
    weightKg: number,
    heightCm: number,
    age: number,
    gender: "MALE" | "FEMALE",
  ): number {
    this.validateInputs(weightKg, heightCm, age);

    if (gender === "MALE") {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
    } else {
      return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
    }
  }

  /**
   * Calculates Total Daily Energy Expenditure (TDEE).
   */
  public calculateTdee(bmr: number, activityLevel: ActivityLevel): number {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel];
    if (!multiplier) {
      throw new AppError(
        `Invalid activity level: ${activityLevel}. Must be SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE, or EXTRA_ACTIVE.`,
        400,
      );
    }
    return Math.round(bmr * multiplier);
  }

  /**
   * Complete deterministic calculation of nutritional targets.
   */
  public calculateTargets(input: CalculationInput): CalculationResult {
    this.validateInputs(input.weightKg, input.heightCm, input.age);

    const bmr = this.calculateBmr(
      input.weightKg,
      input.heightCm,
      input.age,
      input.gender,
    );
    const activityMultiplier = ACTIVITY_MULTIPLIERS[input.activityLevel] || 1.375;
    const tdee = Math.round(bmr * activityMultiplier);

    const { targetCalories, calorieAdjustment, safetyAdvisory } =
      this.calculateGoalCalories(
        tdee,
        input.goal,
        input.gender,
        input.targetPace || "MODERATE",
      );

    const { targetProteinG, targetFatG, targetCarbsG } =
      this.calculateMacronutrients(
        targetCalories,
        input.weightKg,
        input.goal,
      );

    const proteinCalories = targetProteinG * CALORIE_DENSITIES.PROTEIN_KCAL_PER_G;
    const carbsCalories = targetCarbsG * CALORIE_DENSITIES.CARB_KCAL_PER_G;
    const fatCalories = targetFatG * CALORIE_DENSITIES.FAT_KCAL_PER_G;
    const totalMacroCalories = proteinCalories + carbsCalories + fatCalories;

    const macroPercentages = {
      proteinPct: Math.round((proteinCalories / totalMacroCalories) * 100),
      carbsPct: Math.round((carbsCalories / totalMacroCalories) * 100),
      fatPct: Math.round((fatCalories / totalMacroCalories) * 100),
    };

    return {
      bmr,
      tdee,
      activityMultiplier,
      goal: input.goal,
      calorieAdjustment,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatG,
      macroPercentages,
      formulaVersion: "Mifflin-St Jeor v1.0",
      assumptions: `BMR estimated via Mifflin-St Jeor. TDEE estimated using a ${activityMultiplier}x activity factor (${input.activityLevel}). Protein prescribed at goal-appropriate lean mass preservation rates.`,
      disclaimer:
        "These targets are estimates based on standardized equations. Individual metabolic adaptation, body composition, and medical factors may vary. Consult a qualified sports dietitian or physician before undertaking significant dietary changes.",
      safetyAdvisory,
    };
  }

  private calculateGoalCalories(
    tdee: number,
    goal: NutritionGoal,
    gender: "MALE" | "FEMALE",
    pace: TargetPace,
  ): {
    targetCalories: number;
    calorieAdjustment: number;
    safetyAdvisory: string | null;
  } {
    let adjustmentPct = 0;
    let safetyAdvisory: string | null = null;

    switch (goal) {
      case "FAT_LOSS":
        if (pace === "CONSERVATIVE") adjustmentPct = -0.15;
        else if (pace === "AGGRESSIVE") adjustmentPct = -0.25;
        else adjustmentPct = -0.2; // MODERATE default (20% deficit)
        break;

      case "MUSCLE_GAIN":
        if (pace === "CONSERVATIVE") adjustmentPct = 0.08;
        else if (pace === "AGGRESSIVE") adjustmentPct = 0.15;
        else adjustmentPct = 0.12; // MODERATE default (12% surplus)
        break;

      case "SPORTS_PERFORMANCE":
        adjustmentPct = 0.05; // 5% surplus for high glycogen/energy demands
        break;

      case "MAINTENANCE":
      default:
        adjustmentPct = 0;
        break;
    }

    let rawTarget = Math.round(tdee * (1 + adjustmentPct));
    const rawAdjustment = rawTarget - tdee;

    // Enforce Safety Floor
    const minFloor = MIN_CALORIE_FLOORS[gender];
    if (rawTarget < minFloor) {
      rawTarget = minFloor;
      safetyAdvisory = `Calculated deficit was below the established minimum nutritional floor of ${minFloor} kcal/day for health and hormonal preservation. Target has been safely raised to ${minFloor} kcal.`;
    }

    // Enforce Safety Ceiling for surplus
    const maxCeiling = tdee + 800;
    if (rawTarget > maxCeiling) {
      rawTarget = maxCeiling;
      safetyAdvisory = `Calculated surplus was capped at a maximum of +800 kcal above maintenance to mitigate excessive adipose accumulation.`;
    }

    return {
      targetCalories: rawTarget,
      calorieAdjustment: rawTarget - tdee,
      safetyAdvisory,
    };
  }

  private calculateMacronutrients(
    targetCalories: number,
    weightKg: number,
    goal: NutritionGoal,
  ): { targetProteinG: number; targetFatG: number; targetCarbsG: number } {
    // 1. Protein Grams: Weight-based target
    let proteinPerKg = 1.8;
    switch (goal) {
      case "FAT_LOSS":
        proteinPerKg = 2.2; // Higher protein in deficit to preserve lean mass
        break;
      case "MUSCLE_GAIN":
        proteinPerKg = 2.0; // Optimal protein synthesis
        break;
      case "SPORTS_PERFORMANCE":
        proteinPerKg = 2.0;
        break;
      case "MAINTENANCE":
      default:
        proteinPerKg = 1.8;
        break;
    }

    let proteinGrams = Math.round(weightKg * proteinPerKg);
    // Safety boundaries: Protein cannot exceed 35% of total calories
    const maxProteinGrams = Math.round((targetCalories * 0.35) / CALORIE_DENSITIES.PROTEIN_KCAL_PER_G);
    if (proteinGrams > maxProteinGrams) {
      proteinGrams = maxProteinGrams;
    }
    // Floor: at least 1.4 g/kg
    const minProteinGrams = Math.round(weightKg * 1.4);
    if (proteinGrams < minProteinGrams) {
      proteinGrams = minProteinGrams;
    }

    // 2. Fat Grams: 25% of total calories, with minimum hormonal floor of 0.7g/kg
    let fatCalories = targetCalories * 0.25;
    let fatGrams = Math.round(fatCalories / CALORIE_DENSITIES.FAT_KCAL_PER_G);
    const minFatGrams = Math.round(weightKg * 0.7);
    if (fatGrams < minFatGrams) {
      fatGrams = minFatGrams;
      fatCalories = fatGrams * CALORIE_DENSITIES.FAT_KCAL_PER_G;
    }

    // 3. Carbohydrate Grams: Remaining calories allocated to carbohydrates
    const proteinCalories = proteinGrams * CALORIE_DENSITIES.PROTEIN_KCAL_PER_G;
    const remainingCalories = targetCalories - proteinCalories - (fatGrams * CALORIE_DENSITIES.FAT_KCAL_PER_G);
    let carbsGrams = Math.round(remainingCalories / CALORIE_DENSITIES.CARB_KCAL_PER_G);

    // Floor: at least 30g of carbs
    if (carbsGrams < 30) {
      carbsGrams = 30;
    }

    // Fine-tune calorie balance so: (protein * 4) + (carbs * 4) + (fat * 9) matches targetCalories
    const currentTotal =
      proteinGrams * 4 + carbsGrams * 4 + fatGrams * 9;
    const diff = targetCalories - currentTotal;
    if (Math.abs(diff) > 0 && Math.abs(diff) < 20) {
      // Adjust carbs by 1-2g to make the sum exact
      const carbAdjust = Math.round(diff / 4);
      carbsGrams += carbAdjust;
    }

    return {
      targetProteinG: Math.max(50, proteinGrams),
      targetFatG: Math.max(30, fatGrams),
      targetCarbsG: Math.max(30, carbsGrams),
    };
  }

  private validateInputs(weightKg: number, heightCm: number, age: number): void {
    if (!weightKg || isNaN(weightKg) || weightKg < 35 || weightKg > 300) {
      throw new AppError(
        "Weight must be a plausible physiological value between 35 kg and 300 kg.",
        400,
      );
    }
    if (!heightCm || isNaN(heightCm) || heightCm < 120 || heightCm > 250) {
      throw new AppError(
        "Height must be a plausible value between 120 cm and 250 cm.",
        400,
      );
    }
    if (!age || isNaN(age) || age < 14 || age > 100) {
      throw new AppError(
        "Age must be between 14 and 100 years. Nutritional assessment for minors under 14 requires specialized pediatric supervision.",
        400,
      );
    }
  }
}

export const nutritionCalculatorService = new NutritionCalculatorService();
export default nutritionCalculatorService;
