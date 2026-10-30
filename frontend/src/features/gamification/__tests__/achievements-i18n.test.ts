// src/features/gamification/__tests__/achievements-i18n.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const enFilePath = path.resolve(
  __dirname,
  "../../../i18n/locales/en/achievements.json",
);
const arFilePath = path.resolve(
  __dirname,
  "../../../i18n/locales/ar/achievements.json",
);

function getLeafKeys(obj: any, prefix = ""): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      Object.assign(result, getLeafKeys(v, fullKey));
    } else {
      result[fullKey] = String(v);
    }
  }
  return result;
}

const SYSTEM_ACHIEVEMENT_CODES = [
  "FIRST_WORKOUT",
  "WORKOUTS_5",
  "WORKOUTS_10",
  "WORKOUTS_25",
  "WORKOUTS_50",
  "WORKOUTS_100",
  "WEEKLY_GOAL_MET",
  "STREAK_3",
  "STREAK_7",
  "STREAK_14",
  "STREAK_30",
  "COMEBACK_CHAMPION",
  "FIRST_FOOD_LOG",
  "NUTRITION_STREAK_7",
  "NUTRITION_WEEKLY_TRACKER",
  "FIRST_MEASUREMENT",
  "PROGRESS_TRACKER",
];

describe("Achievements i18n Localization Integrity", () => {
  const enRaw = fs.readFileSync(enFilePath, "utf8");
  const arRaw = fs.readFileSync(arFilePath, "utf8");

  const enJson = JSON.parse(enRaw);
  const arJson = JSON.parse(arRaw);

  const enLeaves = getLeafKeys(enJson);
  const arLeaves = getLeafKeys(arJson);

  it("loads valid non-empty translation dictionaries for EN and AR", () => {
    assert.ok(Object.keys(enLeaves).length > 0, "EN translation dictionary is empty");
    assert.ok(Object.keys(arLeaves).length > 0, "AR translation dictionary is empty");
  });

  it("achieves 100% key parity between English and Arabic achievements.json", () => {
    const enKeys = Object.keys(enLeaves).sort();
    const arKeys = Object.keys(arLeaves).sort();

    const missingInAr = enKeys.filter((k) => !(k in arLeaves));
    const missingInEn = arKeys.filter((k) => !(k in enLeaves));

    assert.deepEqual(
      missingInAr,
      [],
      `Keys missing in Arabic dictionary: ${missingInAr.join(", ")}`,
    );
    assert.deepEqual(
      missingInEn,
      [],
      `Keys missing in English dictionary: ${missingInEn.join(", ")}`,
    );
    assert.equal(
      enKeys.length,
      arKeys.length,
      `Key count mismatch: EN has ${enKeys.length}, AR has ${arKeys.length}`,
    );
  });

  it("ensures no translation leaf key contains empty or whitespace-only values", () => {
    for (const [key, value] of Object.entries(enLeaves)) {
      assert.ok(
        value.trim().length > 0,
        `EN key '${key}' has empty or whitespace value`,
      );
    }
    for (const [key, value] of Object.entries(arLeaves)) {
      assert.ok(
        value.trim().length > 0,
        `AR key '${key}' has empty or whitespace value`,
      );
    }
  });

  it("ensures variable interpolation tokens match between EN and AR", () => {
    const extractVars = (str: string) => {
      const matches = str.match(/\{\{([^}]+)\}\}/g) || [];
      return matches.map((m) => m.trim()).sort();
    };

    for (const [key, enVal] of Object.entries(enLeaves)) {
      const arVal = arLeaves[key];
      const enVars = extractVars(enVal);
      const arVars = extractVars(arVal);

      assert.deepEqual(
        arVars,
        enVars,
        `Interpolation token mismatch in key '${key}': EN=[${enVars.join(
          ", ",
        )}], AR=[${arVars.join(", ")}]`,
      );
    }
  });

  it("contains all 17 system achievements with both title and description in both locales", () => {
    for (const code of SYSTEM_ACHIEVEMENT_CODES) {
      const titleKey = `items.${code}.title`;
      const descKey = `items.${code}.description`;

      assert.ok(
        titleKey in enLeaves,
        `Missing English title for system achievement: ${code}`,
      );
      assert.ok(
        descKey in enLeaves,
        `Missing English description for system achievement: ${code}`,
      );
      assert.ok(
        titleKey in arLeaves,
        `Missing Arabic title for system achievement: ${code}`,
      );
      assert.ok(
        descKey in arLeaves,
        `Missing Arabic description for system achievement: ${code}`,
      );

      // Verify authentic Arabic characters in Arabic titles and descriptions
      const arTitle = arLeaves[titleKey];
      const arDesc = arLeaves[descKey];
      const arabicRegex = /[\u0600-\u06FF]/;
      assert.ok(
        arabicRegex.test(arTitle),
        `Arabic title for '${code}' does not contain Arabic text: ${arTitle}`,
      );
      assert.ok(
        arabicRegex.test(arDesc),
        `Arabic description for '${code}' does not contain Arabic text: ${arDesc}`,
      );
    }
  });

  it("verifies celebration modal translation keys are fully specified", () => {
    const requiredCelebrationKeys = [
      "celebration.ariaTitle",
      "celebration.headerTag",
      "celebration.tierSuffix",
      "celebration.pointsLabel",
      "celebration.congratsLine1",
      "celebration.congratsLine2",
      "celebration.continueButton",
      "celebration.nextButton",
      "celebration.close",
    ];

    for (const key of requiredCelebrationKeys) {
      assert.ok(key in enLeaves, `Missing celebration key in EN: ${key}`);
      assert.ok(key in arLeaves, `Missing celebration key in AR: ${key}`);
    }
  });

  it("verifies athlete encouragement and member section keys are fully specified", () => {
    const requiredMemberKeys = [
      "memberSection.title",
      "memberSection.subtitle",
      "memberSection.encourageBtn",
      "memberSection.currentStreak",
      "memberSection.bestDays",
      "memberSection.thisWeek",
      "memberSection.workoutsCount",
      "memberSection.badgesEarned",
      "memberSection.recentUnlockedBadges",
      "memberSection.dialogTitle",
      "memberSection.dialogSubtitle",
      "memberSection.sentSuccessTitle",
      "memberSection.sentSuccessDesc",
      "memberSection.quickCheer",
      "memberSection.customMessage",
      "memberSection.placeholder",
      "memberSection.charsCount",
      "memberSection.sendFailed",
      "memberSection.cancel",
      "memberSection.sending",
      "memberSection.sendBtn",
      "memberSection.presets.preset1",
      "memberSection.presets.preset2",
      "memberSection.presets.preset3",
      "memberSection.presets.preset4",
    ];

    for (const key of requiredMemberKeys) {
      assert.ok(key in enLeaves, `Missing memberSection key in EN: ${key}`);
      assert.ok(key in arLeaves, `Missing memberSection key in AR: ${key}`);
    }
  });
});
