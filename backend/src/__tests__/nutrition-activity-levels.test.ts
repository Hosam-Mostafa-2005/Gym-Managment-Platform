import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { onboardingSchema } from "../validators/nutrition.validator.js";
import {
  NutritionCalculatorService,
  ACTIVITY_MULTIPLIERS,
} from "../services/nutrition-calculator.service.js";

describe("Part 2 — Nutrition Activity Levels Verification & Consistency", () => {
  const calculator = new NutritionCalculatorService();
  const sampleBmr = 1750;

  it("1. Verifies exact multipliers for all 5 official activity levels", () => {
    assert.equal(ACTIVITY_MULTIPLIERS["SEDENTARY"], 1.2);
    assert.equal(ACTIVITY_MULTIPLIERS["LIGHTLY_ACTIVE"], 1.375);
    assert.equal(ACTIVITY_MULTIPLIERS["MODERATELY_ACTIVE"], 1.55);
    assert.equal(ACTIVITY_MULTIPLIERS["VERY_ACTIVE"], 1.725);
    assert.equal(ACTIVITY_MULTIPLIERS["EXTRA_ACTIVE"], 1.9);
  });

  it("2. Verifies EXTREMELY_ACTIVE alias preserves exact 1.9 multiplier", () => {
    assert.equal(ACTIVITY_MULTIPLIERS["EXTREMELY_ACTIVE"], 1.9);
    assert.equal(
      calculator.calculateTdee(sampleBmr, "EXTREMELY_ACTIVE"),
      calculator.calculateTdee(sampleBmr, "EXTRA_ACTIVE"),
    );
  });

  it("3. Validates onboarding schema parses and accepts every activity level", () => {
    const supportedLevels = [
      { input: "SEDENTARY", expected: "SEDENTARY" },
      { input: "LIGHTLY_ACTIVE", expected: "LIGHTLY_ACTIVE" },
      { input: "MODERATELY_ACTIVE", expected: "MODERATELY_ACTIVE" },
      { input: "VERY_ACTIVE", expected: "VERY_ACTIVE" },
      { input: "EXTRA_ACTIVE", expected: "EXTRA_ACTIVE" },
      { input: "EXTREMELY_ACTIVE", expected: "EXTRA_ACTIVE" }, // normalized to DB enum
    ] as const;

    for (const { input, expected } of supportedLevels) {
      const payload = {
        body: {
          age: 28,
          gender: "MALE" as const,
          heightCm: 178,
          currentWeightKg: 75,
          activityLevel: input,
          goal: "MAINTENANCE" as const,
        },
      };

      const parsed = onboardingSchema.safeParse(payload);
      assert.ok(parsed.success, `Failed to parse activityLevel: ${input}`);
      if (parsed.success) {
        assert.equal(parsed.data.body.activityLevel, expected);
      }
    }
  });

  it("4. Rejects invalid activity level strings safely", () => {
    const payload = {
      body: {
        age: 28,
        gender: "MALE" as const,
        heightCm: 178,
        currentWeightKg: 75,
        activityLevel: "HYPER_ACTIVE",
        goal: "MAINTENANCE" as const,
      },
    };

    const parsed = onboardingSchema.safeParse(payload);
    assert.equal(parsed.success, false);
  });
});
