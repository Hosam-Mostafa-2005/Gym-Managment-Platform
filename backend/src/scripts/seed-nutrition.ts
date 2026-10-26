// src/scripts/seed-nutrition.ts
import prisma from "../config/prisma.js";
import { starterFoodsCatalog } from "./data/foods.js";

export async function seedNutritionCatalog(): Promise<{
  totalFoods: number;
  created: number;
  updated: number;
}> {
  console.log("🥗 Seeding Nutrition Food Catalog...");
  let created = 0;
  let updated = 0;

  for (const food of starterFoodsCatalog) {
    const existing = await prisma.food.findFirst({
      where: { name: food.name },
    });

    if (existing) {
      await prisma.food.update({
        where: { id: existing.id },
        data: {
          nameAr: food.nameAr,
          category: food.category,
          servingUnit: food.servingUnit,
          servingSize: food.servingSize,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber ?? 0,
          sugar: food.sugar ?? 0,
          sodium: food.sodium ?? 0,
          allergens: food.allergens,
          isVerified: true,
          source: food.source,
        },
      });
      updated++;
    } else {
      await prisma.food.create({
        data: {
          name: food.name,
          nameAr: food.nameAr,
          category: food.category,
          servingUnit: food.servingUnit,
          servingSize: food.servingSize,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
          fiber: food.fiber ?? 0,
          sugar: food.sugar ?? 0,
          sodium: food.sodium ?? 0,
          allergens: food.allergens,
          isVerified: true,
          source: food.source,
        },
      });
      created++;
    }
  }

  const totalFoods = await prisma.food.count();
  console.log(
    `✅ Food Catalog Seed Complete: ${created} created, ${updated} updated, ${totalFoods} total foods in database.`,
  );
  return { totalFoods, created, updated };
}

// Execute directly if run via CLI
if (process.argv[1]?.endsWith("seed-nutrition.ts")) {
  seedNutritionCatalog()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Failed to seed nutrition catalog:", err);
      process.exit(1);
    });
}
