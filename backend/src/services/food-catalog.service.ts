// src/services/food-catalog.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type { FoodItemDto, FoodNutrientCalculation } from "../types/nutrition.types.js";

export interface FoodSearchQuery {
  search?: string;
  category?: string;
  allergensToExclude?: string[];
  page?: number | string;
  limit?: number | string;
}

export class FoodCatalogService {
  /**
   * Search and filter food catalog with pagination.
   */
  public async searchFoods(params: FoodSearchQuery): Promise<{
    foods: FoodItemDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(params.limit) || 20));
    const skip = (page - 1) * limit;

    const where: any = { isVerified: true };

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { nameAr: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
      ];
    }

    if (params.category && params.category !== "ALL") {
      where.category = { equals: params.category, mode: "insensitive" };
    }

    if (
      params.allergensToExclude &&
      Array.isArray(params.allergensToExclude) &&
      params.allergensToExclude.length > 0
    ) {
      where.NOT = {
        allergens: {
          hasSome: params.allergensToExclude.map((a) => a.toLowerCase().trim()),
        },
      };
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ category: "asc" }, { name: "asc" }],
      }),
      prisma.food.count({ where }),
    ]);

    return {
      foods: foods.map(this.mapFoodToDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  /**
   * Get single food by ID.
   */
  public async getFoodById(id: string): Promise<FoodItemDto> {
    const food = await prisma.food.findUnique({
      where: { id },
    });

    if (!food) {
      throw new AppError(`Food item with ID '${id}' was not found in the catalog.`, 404);
    }

    return this.mapFoodToDto(food);
  }

  /**
   * Get all distinct food categories.
   */
  public async getCategories(): Promise<string[]> {
    const categories = await prisma.food.findMany({
      where: { isVerified: true },
      select: { category: true },
      distinct: ["category"],
      orderBy: { category: "asc" },
    });

    return categories.map((c) => c.category);
  }

  /**
   * Compute exact nutrients for a specific food and requested quantity.
   */
  public calculateNutrients(
    food: {
      id: string;
      name: string;
      servingSize: number;
      servingUnit: string;
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber?: number | null;
    },
    quantity: number,
    unit?: string,
  ): FoodNutrientCalculation {
    if (!quantity || quantity <= 0) {
      throw new AppError("Quantity must be a positive number.", 400);
    }

    // Ratio relative to base serving size
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
      unit: unit || food.servingUnit,
      calories,
      protein,
      carbs,
      fat,
      fiber,
    };
  }

  private mapFoodToDto(food: any): FoodItemDto {
    return {
      id: food.id,
      name: food.name,
      nameAr: food.nameAr,
      category: food.category,
      servingUnit: food.servingUnit,
      servingSize: food.servingSize,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      fiber: food.fiber,
      sugar: food.sugar,
      sodium: food.sodium,
      allergens: food.allergens || [],
      isVerified: food.isVerified,
      source: food.source,
    };
  }
}

export const foodCatalogService = new FoodCatalogService();
export default foodCatalogService;
