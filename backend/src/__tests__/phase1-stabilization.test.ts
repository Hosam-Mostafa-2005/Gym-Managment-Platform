import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { onboardingSchema } from "../validators/nutrition.validator.js";
import { NutritionCalculatorService, ACTIVITY_MULTIPLIERS } from "../services/nutrition-calculator.service.js";

describe("Phase 1 — Product Stabilization & API Contracts", () => {
  describe("1. Nutrition Activity Level Alignment & Resilience", () => {
    it("accepts EXTRA_ACTIVE in onboarding schema", () => {
      const payload = {
        body: {
          age: 26,
          gender: "MALE" as const,
          heightCm: 180,
          currentWeightKg: 80,
          activityLevel: "EXTRA_ACTIVE" as const,
          goal: "MUSCLE_GAIN" as const,
        },
      };

      const result = onboardingSchema.safeParse(payload);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.body.activityLevel, "EXTRA_ACTIVE");
      }
    });

    it("accepts and normalizes EXTREMELY_ACTIVE to EXTRA_ACTIVE", () => {
      const payload = {
        body: {
          age: 30,
          gender: "FEMALE" as const,
          heightCm: 165,
          currentWeightKg: 62,
          activityLevel: "EXTREMELY_ACTIVE" as const,
          goal: "FAT_LOSS" as const,
        },
      };

      const result = onboardingSchema.safeParse(payload);
      assert.equal(result.success, true);
      if (result.success) {
        assert.equal(result.data.body.activityLevel, "EXTRA_ACTIVE");
      }
    });

    it("evaluates correct TDEE multiplier for EXTRA_ACTIVE and EXTREMELY_ACTIVE", () => {
      const calculator = new NutritionCalculatorService();
      const bmr = 1800;

      const tdeeExtra = calculator.calculateTdee(bmr, "EXTRA_ACTIVE");
      assert.equal(tdeeExtra, Math.round(1800 * 1.9));

      const tdeeExtremely = calculator.calculateTdee(bmr, "EXTREMELY_ACTIVE");
      assert.equal(tdeeExtremely, Math.round(1800 * 1.9));
      assert.equal(ACTIVITY_MULTIPLIERS["EXTRA_ACTIVE"], 1.9);
      assert.equal(ACTIVITY_MULTIPLIERS["EXTREMELY_ACTIVE"], 1.9);
    });
  });

  describe("2. Activity Level Multiplier Consistency", () => {
    it("has multiplier defined for all supported activity levels", () => {
      const levels = [
        "SEDENTARY",
        "LIGHTLY_ACTIVE",
        "MODERATELY_ACTIVE",
        "VERY_ACTIVE",
        "EXTRA_ACTIVE",
        "EXTREMELY_ACTIVE",
      ] as const;

      for (const level of levels) {
        const mult = ACTIVITY_MULTIPLIERS[level];
        assert.ok(mult && mult >= 1.2 && mult <= 2.0, `Multiplier for ${level} should be valid`);
      }
    });
  });
});
