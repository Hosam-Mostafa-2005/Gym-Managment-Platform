// src/services/nutrition.service.ts
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { nutritionCalculatorService } from "./nutrition-calculator.service.js";
import { mealPlanGeneratorService } from "./meal-plan-generator.service.js";
import { foodCatalogService } from "./food-catalog.service.js";
import gamificationService from "./gamification.service.js";
import type {
  CalculationInput,
  MealType,
  PlanGenerationOptions,
} from "../types/nutrition.types.js";

export class NutritionService {
  /**
   * Get comprehensive nutrition overview for a member.
   */
  public async getMemberOverview(memberId: string, dateStr?: string) {
    const targetDate = dateStr ? new Date(dateStr) : new Date();
    const startOfDay = new Date(targetDate);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setUTCHours(23, 59, 59, 999);

    // 1. Get member's active nutrition plan
    const activePlan = await prisma.nutritionPlan.findFirst({
      where: {
        memberId,
        status: "ACTIVE",
        isActive: true,
      },
      include: {
        coach: { select: { id: true, name: true, email: true } },
        meals: {
          orderBy: { order: "asc" },
          include: {
            items: {
              include: {
                food: {
                  select: {
                    id: true,
                    name: true,
                    nameAr: true,
                    category: true,
                    servingUnit: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Get today's actual food logs
    const todayLogs = await prisma.foodLog.findMany({
      where: {
        memberId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { loggedAt: "asc" },
      include: {
        food: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            category: true,
          },
        },
      },
    });

    // 3. Compute actual recorded intake
    const loggedCalories = todayLogs.reduce((acc, l) => acc + l.calories, 0);
    const loggedProteinG = Number(
      todayLogs.reduce((acc, l) => acc + l.protein, 0).toFixed(1),
    );
    const loggedCarbsG = Number(
      todayLogs.reduce((acc, l) => acc + l.carbs, 0).toFixed(1),
    );
    const loggedFatG = Number(
      todayLogs.reduce((acc, l) => acc + l.fat, 0).toFixed(1),
    );

    const targetCalories = activePlan?.targetCalories || 0;
    const targetProteinG = activePlan?.targetProteinG || 0;
    const targetCarbsG = activePlan?.targetCarbsG || 0;
    const targetFatG = activePlan?.targetFatG || 0;

    const remainingCalories = Math.max(0, targetCalories - loggedCalories);

    // 4. Map meals and group today's logs by meal type
    const logsByMealType: Record<string, typeof todayLogs> = {};
    for (const log of todayLogs) {
      if (!logsByMealType[log.mealType]) {
        logsByMealType[log.mealType] = [];
      }
      logsByMealType[log.mealType].push(log);
    }

    // 5. Check profile onboarding state
    const profile = await prisma.nutritionProfile.findUnique({
      where: { userId: memberId },
    });

    return {
      date: startOfDay.toISOString().split("T")[0],
      hasActivePlan: !!activePlan,
      onboardingCompleted: profile?.onboardingCompleted || false,
      plan: activePlan
        ? {
            id: activePlan.id,
            name: activePlan.name,
            source: activePlan.source,
            coach: activePlan.coach,
            version: activePlan.version,
            notes: activePlan.notes,
            activatedAt: activePlan.activatedAt,
            targetCalories,
            targetProteinG,
            targetCarbsG,
            targetFatG,
            totalPlanCalories: activePlan.totalPlanCalories,
            totalPlanProteinG: activePlan.totalPlanProteinG,
            totalPlanCarbsG: activePlan.totalPlanCarbsG,
            totalPlanFatG: activePlan.totalPlanFatG,
            meals: activePlan.meals.map((m) => ({
              id: m.id,
              name: m.name,
              mealType: m.mealType,
              suggestedTime: m.suggestedTime,
              order: m.order,
              totalCalories: m.totalCalories,
              totalProteinG: m.totalProteinG,
              totalCarbsG: m.totalCarbsG,
              totalFatG: m.totalFatG,
              items: m.items.map((it) => ({
                id: it.id,
                foodId: it.foodId,
                foodName: it.foodNameSnapshot,
                quantity: it.quantity,
                unit: it.unit,
                calories: it.calories,
                protein: it.protein,
                carbs: it.carbs,
                fat: it.fat,
              })),
            })),
          }
        : null,
      intake: {
        targetCalories,
        targetProteinG,
        targetCarbsG,
        targetFatG,
        loggedCalories,
        loggedProteinG,
        loggedCarbsG,
        loggedFatG,
        remainingCalories,
        proteinProgressPct:
          targetProteinG > 0
            ? Math.round((loggedProteinG / targetProteinG) * 100)
            : 0,
        carbsProgressPct:
          targetCarbsG > 0 ? Math.round((loggedCarbsG / targetCarbsG) * 100) : 0,
        fatProgressPct:
          targetFatG > 0 ? Math.round((loggedFatG / targetFatG) * 100) : 0,
        calorieProgressPct:
          targetCalories > 0
            ? Math.round((loggedCalories / targetCalories) * 100)
            : 0,
      },
      todayLogs: todayLogs.map((l) => ({
        id: l.id,
        mealType: l.mealType,
        foodId: l.foodId,
        foodName: l.foodNameSnapshot,
        quantity: l.quantity,
        unit: l.unit,
        calories: l.calories,
        protein: l.protein,
        carbs: l.carbs,
        fat: l.fat,
        notes: l.notes,
        loggedAt: l.loggedAt,
      })),
      logsByMealType,
    };
  }

  /**
   * Get member profile and latest eligible Body Measurement records for onboarding pre-fill.
   */
  public async getMemberProfile(memberId: string) {
    const [profile, latestMeasurement, user] = await Promise.all([
      prisma.nutritionProfile.findUnique({
        where: { userId: memberId },
      }),
      prisma.bodyMeasurement.findFirst({
        where: { memberId, isActive: true },
        orderBy: { measuredAt: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: memberId },
        select: { id: true, name: true, email: true },
      }),
    ]);

    // Check if measurement is within past 60 days
    let recentMeasurementData = null;
    if (latestMeasurement) {
      const daysOld = Math.floor(
        (Date.now() - new Date(latestMeasurement.measuredAt).getTime()) /
          (1000 * 60 * 60 * 24),
      );
      recentMeasurementData = {
        weightKg: latestMeasurement.weight,
        heightCm: latestMeasurement.height,
        measuredAt: latestMeasurement.measuredAt,
        daysOld,
        isRecent: daysOld <= 60,
      };
    }

    return {
      profile,
      user,
      suggestedMeasurement: recentMeasurementData,
    };
  }

  /**
   * Complete or update member onboarding, calculate nutritional targets, and generate initial plan.
   */
  public async completeOnboarding(
    memberId: string,
    payload: {
      age: number;
      gender: "MALE" | "FEMALE";
      heightCm: number;
      currentWeightKg: number;
      activityLevel: any;
      dailyActivityNotes?: string;
      trainingDaysPerWeek?: number;
      trainingType?: string;
      goal: any;
      targetPace?: any;
      preferredMealsCount?: number;
      dietaryPreference?: any;
      allergies?: string[];
      excludedFoods?: string[];
      hasMedicalClearance?: boolean;
      safetyScreeningNotes?: string;
      activateImmediately?: boolean;
    },
  ) {
    // 1. Calculate nutritional targets deterministically
    const calcInput: CalculationInput = {
      age: payload.age,
      gender: payload.gender,
      weightKg: payload.currentWeightKg,
      heightCm: payload.heightCm,
      activityLevel: payload.activityLevel,
      goal: payload.goal,
      targetPace: payload.targetPace || "MODERATE",
      preferredMealsCount: payload.preferredMealsCount || 3,
    };

    const calculation = nutritionCalculatorService.calculateTargets(calcInput);

    // 2. Upsert NutritionProfile
    const profile = await prisma.nutritionProfile.upsert({
      where: { userId: memberId },
      create: {
        userId: memberId,
        age: payload.age,
        gender: payload.gender,
        heightCm: payload.heightCm,
        currentWeightKg: payload.currentWeightKg,
        activityLevel: payload.activityLevel,
        dailyActivityNotes: payload.dailyActivityNotes,
        trainingDaysPerWeek: payload.trainingDaysPerWeek || 3,
        trainingType: payload.trainingType,
        goal: payload.goal,
        targetPace: payload.targetPace || "MODERATE",
        preferredMealsCount: payload.preferredMealsCount || 3,
        dietaryPreference: payload.dietaryPreference || "STANDARD",
        allergies: payload.allergies || [],
        excludedFoods: payload.excludedFoods || [],
        hasMedicalClearance: payload.hasMedicalClearance ?? true,
        safetyScreeningNotes: payload.safetyScreeningNotes,
        onboardingCompleted: true,
        onboardingStep: 5,
      },
      update: {
        age: payload.age,
        gender: payload.gender,
        heightCm: payload.heightCm,
        currentWeightKg: payload.currentWeightKg,
        activityLevel: payload.activityLevel,
        dailyActivityNotes: payload.dailyActivityNotes,
        trainingDaysPerWeek: payload.trainingDaysPerWeek || 3,
        trainingType: payload.trainingType,
        goal: payload.goal,
        targetPace: payload.targetPace || "MODERATE",
        preferredMealsCount: payload.preferredMealsCount || 3,
        dietaryPreference: payload.dietaryPreference || "STANDARD",
        allergies: payload.allergies || [],
        excludedFoods: payload.excludedFoods || [],
        hasMedicalClearance: payload.hasMedicalClearance ?? true,
        safetyScreeningNotes: payload.safetyScreeningNotes,
        onboardingCompleted: true,
        onboardingStep: 5,
      },
    });

    // 3. Store versioned NutritionAssessment snapshot
    const assessment = await prisma.nutritionAssessment.create({
      data: {
        userId: memberId,
        weightKg: payload.currentWeightKg,
        heightCm: payload.heightCm,
        age: payload.age,
        gender: payload.gender,
        bmr: calculation.bmr,
        tdee: calculation.tdee,
        activityLevel: payload.activityLevel,
        activityMultiplier: calculation.activityMultiplier,
        goal: payload.goal,
        calorieAdjustment: calculation.calorieAdjustment,
        targetCalories: calculation.targetCalories,
        targetProteinG: calculation.targetProteinG,
        targetCarbsG: calculation.targetCarbsG,
        targetFatG: calculation.targetFatG,
        formulaVersion: calculation.formulaVersion,
        assumptions: calculation.assumptions,
        disclaimer: calculation.disclaimer,
      },
    });

    // 4. Generate structured meal plan using real catalog foods
    const planOptions: PlanGenerationOptions = {
      dietaryPreference: payload.dietaryPreference,
      allergies: payload.allergies,
      excludedFoods: payload.excludedFoods,
      preferredMealsCount: payload.preferredMealsCount || 3,
    };

    const generated = await mealPlanGeneratorService.generatePlan(
      calculation.targetCalories,
      calculation.targetProteinG,
      calculation.targetCarbsG,
      calculation.targetFatG,
      planOptions,
    );

    // 5. If activateImmediately is true (or default true), save plan into database via transaction
    let savedPlan = null;
    if (payload.activateImmediately !== false) {
      savedPlan = await this.saveGeneratedPlan(
        memberId,
        assessment.id,
        generated,
        "SELF_GUIDED",
      );
    }

    return {
      profile,
      assessment,
      calculation,
      generatedPlan: generated,
      savedPlan,
    };
  }

  /**
   * Save generated plan into the database with transaction integrity.
   */
  public async saveGeneratedPlan(
    memberId: string,
    assessmentId: string | null,
    generated: any,
    source: "SELF_GUIDED" | "COACH_ASSIGNED" = "SELF_GUIDED",
    coachId: string | null = null,
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Deactivate existing active plans for this member if source is SELF_GUIDED
      // (or supersede previous coach plans if coach creates a new version)
      await tx.nutritionPlan.updateMany({
        where: {
          memberId,
          status: "ACTIVE",
          isActive: true,
        },
        data: {
          status: "SUPERSEDED",
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      // 2. Count existing plans to increment version
      const planCount = await tx.nutritionPlan.count({
        where: { memberId },
      });

      // 3. Create NutritionPlan
      const plan = await tx.nutritionPlan.create({
        data: {
          memberId,
          coachId,
          assessmentId,
          name: generated.name || "Personalized Nutrition Plan",
          source,
          status: "ACTIVE",
          targetCalories: generated.targetCalories,
          targetProteinG: generated.targetProteinG,
          targetCarbsG: generated.targetCarbsG,
          targetFatG: generated.targetFatG,
          totalPlanCalories: generated.totalPlanCalories,
          totalPlanProteinG: generated.totalPlanProteinG,
          totalPlanCarbsG: generated.totalPlanCarbsG,
          totalPlanFatG: generated.totalPlanFatG,
          version: planCount + 1,
          isActive: true,
          activatedAt: new Date(),
          meals: {
            create: generated.meals.map((m: any) => ({
              name: m.name,
              mealType: m.mealType,
              suggestedTime: m.suggestedTime,
              order: m.order,
              targetCalories: m.targetCalories,
              targetProteinG: m.targetProteinG,
              targetCarbsG: m.targetCarbsG,
              targetFatG: m.targetFatG,
              totalCalories: m.totalCalories,
              totalProteinG: m.totalProteinG,
              totalCarbsG: m.totalCarbsG,
              totalFatG: m.totalFatG,
              items: {
                create: m.items.map((it: any) => ({
                  foodId: it.foodId,
                  quantity: it.quantity,
                  unit: it.unit,
                  calories: it.calories,
                  protein: it.protein,
                  carbs: it.carbs,
                  fat: it.fat,
                  foodNameSnapshot: it.foodName,
                })),
              },
            })),
          },
        },
        include: {
          meals: {
            include: { items: true },
          },
        },
      });

      return plan;
    });
  }

  /**
   * Log food consumption (actual intake).
   */
  public async logFood(
    memberId: string,
    payload: {
      foodId: string;
      date: string; // ISO date string e.g. "2026-10-25"
      mealType: MealType;
      quantity: number;
      unit?: string;
      notes?: string;
    },
  ) {
    if (!payload.quantity || payload.quantity <= 0) {
      throw new AppError("Quantity must be a positive number.", 400);
    }

    const food = await foodCatalogService.getFoodById(payload.foodId);
    const calculated = foodCatalogService.calculateNutrients(
      food,
      payload.quantity,
      payload.unit,
    );

    const logDate = new Date(payload.date);
    logDate.setUTCHours(0, 0, 0, 0);

    const log = await prisma.foodLog.create({
      data: {
        memberId,
        date: logDate,
        mealType: payload.mealType,
        foodId: food.id,
        foodNameSnapshot: food.name,
        quantity: payload.quantity,
        unit: payload.unit || food.servingUnit,
        calories: calculated.calories,
        protein: calculated.protein,
        carbs: calculated.carbs,
        fat: calculated.fat,
        notes: payload.notes,
      },
    });

    try {
      gamificationService.evaluateUserAchievements(memberId).catch(() => {});
    } catch {
      // Safe fallback
    }

    return log;
  }

  /**
   * Update an existing food log (only by the owner).
   */
  public async updateFoodLog(
    logId: string,
    memberId: string,
    payload: {
      quantity?: number;
      mealType?: MealType;
      notes?: string;
    },
  ) {
    const existing = await prisma.foodLog.findUnique({
      where: { id: logId },
      include: { food: true },
    });

    if (!existing) {
      throw new AppError("Food log not found.", 404);
    }

    if (existing.memberId !== memberId) {
      throw new AppError("Unauthorized: You can only edit your own food logs.", 403);
    }

    let calories = existing.calories;
    let protein = existing.protein;
    let carbs = existing.carbs;
    let fat = existing.fat;

    if (payload.quantity && payload.quantity > 0) {
      const recalculated = foodCatalogService.calculateNutrients(
        existing.food,
        payload.quantity,
        existing.unit,
      );
      calories = recalculated.calories;
      protein = recalculated.protein;
      carbs = recalculated.carbs;
      fat = recalculated.fat;
    }

    const updated = await prisma.foodLog.update({
      where: { id: logId },
      data: {
        quantity: payload.quantity ?? existing.quantity,
        mealType: payload.mealType ?? existing.mealType,
        notes: payload.notes ?? existing.notes,
        calories,
        protein,
        carbs,
        fat,
      },
    });

    return updated;
  }

  /**
   * Delete food log (only by the owner).
   */
  public async deleteFoodLog(logId: string, memberId: string) {
    const existing = await prisma.foodLog.findUnique({
      where: { id: logId },
    });

    if (!existing) {
      throw new AppError("Food log not found.", 404);
    }

    if (existing.memberId !== memberId) {
      throw new AppError("Unauthorized: You can only delete your own food logs.", 403);
    }

    await prisma.foodLog.delete({
      where: { id: logId },
    });

    return { success: true, message: "Food log removed successfully." };
  }

  /**
   * Get historical nutrition trends over time.
   */
  public async getNutritionHistory(memberId: string, days = 30) {
    const safeDays = Math.min(90, Math.max(7, days));
    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - safeDays);
    startDate.setUTCHours(0, 0, 0, 0);

    const [logs, activePlan] = await Promise.all([
      prisma.foodLog.findMany({
        where: {
          memberId,
          date: { gte: startDate },
        },
        orderBy: { date: "asc" },
      }),
      prisma.nutritionPlan.findFirst({
        where: { memberId, status: "ACTIVE", isActive: true },
      }),
    ]);

    // Group logs by day
    const dayMap = new Map<
      string,
      {
        date: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
        logCount: number;
      }
    >();

    for (const log of logs) {
      const dStr = log.date.toISOString().split("T")[0];
      const cur = dayMap.get(dStr) || {
        date: dStr,
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        logCount: 0,
      };
      cur.calories += log.calories;
      cur.protein += log.protein;
      cur.carbs += log.carbs;
      cur.fat += log.fat;
      cur.logCount += 1;
      dayMap.set(dStr, cur);
    }

    // Build timeline of all days in range, distinguishing logged days from non-logged days
    const timeline = [];
    const targetCalories = activePlan?.targetCalories || 0;
    const targetProtein = activePlan?.targetProteinG || 0;

    let loggedDaysCount = 0;
    let totalLoggedCalories = 0;

    for (let i = safeDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dStr = d.toISOString().split("T")[0];
      const data = dayMap.get(dStr);

      if (data && data.logCount > 0) {
        loggedDaysCount++;
        totalLoggedCalories += data.calories;
        timeline.push({
          date: dStr,
          isLogged: true,
          calories: data.calories,
          protein: Number(data.protein.toFixed(1)),
          carbs: Number(data.carbs.toFixed(1)),
          fat: Number(data.fat.toFixed(1)),
          targetCalories,
          targetProtein,
          adherencePct:
            targetCalories > 0
              ? Math.round((data.calories / targetCalories) * 100)
              : 0,
        });
      } else {
        timeline.push({
          date: dStr,
          isLogged: false,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          targetCalories,
          targetProtein,
          adherencePct: 0,
        });
      }
    }

    const avgCaloriesOnLoggedDays =
      loggedDaysCount > 0 ? Math.round(totalLoggedCalories / loggedDaysCount) : 0;

    return {
      timeline,
      loggedDaysCount,
      totalDays: safeDays,
      loggingConsistencyPct: Math.round((loggedDaysCount / safeDays) * 100),
      avgCaloriesOnLoggedDays,
      activePlanTargets: {
        calories: targetCalories,
        protein: targetProtein,
      },
    };
  }

  // ==========================================
  // COACH-MANAGED NUTRITION METHODS
  // ==========================================

  /**
   * Get eligible members for a coach (strictly enforces CoachMemberRelationship ACTIVE status).
   */
  public async getCoachEligibleMembers(coachId: string, isAdmin = false) {
    let memberIds: string[] = [];

    if (isAdmin) {
      const allMembers = await prisma.user.findMany({
        where: { role: "member", isActive: true },
        select: { id: true },
      });
      memberIds = allMembers.map((m) => m.id);
    } else {
      const activeRelationships = await prisma.coachMemberRelationship.findMany({
        where: {
          trainerId: coachId,
          status: "ACTIVE",
          isActive: true,
        },
        select: { memberId: true },
      });
      memberIds = activeRelationships.map((r) => r.memberId);
    }

    if (memberIds.length === 0) {
      return [];
    }

    const members = await prisma.user.findMany({
      where: { id: { in: memberIds }, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        nutritionProfile: {
          select: {
            goal: true,
            dietaryPreference: true,
            onboardingCompleted: true,
          },
        },
        nutritionPlansAsMember: {
          where: { status: "ACTIVE", isActive: true },
          select: {
            id: true,
            name: true,
            source: true,
            targetCalories: true,
            targetProteinG: true,
            updatedAt: true,
          },
        },
        foodLogs: {
          orderBy: { loggedAt: "desc" },
          take: 1,
          select: { loggedAt: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return members.map((m) => {
      const activePlan = m.nutritionPlansAsMember[0] || null;
      const lastLog = m.foodLogs[0] || null;

      return {
        memberId: m.id,
        name: m.name,
        email: m.email,
        goal: m.nutritionProfile?.goal || "Not Assessed",
        dietaryPreference: m.nutritionProfile?.dietaryPreference || "STANDARD",
        hasActivePlan: !!activePlan,
        activePlan: activePlan
          ? {
              id: activePlan.id,
              name: activePlan.name,
              source: activePlan.source,
              targetCalories: activePlan.targetCalories,
              targetProteinG: activePlan.targetProteinG,
            }
          : null,
        lastLoggedAt: lastLog?.loggedAt || null,
      };
    });
  }

  /**
   * Verify coach is authorized to manage member's nutrition.
   */
  public async verifyCoachAuthorization(
    coachId: string,
    memberId: string,
    isAdmin = false,
  ) {
    if (isAdmin) return true;

    const relationship = await prisma.coachMemberRelationship.findFirst({
      where: {
        trainerId: coachId,
        memberId,
        status: "ACTIVE",
        isActive: true,
      },
    });

    if (!relationship) {
      throw new AppError(
        "Unauthorized: You can only manage nutrition plans for members with an active coaching relationship.",
        403,
      );
    }

    return true;
  }

  /**
   * Coach creates a personalized nutrition plan for a member.
   */
  public async createCoachPlan(
    coachId: string,
    memberId: string,
    payload: {
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
    },
    isAdmin = false,
  ) {
    await this.verifyCoachAuthorization(coachId, memberId, isAdmin);

    if (!payload.targetCalories || payload.targetCalories < 800) {
      throw new AppError("Target calories must be at least 800 kcal.", 400);
    }

    // 1. Validate and compute foods and meals server-side
    let cumulativeCalories = 0;
    let cumulativeProtein = 0;
    let cumulativeCarbs = 0;
    let cumulativeFat = 0;

    const validatedMeals: Array<{
      name: string;
      mealType: any;
      suggestedTime?: string;
      order: number;
      totalCalories: number;
      totalProteinG: number;
      totalCarbsG: number;
      totalFatG: number;
      items: Array<{
        foodId: string;
        foodNameSnapshot: string;
        quantity: number;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }>;
    }> = [];

    for (const meal of payload.meals) {
      let mealCal = 0;
      let mealProt = 0;
      let mealCarbs = 0;
      let mealFat = 0;
      const validatedItems: Array<{
        foodId: string;
        foodNameSnapshot: string;
        quantity: number;
        unit: string;
        calories: number;
        protein: number;
        carbs: number;
        fat: number;
      }> = [];

      for (const item of meal.items) {
        const food = await foodCatalogService.getFoodById(item.foodId);
        const calculated = foodCatalogService.calculateNutrients(
          food,
          item.quantity,
          item.unit,
        );

        mealCal += calculated.calories;
        mealProt += calculated.protein;
        mealCarbs += calculated.carbs;
        mealFat += calculated.fat;

        validatedItems.push({
          foodId: food.id,
          foodNameSnapshot: food.name,
          quantity: item.quantity,
          unit: item.unit || food.servingUnit,
          calories: calculated.calories,
          protein: calculated.protein,
          carbs: calculated.carbs,
          fat: calculated.fat,
        });
      }

      cumulativeCalories += mealCal;
      cumulativeProtein += mealProt;
      cumulativeCarbs += mealCarbs;
      cumulativeFat += mealFat;

      validatedMeals.push({
        name: meal.name,
        mealType: meal.mealType,
        suggestedTime: meal.suggestedTime,
        order: meal.order,
        totalCalories: mealCal,
        totalProteinG: Number(mealProt.toFixed(1)),
        totalCarbsG: Number(mealCarbs.toFixed(1)),
        totalFatG: Number(mealFat.toFixed(1)),
        items: validatedItems,
      });
    }

    // 2. Persist plan in transaction
    const savedPlan = await prisma.$transaction(async (tx) => {
      // Deactivate previous active plans
      await tx.nutritionPlan.updateMany({
        where: {
          memberId,
          status: "ACTIVE",
          isActive: true,
        },
        data: {
          status: "SUPERSEDED",
          isActive: false,
          deactivatedAt: new Date(),
        },
      });

      const count = await tx.nutritionPlan.count({ where: { memberId } });

      const newPlan = await tx.nutritionPlan.create({
        data: {
          memberId,
          coachId,
          name: payload.name,
          source: "COACH_ASSIGNED",
          status: "ACTIVE",
          targetCalories: payload.targetCalories,
          targetProteinG: payload.targetProteinG,
          targetCarbsG: payload.targetCarbsG,
          targetFatG: payload.targetFatG,
          totalPlanCalories: cumulativeCalories,
          totalPlanProteinG: Number(cumulativeProtein.toFixed(1)),
          totalPlanCarbsG: Number(cumulativeCarbs.toFixed(1)),
          totalPlanFatG: Number(cumulativeFat.toFixed(1)),
          version: count + 1,
          notes: payload.notes,
          isActive: true,
          activatedAt: new Date(),
          meals: {
            create: validatedMeals.map((m) => ({
              name: m.name,
              mealType: m.mealType,
              suggestedTime: m.suggestedTime,
              order: m.order,
              totalCalories: m.totalCalories,
              totalProteinG: m.totalProteinG,
              totalCarbsG: m.totalCarbsG,
              totalFatG: m.totalFatG,
              items: {
                create: m.items.map((it) => ({
                  foodId: it.foodId,
                  foodNameSnapshot: it.foodNameSnapshot,
                  quantity: it.quantity,
                  unit: it.unit,
                  calories: it.calories,
                  protein: it.protein,
                  carbs: it.carbs,
                  fat: it.fat,
                })),
              },
            })),
          },
        },
        include: {
          meals: { include: { items: true } },
        },
      });

      // Create notification for member
      await tx.notification.create({
        data: {
          userId: memberId,
          title: "New Nutrition Plan Assigned",
          message: `Your coach assigned a new nutrition plan: "${payload.name}" (${payload.targetCalories} kcal).`,
          type: "NUTRITION_PLAN_ASSIGNED" as any,
          actionUrl: "/nutrition",
        },
      });

      return newPlan;
    });

    return savedPlan;
  }
}

export const nutritionService = new NutritionService();
export default nutritionService;
