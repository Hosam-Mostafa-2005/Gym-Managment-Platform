// src/services/meal-plan-generator.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type {
  DietaryPreference,
  MealType,
  PlanGenerationOptions,
} from "../types/nutrition.types.js";

interface GeneratedMealItem {
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

interface GeneratedMeal {
  name: string;
  mealType: MealType;
  suggestedTime: string;
  order: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
  items: GeneratedMealItem[];
}

export interface GeneratedPlanResult {
  name: string;
  targetCalories: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  totalPlanCalories: number;
  totalPlanProteinG: number;
  totalPlanCarbsG: number;
  totalPlanFatG: number;
  meals: GeneratedMeal[];
  varianceFromTarget: {
    calorieDiff: number;
    calorieDiffPct: number;
  };
}

export class MealPlanGeneratorService {
  /**
   * Generates a balanced, realistic, structured meal plan matching daily calorie and macro targets.
   */
  public async generatePlan(
    targetCalories: number,
    targetProteinG: number,
    targetCarbsG: number,
    targetFatG: number,
    options: PlanGenerationOptions = {},
  ): Promise<GeneratedPlanResult> {
    const mealCount = Math.min(5, Math.max(3, options.preferredMealsCount || 3));

    // 1. Fetch eligible foods from catalog based on dietary preferences and allergies
    const eligibleFoods = await this.fetchEligibleFoods(options);
    if (eligibleFoods.length < 5) {
      throw new AppError(
        "Insufficient foods found in catalog matching the specified dietary preferences and allergen restrictions.",
        400,
      );
    }

    // 2. Define meal distribution splits based on meal count
    const mealDistributions = this.getMealDistributions(mealCount);

    // 3. Populate each meal with categorized foods
    const generatedMeals: GeneratedMeal[] = [];
    let cumulativePlanCalories = 0;
    let cumulativePlanProtein = 0;
    let cumulativePlanCarbs = 0;
    let cumulativePlanFat = 0;

    for (const dist of mealDistributions) {
      const mealTargetCalories = Math.round(targetCalories * dist.ratio);
      const mealTargetProtein = Math.round(targetProteinG * dist.ratio);
      const mealTargetCarbs = Math.round(targetCarbsG * dist.ratio);
      const mealTargetFat = Math.round(targetFatG * dist.ratio);

      const mealItems = this.selectFoodsForMeal(
        dist.mealType,
        mealTargetCalories,
        mealTargetProtein,
        mealTargetCarbs,
        mealTargetFat,
        eligibleFoods,
      );

      const mealTotalCalories = mealItems.reduce((acc, it) => acc + it.calories, 0);
      const mealTotalProtein = Number(
        mealItems.reduce((acc, it) => acc + it.protein, 0).toFixed(1),
      );
      const mealTotalCarbs = Number(
        mealItems.reduce((acc, it) => acc + it.carbs, 0).toFixed(1),
      );
      const mealTotalFat = Number(
        mealItems.reduce((acc, it) => acc + it.fat, 0).toFixed(1),
      );

      cumulativePlanCalories += mealTotalCalories;
      cumulativePlanProtein += mealTotalProtein;
      cumulativePlanCarbs += mealTotalCarbs;
      cumulativePlanFat += mealTotalFat;

      generatedMeals.push({
        name: dist.name,
        mealType: dist.mealType,
        suggestedTime: dist.suggestedTime,
        order: dist.order,
        targetCalories: mealTargetCalories,
        targetProteinG: mealTargetProtein,
        targetCarbsG: mealTargetCarbs,
        targetFatG: mealTargetFat,
        totalCalories: mealTotalCalories,
        totalProteinG: mealTotalProtein,
        totalCarbsG: mealTotalCarbs,
        totalFatG: mealTotalFat,
        items: mealItems,
      });
    }

    const calorieDiff = cumulativePlanCalories - targetCalories;
    const calorieDiffPct = Number(((calorieDiff / targetCalories) * 100).toFixed(1));

    return {
      name: `Personalized Nutrition Plan (${targetCalories} kcal)`,
      targetCalories,
      targetProteinG,
      targetCarbsG,
      targetFatG,
      totalPlanCalories: cumulativePlanCalories,
      totalPlanProteinG: Number(cumulativePlanProtein.toFixed(1)),
      totalPlanCarbsG: Number(cumulativePlanCarbs.toFixed(1)),
      totalPlanFatG: Number(cumulativePlanFat.toFixed(1)),
      meals: generatedMeals,
      varianceFromTarget: {
        calorieDiff,
        calorieDiffPct,
      },
    };
  }

  private async fetchEligibleFoods(options: PlanGenerationOptions) {
    const allFoods = await prisma.food.findMany({
      where: { isVerified: true },
    });

    const allergies = (options.allergies || []).map((a) => a.toLowerCase().trim());
    const excluded = (options.excludedFoods || []).map((e) => e.toLowerCase().trim());
    const preference: DietaryPreference = options.dietaryPreference || "STANDARD";

    return allFoods.filter((f) => {
      // Exclude allergens
      if (allergies.length > 0 && f.allergens.some((al) => allergies.includes(al.toLowerCase()))) {
        return false;
      }

      // Exclude excluded foods
      if (excluded.some((ex) => f.name.toLowerCase().includes(ex))) {
        return false;
      }

      // Filter by dietary pattern
      const isMeatOrPoultry =
        f.name.toLowerCase().includes("chicken") ||
        f.name.toLowerCase().includes("beef") ||
        f.name.toLowerCase().includes("turkey");
      const isFish =
        f.name.toLowerCase().includes("salmon") ||
        f.name.toLowerCase().includes("tuna") ||
        f.allergens.includes("fish");
      const isDairy =
        f.allergens.includes("dairy") ||
        f.category === "Dairy" ||
        f.name.toLowerCase().includes("whey") ||
        f.name.toLowerCase().includes("yogurt") ||
        f.name.toLowerCase().includes("cheese");
      const isEgg =
        f.allergens.includes("eggs") || f.name.toLowerCase().includes("egg");

      if (preference === "VEGAN") {
        if (isMeatOrPoultry || isFish || isDairy || isEgg) return false;
      }

      if (preference === "VEGETARIAN") {
        if (isMeatOrPoultry || isFish) return false;
      }

      if (preference === "PESCATARIAN") {
        if (isMeatOrPoultry) return false;
      }

      if (preference === "KETO") {
        if (
          f.category === "Carbohydrates" &&
          f.carbs > 15 &&
          !f.name.toLowerCase().includes("berries")
        ) {
          return false;
        }
      }

      return true;
    });
  }

  private getMealDistributions(mealCount: number) {
    if (mealCount === 3) {
      return [
        {
          order: 1,
          name: "Breakfast",
          mealType: "BREAKFAST" as MealType,
          suggestedTime: "08:00",
          ratio: 0.3,
        },
        {
          order: 2,
          name: "Lunch",
          mealType: "LUNCH" as MealType,
          suggestedTime: "13:00",
          ratio: 0.4,
        },
        {
          order: 3,
          name: "Dinner",
          mealType: "DINNER" as MealType,
          suggestedTime: "19:30",
          ratio: 0.3,
        },
      ];
    }

    if (mealCount === 4) {
      return [
        {
          order: 1,
          name: "Breakfast",
          mealType: "BREAKFAST" as MealType,
          suggestedTime: "08:00",
          ratio: 0.25,
        },
        {
          order: 2,
          name: "Lunch",
          mealType: "LUNCH" as MealType,
          suggestedTime: "13:00",
          ratio: 0.35,
        },
        {
          order: 3,
          name: "Afternoon Snack",
          mealType: "AFTERNOON_SNACK" as MealType,
          suggestedTime: "16:30",
          ratio: 0.15,
        },
        {
          order: 4,
          name: "Dinner",
          mealType: "DINNER" as MealType,
          suggestedTime: "19:30",
          ratio: 0.25,
        },
      ];
    }

    // 5 meals
    return [
      {
        order: 1,
        name: "Breakfast",
        mealType: "BREAKFAST" as MealType,
        suggestedTime: "08:00",
        ratio: 0.22,
      },
      {
        order: 2,
        name: "Morning Snack",
        mealType: "MORNING_SNACK" as MealType,
        suggestedTime: "11:00",
        ratio: 0.12,
      },
      {
        order: 3,
        name: "Lunch",
        mealType: "LUNCH" as MealType,
        suggestedTime: "13:30",
        ratio: 0.3,
      },
      {
        order: 4,
        name: "Pre/Post Workout Snack",
        mealType: "AFTERNOON_SNACK" as MealType,
        suggestedTime: "16:30",
        ratio: 0.12,
      },
      {
        order: 5,
        name: "Dinner",
        mealType: "DINNER" as MealType,
        suggestedTime: "20:00",
        ratio: 0.24,
      },
    ];
  }

  private selectFoodsForMeal(
    mealType: MealType,
    targetCalories: number,
    targetProteinG: number,
    targetCarbsG: number,
    targetFatG: number,
    eligibleFoods: any[],
  ): GeneratedMealItem[] {
    const items: GeneratedMealItem[] = [];

    // Helper to find food by name or category
    const findFood = (category: string, nameFilter?: string) => {
      let pool = eligibleFoods.filter((f) => f.category === category);
      if (nameFilter) {
        const specific = pool.find((f) =>
          f.name.toLowerCase().includes(nameFilter.toLowerCase()),
        );
        if (specific) return specific;
      }
      return pool[0] || eligibleFoods[0];
    };

    if (mealType === "BREAKFAST") {
      // 1. Protein source (e.g. Eggs, Egg Whites, or Greek Yogurt)
      const proteinFood =
        findFood("Proteins", "Egg") || findFood("Proteins", "Yogurt");
      const targetProtein = Math.max(15, targetProteinG * 0.7);
      const proteinQty = Math.round(
        (targetProtein / (proteinFood.protein || 20)) * proteinFood.servingSize,
      );
      items.push(this.createItem(proteinFood, Math.max(proteinFood.servingSize, proteinQty)));

      // 2. Carb source (e.g. Oats or Whole Wheat Bread)
      const carbFood = findFood("Carbohydrates", "Oats") || findFood("Carbohydrates", "Bread");
      const targetCarb = Math.max(20, targetCarbsG * 0.6);
      const carbQty = Math.round(
        (targetCarb / (carbFood.carbs || 30)) * carbFood.servingSize,
      );
      items.push(this.createItem(carbFood, Math.max(carbFood.servingSize, carbQty)));

      // 3. Healthy fat or fruit (e.g. Berries, Almonds)
      const fruitFood = findFood("Fruits", "Berries") || findFood("Fruits", "Banana");
      items.push(this.createItem(fruitFood, fruitFood.servingSize));
    } else if (mealType === "LUNCH") {
      // 1. Lean Protein (e.g. Chicken, Tuna, Tofu)
      const proteinFood =
        findFood("Proteins", "Chicken") ||
        findFood("Proteins", "Tuna") ||
        findFood("Proteins");
      const targetProtein = Math.max(25, targetProteinG * 0.75);
      const proteinQty = Math.round(
        (targetProtein / (proteinFood.protein || 25)) * proteinFood.servingSize,
      );
      items.push(this.createItem(proteinFood, Math.max(100, proteinQty)));

      // 2. Complex Carb (e.g. White Rice, Brown Rice, Quinoa)
      const carbFood =
        findFood("Carbohydrates", "Rice") ||
        findFood("Carbohydrates", "Quinoa") ||
        findFood("Carbohydrates");
      const targetCarb = Math.max(30, targetCarbsG * 0.7);
      const carbQty = Math.round(
        (targetCarb / (carbFood.carbs || 25)) * carbFood.servingSize,
      );
      items.push(this.createItem(carbFood, Math.max(100, carbQty)));

      // 3. Vegetable (e.g. Broccoli, Spinach)
      const vegFood = findFood("Vegetables", "Broccoli") || findFood("Vegetables");
      items.push(this.createItem(vegFood, 100));

      // 4. Healthy Fat (e.g. Olive Oil)
      const fatFood = findFood("Fats", "Olive Oil");
      if (fatFood) {
        items.push(this.createItem(fatFood, 15));
      }
    } else if (mealType === "DINNER") {
      // 1. Protein (e.g. Salmon, Beef, Turkey, or Tofu)
      const proteinFood =
        findFood("Proteins", "Salmon") ||
        findFood("Proteins", "Beef") ||
        findFood("Proteins", "Turkey") ||
        findFood("Proteins");
      const targetProtein = Math.max(25, targetProteinG * 0.75);
      const proteinQty = Math.round(
        (targetProtein / (proteinFood.protein || 25)) * proteinFood.servingSize,
      );
      items.push(this.createItem(proteinFood, Math.max(100, proteinQty)));

      // 2. Complex Carb / Root (e.g. Sweet Potato, Potato, Quinoa)
      const carbFood =
        findFood("Carbohydrates", "Potato") ||
        findFood("Carbohydrates", "Rice") ||
        findFood("Carbohydrates");
      const targetCarb = Math.max(25, targetCarbsG * 0.65);
      const carbQty = Math.round(
        (targetCarb / (carbFood.carbs || 20)) * carbFood.servingSize,
      );
      items.push(this.createItem(carbFood, Math.max(100, carbQty)));

      // 3. Vegetable (e.g. Asparagus, Spinach)
      const vegFood = findFood("Vegetables", "Asparagus") || findFood("Vegetables");
      items.push(this.createItem(vegFood, 100));
    } else {
      // Snacks
      const snackProtein =
        findFood("Proteins", "Whey") || findFood("Proteins", "Yogurt");
      const snackCarbOrFruit =
        findFood("Fruits", "Banana") || findFood("Snacks", "Rice Cakes");
      const snackFat = findFood("Fats", "Almonds") || findFood("Fats", "Peanut");

      items.push(this.createItem(snackProtein, snackProtein.servingSize));
      items.push(this.createItem(snackCarbOrFruit, snackCarbOrFruit.servingSize));
      if (snackFat && targetFatG > 10) {
        items.push(this.createItem(snackFat, Math.round(snackFat.servingSize * 0.8)));
      }
    }

    return items;
  }

  private createItem(food: any, quantity: number): GeneratedMealItem {
    const ratio = quantity / (food.servingSize || 100);
    const calories = Math.round(food.calories * ratio);
    const protein = Number((food.protein * ratio).toFixed(1));
    const carbs = Number((food.carbs * ratio).toFixed(1));
    const fat = Number((food.fat * ratio).toFixed(1));
    const fiber = Number(((food.fiber || 0) * ratio).toFixed(1));

    return {
      foodId: food.id,
      foodName: food.name,
      quantity,
      unit: food.servingUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    };
  }
}

export const mealPlanGeneratorService = new MealPlanGeneratorService();
export default mealPlanGeneratorService;
