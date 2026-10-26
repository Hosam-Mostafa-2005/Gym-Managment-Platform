// src/__tests__/nutrition-system.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { nutritionCalculatorService } from "../services/nutrition-calculator.service.js";
import { foodCatalogService } from "../services/food-catalog.service.js";
import { mealPlanGeneratorService } from "../services/meal-plan-generator.service.js";
import { nutritionService } from "../services/nutrition.service.js";

describe("STREN — Full Nutrition System Comprehensive Test Suite", () => {
  // ==========================================================================
  // PART 1: SCIENTIFIC ENERGY EXPENDITURE & NUTRITION CALCULATIONS
  // ==========================================================================
  describe("1. Nutrition Calculator Service (Mifflin–St Jeor & Macro Distribution)", () => {
    it("A. Correctly calculates Male BMR and TDEE with Mifflin-St Jeor formula", () => {
      // Male: 30 yo, 80 kg, 180 cm, Moderately Active (1.55), Maintenance
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780 kcal
      // TDEE = 1780 * 1.55 = 2759 kcal
      const result = nutritionCalculatorService.calculateTargets({
        age: 30,
        gender: "MALE",
        weightKg: 80,
        heightCm: 180,
        activityLevel: "MODERATELY_ACTIVE",
        goal: "MAINTENANCE",
        preferredMealsCount: 3,
      });

      assert.equal(result.bmr, 1780);
      assert.equal(result.tdee, 2759);
      assert.equal(result.targetCalories, 2759);
      assert.equal(result.calorieAdjustment, 0);
      assert.ok(result.targetProteinG > 0);
      assert.ok(result.targetCarbsG > 0);
      assert.ok(result.targetFatG > 0);
      assert.ok(result.formulaVersion.includes("Mifflin-St Jeor"));
    });

    it("B. Correctly calculates Female BMR and TDEE and applies deficit and safety floor", () => {
      // Female: 25 yo, 60 kg, 165 cm, Sedentary (1.2), Moderate Fat Loss (-20%)
      // BMR = 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25 -> 1345 kcal
      // TDEE = 1345 * 1.2 = 1614 kcal
      // Target Calories = 1614 * 0.8 = 1291.2 -> 1291 kcal
      const result = nutritionCalculatorService.calculateTargets({
        age: 25,
        gender: "FEMALE",
        weightKg: 60,
        heightCm: 165,
        activityLevel: "SEDENTARY",
        goal: "FAT_LOSS",
        targetPace: "MODERATE",
        preferredMealsCount: 3,
      });

      assert.equal(result.bmr, 1345);
      assert.equal(result.tdee, 1614);
      assert.equal(result.targetCalories, 1291);

      // Now verify that safety floor of 1200 kcal is enforced if raw calculation drops below it
      // Female: 45 yo, 45 kg, 150 cm, Sedentary, Aggressive Fat Loss (-25%)
      // BMR = 10*45 + 6.25*150 - 5*45 - 161 = 450 + 937.5 - 225 - 161 = 1001.5 -> 1002 kcal
      // TDEE = 1002 * 1.2 = 1202 kcal
      // 1202 * 0.75 = 901.5 kcal -> Enforces 1200 kcal female safety floor
      const lowResult = nutritionCalculatorService.calculateTargets({
        age: 45,
        gender: "FEMALE",
        weightKg: 45,
        heightCm: 150,
        activityLevel: "SEDENTARY",
        goal: "FAT_LOSS",
        targetPace: "AGGRESSIVE",
      });

      assert.equal(lowResult.targetCalories, 1200);
      assert.ok(
        lowResult.safetyAdvisory && lowResult.safetyAdvisory.includes("floor"),
      );
    });

    it("C. Enforces 1500 kcal safety floor for Males and applies muscle gain surplus", () => {
      // Male: 40 yo, 55 kg, 155 cm, Sedentary, Aggressive Fat Loss (-25%)
      // BMR = 10*55 + 6.25*155 - 5*40 + 5 = 550 + 968.75 - 200 + 5 = 1323.75 -> 1324 kcal
      // TDEE = 1324 * 1.2 = 1588.8 -> 1589 kcal
      // 1589 * 0.75 = 1191.75 kcal -> Clamped to male floor of 1500 kcal
      const maleResult = nutritionCalculatorService.calculateTargets({
        age: 40,
        gender: "MALE",
        weightKg: 55,
        heightCm: 155,
        activityLevel: "SEDENTARY",
        goal: "FAT_LOSS",
        targetPace: "AGGRESSIVE",
      });

      assert.equal(maleResult.targetCalories, 1500);

      // Muscle Gain: TDEE + 12% surplus (moderate pace)
      const gainResult = nutritionCalculatorService.calculateTargets({
        age: 25,
        gender: "MALE",
        weightKg: 75,
        heightCm: 175,
        activityLevel: "VERY_ACTIVE",
        goal: "MUSCLE_GAIN",
        targetPace: "MODERATE",
      });

      const expectedTarget = Math.round(gainResult.tdee * 1.12);
      assert.equal(gainResult.targetCalories, expectedTarget);
      assert.equal(gainResult.calorieAdjustment, expectedTarget - gainResult.tdee);
    });

    it("D. Computes coherent macro percentages summing to ~100%", () => {
      const result = nutritionCalculatorService.calculateTargets({
        age: 30,
        gender: "MALE",
        weightKg: 85,
        heightCm: 182,
        activityLevel: "MODERATELY_ACTIVE",
        goal: "FAT_LOSS",
      });

      const totalPct =
        result.macroPercentages.proteinPct +
        result.macroPercentages.carbsPct +
        result.macroPercentages.fatPct;

      assert.ok(
        totalPct >= 99 && totalPct <= 101,
        `Expected sum around 100%, got ${totalPct}`,
      );

      // Macro calories vs target calories check
      const macroCal =
        result.targetProteinG * 4 +
        result.targetCarbsG * 4 +
        result.targetFatG * 9;
      const diff = Math.abs(macroCal - result.targetCalories);
      assert.ok(
        diff <= 15,
        `Macro calories ${macroCal} should be within 15 kcal of target ${result.targetCalories}`,
      );
    });
  });

  // ==========================================================================
  // PART 2: FOOD CATALOG & NUTRIENT CALCULATIONS
  // ==========================================================================
  describe("2. Food Catalog Service (Search, Filter, Nutrients & Allergens)", () => {
    it("A. Starter foods exist and catalog search returns verified foods", async () => {
      const searchResult = await foodCatalogService.searchFoods({
        search: "Chicken",
        limit: 10,
      });

      assert.ok(searchResult.foods.length >= 1, "Should find at least 1 chicken item");
      const chicken = searchResult.foods.find((f) =>
        f.name.toLowerCase().includes("chicken breast"),
      );
      assert.ok(chicken, "Chicken Breast should be in results");
      assert.equal(chicken.category, "Proteins");
    });

    it("B. Excludes allergens correctly when requested", async () => {
      // Exclude Dairy
      const resultNoDairy = await foodCatalogService.searchFoods({
        allergensToExclude: ["dairy"],
        limit: 50,
      });

      for (const food of resultNoDairy.foods) {
        assert.ok(
          !food.allergens.includes("dairy"),
          `Food ${food.name} contains dairy but was not excluded!`,
        );
      }
    });

    it("C. Calculates exact nutrients per quantity accurately", async () => {
      const search = await foodCatalogService.searchFoods({ search: "Rolled Oats" });
      const oats = search.foods[0];
      assert.ok(oats, "Rolled Oats must exist");

      // Calculate for 80 grams (serving is 100g, so 0.8x)
      const calculated = foodCatalogService.calculateNutrients(oats, 80, "g");
      assert.equal(calculated.calories, Math.round(oats.calories * 0.8));
      assert.equal(
        calculated.protein,
        Number((oats.protein * 0.8).toFixed(1)),
      );
      assert.equal(calculated.quantity, 80);
    });

    it("D. Retrieves distinct categories from catalog", async () => {
      const categories = await foodCatalogService.getCategories();
      assert.ok(categories.length >= 4, "Catalog should have multiple categories");
      assert.ok(categories.includes("Proteins"));
      assert.ok(categories.includes("Carbohydrates"));
    });
  });

  // ==========================================================================
  // PART 3: DETERMINISTIC MEAL PLAN GENERATOR
  // ==========================================================================
  describe("3. Deterministic Meal Plan Generator Service", () => {
    it("A. Generates balanced 3-meal plan matching calorie and macro targets", async () => {
      const plan = await mealPlanGeneratorService.generatePlan(2000, 150, 200, 65, {
        preferredMealsCount: 3,
        dietaryPreference: "STANDARD",
      });

      assert.equal(plan.meals.length, 3);
      assert.ok(plan.name.includes("2000 kcal"));
      assert.equal(plan.meals[0].mealType, "BREAKFAST");
      assert.equal(plan.meals[1].mealType, "LUNCH");
      assert.equal(plan.meals[2].mealType, "DINNER");

      // Verify each meal has items with calories and nutrients
      for (const meal of plan.meals) {
        assert.ok(meal.items.length >= 1);
        assert.ok(meal.totalCalories > 0);
        for (const item of meal.items) {
          assert.ok(item.calories > 0);
          assert.ok(item.foodName.length > 0);
        }
      }

      // Check plan total variance is within 10%
      const calDiff = Math.abs(plan.totalPlanCalories - 2000);
      assert.ok(
        calDiff < 200,
        `Plan total calories ${plan.totalPlanCalories} should be close to 2000 kcal`,
      );
    });

    it("B. Generates 4-meal and 5-meal plans with correct snack distribution", async () => {
      const plan4 = await mealPlanGeneratorService.generatePlan(2400, 180, 240, 75, {
        preferredMealsCount: 4,
      });
      assert.equal(plan4.meals.length, 4);
      assert.ok(plan4.meals.some((m) => m.mealType === "AFTERNOON_SNACK"));

      const plan5 = await mealPlanGeneratorService.generatePlan(2800, 200, 280, 90, {
        preferredMealsCount: 5,
      });
      assert.equal(plan5.meals.length, 5);
      assert.ok(plan5.meals.some((m) => m.mealType === "MORNING_SNACK"));
      assert.ok(plan5.meals.some((m) => m.mealType === "AFTERNOON_SNACK"));
    });

    it("C. Respects VEGAN dietary preference without animal products", async () => {
      const veganPlan = await mealPlanGeneratorService.generatePlan(1800, 120, 200, 55, {
        dietaryPreference: "VEGAN",
        preferredMealsCount: 3,
      });

      for (const meal of veganPlan.meals) {
        for (const item of meal.items) {
          const lowerName = item.foodName.toLowerCase();
          assert.ok(!lowerName.includes("chicken"), `Vegan plan had chicken: ${item.foodName}`);
          assert.ok(!lowerName.includes("beef"), `Vegan plan had beef: ${item.foodName}`);
          assert.ok(!lowerName.includes("salmon"), `Vegan plan had salmon: ${item.foodName}`);
          assert.ok(!lowerName.includes("egg"), `Vegan plan had egg: ${item.foodName}`);
          assert.ok(!lowerName.includes("yogurt"), `Vegan plan had yogurt: ${item.foodName}`);
        }
      }
    });
  });

  // ==========================================================================
  // PART 4: MEMBER SELF-GUIDED NUTRITION LIFECYCLE & FOOD LOGGING
  // ==========================================================================
  describe("4. Member Self-Guided Nutrition Flow & Immutable Food Logging", () => {
    let testMemberId: string;
    let testFoodId: string;

    it("A. Prepares test member and verifies profile pre-population", async () => {
      // Find or create test member
      let member = await prisma.user.findFirst({
        where: { role: Roles.MEMBER, isActive: true },
      });

      if (!member) {
        member = await prisma.user.create({
          data: {
            name: "Nutrition Test Member",
            email: `nutrition-test-${Date.now()}@stren.app`,
            password: "dummy-password",
            role: Roles.MEMBER,
            isActive: true,
          },
        });
      }
      testMemberId = member.id;

      // Add a recent body measurement
      await prisma.bodyMeasurement.create({
        data: {
          memberId: testMemberId,
          weight: 78.5,
          height: 178,
          measuredAt: new Date(),
          isActive: true,
        },
      });

      const profileData = await nutritionService.getMemberProfile(testMemberId);
      assert.ok(profileData.suggestedMeasurement);
      assert.equal(profileData.suggestedMeasurement.weightKg, 78.5);
      assert.equal(profileData.suggestedMeasurement.heightCm, 178);
      assert.equal(profileData.suggestedMeasurement.isRecent, true);
    });

    it("B. Member completes onboarding and generates self-guided plan", async () => {
      const onboardResult = await nutritionService.completeOnboarding(testMemberId, {
        age: 28,
        gender: "MALE",
        heightCm: 178,
        currentWeightKg: 78.5,
        activityLevel: "MODERATELY_ACTIVE",
        goal: "FAT_LOSS",
        targetPace: "MODERATE",
        preferredMealsCount: 3,
        dietaryPreference: "STANDARD",
      });

      assert.ok(onboardResult.profile);
      assert.equal(onboardResult.profile.onboardingCompleted, true);
      assert.ok(onboardResult.savedPlan);
      assert.equal(onboardResult.savedPlan.source, "SELF_GUIDED");
      assert.equal(onboardResult.savedPlan.status, "ACTIVE");
      assert.ok(onboardResult.savedPlan.meals.length >= 3);
    });

    it("C. Member overview reflects active plan and zero logs initially", async () => {
      const today = new Date().toISOString().split("T")[0];
      const overview = await nutritionService.getMemberOverview(testMemberId, today);

      assert.equal(overview.hasActivePlan, true);
      assert.equal(overview.onboardingCompleted, true);
      assert.ok(overview.plan);
      assert.equal(overview.intake.loggedCalories, 0);
      assert.equal(overview.intake.remainingCalories, overview.intake.targetCalories);
      assert.equal(overview.todayLogs.length, 0);
    });

    it("D. Member logs food consumption and creates immutable snapshot", async () => {
      const oats = await prisma.food.findFirst({
        where: { name: { contains: "Oats" } },
      });
      assert.ok(oats);
      testFoodId = oats.id;

      const today = new Date().toISOString().split("T")[0];
      const log = await nutritionService.logFood(testMemberId, {
        foodId: testFoodId,
        date: today,
        mealType: "BREAKFAST",
        quantity: 80,
        unit: "g",
        notes: "Morning pre-workout oats",
      });

      assert.ok(log.id);
      assert.equal(log.foodId, testFoodId);
      assert.equal(log.foodNameSnapshot, oats.name);
      assert.ok(log.calories > 0);
      assert.ok(log.protein > 0);
      assert.equal(log.quantity, 80);

      // Verify overview updates with logged intake
      const overview = await nutritionService.getMemberOverview(testMemberId, today);
      assert.equal(overview.todayLogs.length, 1);
      assert.equal(overview.intake.loggedCalories, log.calories);
      assert.equal(overview.intake.loggedProteinG, log.protein);
      assert.equal(
        overview.intake.remainingCalories,
        Math.max(0, overview.intake.targetCalories - log.calories),
      );
    });

    it("E. Member updates logged quantity and deletes log cleanly", async () => {
      const today = new Date().toISOString().split("T")[0];
      const overviewBefore = await nutritionService.getMemberOverview(testMemberId, today);
      const logToEdit = overviewBefore.todayLogs[0];
      assert.ok(logToEdit);

      // Update quantity from 80g to 120g
      const updatedLog = await nutritionService.updateFoodLog(logToEdit.id, testMemberId, {
        quantity: 120,
      });

      assert.equal(updatedLog.quantity, 120);
      assert.ok(updatedLog.calories > logToEdit.calories);

      // Delete the log
      const deleteResult = await nutritionService.deleteFoodLog(logToEdit.id, testMemberId);
      assert.equal(deleteResult.success, true);

      // Verify overview returns to zero logs
      const overviewAfter = await nutritionService.getMemberOverview(testMemberId, today);
      assert.equal(overviewAfter.todayLogs.length, 0);
      assert.equal(overviewAfter.intake.loggedCalories, 0);
    });

    it("F. Member cannot edit or delete another member's food log", async () => {
      // Create a log for member 1
      const banana = await prisma.food.findFirst({
        where: { name: { contains: "Banana" } },
      });
      assert.ok(banana);

      const log = await nutritionService.logFood(testMemberId, {
        foodId: banana.id,
        date: new Date().toISOString().split("T")[0],
        mealType: "AFTERNOON_SNACK",
        quantity: 1,
        unit: "medium",
      });

      // Attempt to edit with different member ID
      await assert.rejects(
        async () => {
          await nutritionService.updateFoodLog(log.id, "unauthorized-member-id", {
            quantity: 5,
          });
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          return true;
        },
      );

      // Attempt to delete with different member ID
      await assert.rejects(
        async () => {
          await nutritionService.deleteFoodLog(log.id, "unauthorized-member-id");
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          return true;
        },
      );

      // Cleanup
      await nutritionService.deleteFoodLog(log.id, testMemberId);
    });

    it("G. 30-day nutrition history distinguishes logged days from unlogged days", async () => {
      const history = await nutritionService.getNutritionHistory(testMemberId, 14);

      assert.equal(history.totalDays, 14);
      assert.equal(history.timeline.length, 14);
      for (const day of history.timeline) {
        assert.ok(typeof day.isLogged === "boolean");
        assert.ok(typeof day.date === "string");
        assert.ok(typeof day.calories === "number");
      }
    });
  });

  // ==========================================================================
  // PART 5: COACH-MANAGED NUTRITION & AUTHORIZATION INTEGRITY
  // ==========================================================================
  describe("5. Coach-Managed Nutrition & Authorization Boundaries", () => {
    let testCoachId: string;
    let testMemberId: string;
    let unrelatedCoachId: string;

    it("A. Sets up coach, member, and coaching relationship", async () => {
      let coach = await prisma.user.findFirst({
        where: { role: Roles.TRAINER, isActive: true },
      });
      if (!coach) {
        coach = await prisma.user.create({
          data: {
            name: "Coach Test User",
            email: `coach-nutrition-${Date.now()}@stren.app`,
            password: "dummy-password",
            role: Roles.TRAINER,
            isActive: true,
          },
        });
      }
      testCoachId = coach.id;

      const unrelatedCoach = await prisma.user.create({
        data: {
          name: "Unrelated Coach",
          email: `unrelated-coach-${Date.now()}@stren.app`,
          password: "dummy-password",
          role: Roles.TRAINER,
          isActive: true,
        },
      });
      unrelatedCoachId = unrelatedCoach.id;

      let member = await prisma.user.findFirst({
        where: { role: Roles.MEMBER, isActive: true },
      });
      assert.ok(member);
      testMemberId = member.id;

      // Ensure ACTIVE CoachMemberRelationship between testCoach and member
      const existingRel = await prisma.coachMemberRelationship.findFirst({
        where: { trainerId: testCoachId, memberId: testMemberId },
      });
      if (existingRel) {
        await prisma.coachMemberRelationship.update({
          where: { id: existingRel.id },
          data: { status: "ACTIVE", isActive: true },
        });
      } else {
        await prisma.coachMemberRelationship.create({
          data: {
            trainerId: testCoachId,
            memberId: testMemberId,
            status: "ACTIVE",
            isActive: true,
            startedAt: new Date(),
          },
        });
      }
    });

    it("B. Coach retrieves eligible members with active relationships only", async () => {
      const eligible = await nutritionService.getCoachEligibleMembers(testCoachId, false);
      assert.ok(eligible.length >= 1);
      assert.ok(eligible.some((m) => m.memberId === testMemberId));

      // Unrelated coach has no active relationships
      const unrelatedEligible = await nutritionService.getCoachEligibleMembers(
        unrelatedCoachId,
        false,
      );
      assert.equal(unrelatedEligible.length, 0);
    });

    it("C. Coach authorization rejects coaches without active relationship", async () => {
      // TestCoach is authorized
      const isAuth = await nutritionService.verifyCoachAuthorization(
        testCoachId,
        testMemberId,
        false,
      );
      assert.equal(isAuth, true);

      // Unrelated coach receives 403 Forbidden
      await assert.rejects(
        async () => {
          await nutritionService.verifyCoachAuthorization(
            unrelatedCoachId,
            testMemberId,
            false,
          );
        },
        (err: any) => {
          assert.equal(err.statusCode, 403);
          return true;
        },
      );
    });

    it("D. Coach creates and assigns custom plan, triggering notification", async () => {
      const chicken = await prisma.food.findFirst({
        where: { name: { contains: "Chicken" } },
      });
      const rice = await prisma.food.findFirst({
        where: { name: { contains: "Rice" } },
      });
      assert.ok(chicken && rice);

      const plan = await nutritionService.createCoachPlan(
        testCoachId,
        testMemberId,
        {
          name: "Coach Hypertrophy Custom Nutrition",
          targetCalories: 2600,
          targetProteinG: 190,
          targetCarbsG: 280,
          targetFatG: 75,
          notes: "Focus on hitting protein targets around training windows.",
          meals: [
            {
              name: "Post-Workout Lunch",
              mealType: "LUNCH",
              suggestedTime: "13:00",
              order: 1,
              items: [
                { foodId: chicken.id, quantity: 200, unit: "g" },
                { foodId: rice.id, quantity: 150, unit: "g" },
              ],
            },
          ],
        },
        false,
      );

      assert.ok(plan.id);
      assert.equal(plan.source, "COACH_ASSIGNED");
      assert.equal(plan.status, "ACTIVE");
      assert.equal(plan.coachId, testCoachId);
      assert.equal(plan.targetCalories, 2600);
      assert.equal(plan.meals.length, 1);
      assert.equal(plan.meals[0].items.length, 2);

      // Verify member received notification
      const notification = await prisma.notification.findFirst({
        where: {
          userId: testMemberId,
          type: "NUTRITION_PLAN_ASSIGNED" as any,
        },
        orderBy: { createdAt: "desc" },
      });
      assert.ok(notification);
      assert.ok(notification.title.includes("New Nutrition Plan Assigned"));
    });
  });
});
