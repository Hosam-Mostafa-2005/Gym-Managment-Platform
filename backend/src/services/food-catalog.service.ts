// src/services/food-catalog.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type {
  FoodItemDto,
  FoodNutrientCalculation,
  CreateCustomFoodDto,
  UpdateCustomFoodDto,
} from "../types/nutrition.types.js";

export interface FoodSearchQuery {
  search?: string;
  category?: string;
  allergensToExclude?: string[];
  userId?: string;
  page?: number | string;
  limit?: number | string;
}

export class FoodCatalogService {
  /**
   * Search and filter food catalog with pagination.
   * Seamlessly includes global verified foods and user's private custom foods.
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

    const where: any = {
      isActive: true,
      OR: [
        { isCustom: false, isVerified: true },
        ...(params.userId
          ? [{ isCustom: true, userId: params.userId, isActive: true }]
          : []),
      ],
    };

    const andConditions: any[] = [];

    if (params.search && params.search.trim()) {
      const q = params.search.trim();
      andConditions.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { nameAr: { contains: q, mode: "insensitive" } },
          { category: { contains: q, mode: "insensitive" } },
        ],
      });
    }

    if (params.category && params.category !== "ALL") {
      andConditions.push({
        category: { equals: params.category, mode: "insensitive" },
      });
    }

    if (
      params.allergensToExclude &&
      Array.isArray(params.allergensToExclude) &&
      params.allergensToExclude.length > 0
    ) {
      andConditions.push({
        NOT: {
          allergens: {
            hasSome: params.allergensToExclude.map((a) =>
              a.toLowerCase().trim(),
            ),
          },
        },
      });
    }

    if (andConditions.length > 0) {
      where.AND = andConditions;
    }

    const [foods, total] = await Promise.all([
      prisma.food.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ isCustom: "desc" }, { category: "asc" }, { name: "asc" }],
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
   * Get single food by ID (allows global verified foods or user's custom foods).
   */
  public async getFoodById(id: string, userId?: string): Promise<FoodItemDto> {
    const food = await prisma.food.findFirst({
      where: {
        id,
        isActive: true,
        OR: [
          { isCustom: false },
          ...(userId ? [{ isCustom: true, userId }] : [{ isCustom: false }]),
        ],
      },
    });

    if (!food) {
      throw new AppError(
        `Food item with ID '${id}' was not found in the catalog.`,
        404,
      );
    }

    return this.mapFoodToDto(food);
  }

  /**
   * Create a private custom food for a specific user.
   */
  public async createCustomFood(
    userId: string,
    data: CreateCustomFoodDto,
  ): Promise<FoodItemDto> {
    const created = await prisma.food.create({
      data: {
        name: data.name.trim(),
        nameAr: data.nameAr?.trim() || null,
        category: data.category.trim(),
        servingUnit: data.servingUnit.trim(),
        servingSize: data.servingSize,
        calories: Math.round(data.calories),
        protein: Number(data.protein.toFixed(1)),
        carbs: Number(data.carbs.toFixed(1)),
        fat: Number(data.fat.toFixed(1)),
        fiber: data.fiber !== undefined ? Number(data.fiber.toFixed(1)) : 0,
        sugar: data.sugar !== undefined ? Number(data.sugar.toFixed(1)) : 0,
        sodium: data.sodium !== undefined ? Math.round(data.sodium) : 0,
        allergens: data.allergens || [],
        isVerified: false,
        isCustom: true,
        isActive: true,
        userId,
        source: "USER_CUSTOM",
      },
    });

    return this.mapFoodToDto(created);
  }

  /**
   * List all active custom foods owned by a user.
   */
  public async getUserCustomFoods(userId: string): Promise<FoodItemDto[]> {
    const foods = await prisma.food.findMany({
      where: {
        userId,
        isCustom: true,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return foods.map(this.mapFoodToDto);
  }

  /**
   * Update a user's custom food (guarantees isolation & ownership).
   */
  public async updateCustomFood(
    userId: string,
    foodId: string,
    data: UpdateCustomFoodDto,
  ): Promise<FoodItemDto> {
    const food = await prisma.food.findFirst({
      where: { id: foodId, isActive: true },
    });

    if (!food) {
      throw new AppError("Food item not found.", 404);
    }

    if (!food.isCustom || food.userId !== userId) {
      throw new AppError("You can only edit your own custom foods.", 403);
    }

    const updated = await prisma.food.update({
      where: { id: foodId },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.nameAr !== undefined && { nameAr: data.nameAr?.trim() || null }),
        ...(data.category !== undefined && { category: data.category.trim() }),
        ...(data.servingUnit !== undefined && {
          servingUnit: data.servingUnit.trim(),
        }),
        ...(data.servingSize !== undefined && {
          servingSize: data.servingSize,
        }),
        ...(data.calories !== undefined && {
          calories: Math.round(data.calories),
        }),
        ...(data.protein !== undefined && {
          protein: Number(data.protein.toFixed(1)),
        }),
        ...(data.carbs !== undefined && {
          carbs: Number(data.carbs.toFixed(1)),
        }),
        ...(data.fat !== undefined && { fat: Number(data.fat.toFixed(1)) }),
        ...(data.fiber !== undefined && {
          fiber: Number(data.fiber.toFixed(1)),
        }),
        ...(data.sugar !== undefined && {
          sugar: Number(data.sugar.toFixed(1)),
        }),
        ...(data.sodium !== undefined && {
          sodium: Math.round(data.sodium),
        }),
        ...(data.allergens !== undefined && { allergens: data.allergens }),
      },
    });

    return this.mapFoodToDto(updated);
  }

  /**
   * Soft-delete a user's custom food (preserves historical FoodLog entries without breakages).
   */
  public async deleteCustomFood(
    userId: string,
    foodId: string,
  ): Promise<{ success: boolean; message: string }> {
    const food = await prisma.food.findFirst({
      where: { id: foodId, isActive: true },
    });

    if (!food) {
      throw new AppError("Food item not found.", 404);
    }

    if (!food.isCustom || food.userId !== userId) {
      throw new AppError("You can only delete your own custom foods.", 403);
    }

    await prisma.food.update({
      where: { id: foodId },
      data: { isActive: false },
    });

    return { success: true, message: "Custom food removed successfully." };
  }

  /**
   * Get all distinct food categories.
   */
  public async getCategories(): Promise<string[]> {
    const categories = await prisma.food.findMany({
      where: { isActive: true },
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
      isCustom: Boolean(food.isCustom),
      userId: food.userId ?? null,
      source: food.source,
    };
  }
}

export const foodCatalogService = new FoodCatalogService();
export default foodCatalogService;
