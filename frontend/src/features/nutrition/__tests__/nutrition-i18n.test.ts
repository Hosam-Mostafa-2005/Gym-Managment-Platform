import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Nutrition i18n Localization Integrity", () => {
  const enPath = path.resolve(__dirname, "../../../i18n/locales/en/nutrition.json");
  const arPath = path.resolve(__dirname, "../../../i18n/locales/ar/nutrition.json");

  it("should have both en and ar nutrition locale files", () => {
    assert.ok(fs.existsSync(enPath), "en/nutrition.json must exist");
    assert.ok(fs.existsSync(arPath), "ar/nutrition.json must exist");
  });

  const en = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const ar = JSON.parse(fs.readFileSync(arPath, "utf-8"));

  function flattenKeys(obj: any, prefix = ""): Record<string, string> {
    let result: Record<string, string> = {};
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === "object" && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenKeys(obj[key], fullPath));
      } else {
        result[fullPath] = String(obj[key]);
      }
    }
    return result;
  }

  const enFlat = flattenKeys(en);
  const arFlat = flattenKeys(ar);

  it("should have 100% key parity between English and Arabic", () => {
    const enKeys = Object.keys(enFlat).sort();
    const arKeys = Object.keys(arFlat).sort();

    const missingInAr = enKeys.filter((k) => !arFlat[k]);
    const missingInEn = arKeys.filter((k) => !enFlat[k]);

    assert.deepEqual(
      missingInAr,
      [],
      `Arabic is missing keys: ${missingInAr.join(", ")}`,
    );
    assert.deepEqual(
      missingInEn,
      [],
      `English is missing keys: ${missingInEn.join(", ")}`,
    );
    assert.equal(enKeys.length, arKeys.length);
    assert.ok(enKeys.length >= 300, `Expected at least 300 keys, found ${enKeys.length}`);
  });

  it("should have non-empty string values for all keys in both locales", () => {
    for (const [key, val] of Object.entries(enFlat)) {
      assert.ok(val.trim().length > 0, `English key ${key} has empty value`);
    }
    for (const [key, val] of Object.entries(arFlat)) {
      assert.ok(val.trim().length > 0, `Arabic key ${key} has empty value`);
    }
  });

  it("should preserve interpolation variables between English and Arabic", () => {
    const variableRegex = /{{([^}]+)}}/g;

    for (const [key, enVal] of Object.entries(enFlat)) {
      const arVal = arFlat[key];
      const enVars = (enVal.match(variableRegex) || []).map((v) => v.trim()).sort();
      const arVars = (arVal.match(variableRegex) || []).map((v) => v.trim()).sort();

      assert.deepEqual(
        enVars,
        arVars,
        `Variable mismatch at key "${key}": EN has [${enVars.join(", ")}], AR has [${arVars.join(", ")}]`,
      );
    }
  });

  it("should contain all meal types in meals dictionary", () => {
    const mealKeys = [
      "BREAKFAST",
      "MORNING_SNACK",
      "LUNCH",
      "AFTERNOON_SNACK",
      "DINNER",
      "EVENING_SNACK",
      "PRE_WORKOUT",
      "POST_WORKOUT",
    ];

    for (const meal of mealKeys) {
      assert.ok(en.meals[meal], `Missing EN meal type: ${meal}`);
      assert.ok(ar.meals[meal], `Missing AR meal type: ${meal}`);
    }
  });

  it("should contain all assessment steps and calculation terms", () => {
    assert.ok(en.assessment.steps.metrics);
    assert.ok(en.assessment.steps.activity);
    assert.ok(en.assessment.steps.goal);
    assert.ok(en.assessment.steps.dietAndAllergies);
    assert.ok(en.assessment.steps.reviewAndActivate);

    assert.ok(ar.assessment.steps.metrics);
    assert.ok(ar.assessment.steps.activity);
    assert.ok(ar.assessment.steps.goal);
    assert.ok(ar.assessment.steps.dietAndAllergies);
    assert.ok(ar.assessment.steps.reviewAndActivate);

    assert.ok(en.assessment.bmrLabel);
    assert.ok(en.assessment.tdeeLabel);
    assert.ok(ar.assessment.bmrLabel);
    assert.ok(ar.assessment.tdeeLabel);
  });

  it("should contain all dashboardCard and coach keys", () => {
    assert.ok(en.dashboardCard.title);
    assert.ok(en.dashboardCard.caloriesToday);
    assert.ok(en.dashboardCard.setUpPlan);
    assert.ok(ar.dashboardCard.title);
    assert.ok(ar.dashboardCard.caloriesToday);
    assert.ok(ar.dashboardCard.setUpPlan);

    assert.ok(en.coach.title);
    assert.ok(en.coach.managePlanAndLogs);
    assert.ok(en.coach.builderHeading);
    assert.ok(ar.coach.title);
    assert.ok(ar.coach.managePlanAndLogs);
    assert.ok(ar.coach.builderHeading);
  });
});