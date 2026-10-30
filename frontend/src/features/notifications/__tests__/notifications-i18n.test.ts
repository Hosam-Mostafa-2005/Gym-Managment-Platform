import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  localizeNotification,
  formatNotificationTimeAgo,
} from "../utils/notification-localization";
import type { Notification } from "../types/notifications.types";

interface TranslationNode {
  [key: string]: string | TranslationNode;
}

const enPath = path.resolve(
  process.cwd(),
  "src/i18n/locales/en/notifications.json"
);
const arPath = path.resolve(
  process.cwd(),
  "src/i18n/locales/ar/notifications.json"
);

function getLeafKeys(obj: TranslationNode, prefix = ""): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      keys = keys.concat(getLeafKeys(value as TranslationNode, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function getLeafValue(obj: TranslationNode, keyPath: string): string {
  const parts = keyPath.split(".");
  let curr: any = obj;
  for (const part of parts) {
    curr = curr?.[part];
  }
  return typeof curr === "string" ? curr : "";
}

function extractInterpolationTokens(str: string): string[] {
  const matches = str.match(/{{([^{}]+)}}/g);
  if (!matches) return [];
  return matches.map((m) => m.replace(/[{}]/g, "").trim()).sort();
}

describe("Notifications i18n Localization Integrity", () => {
  const enJson: TranslationNode = JSON.parse(fs.readFileSync(enPath, "utf-8"));
  const arJson: TranslationNode = JSON.parse(fs.readFileSync(arPath, "utf-8"));

  it("loads valid non-empty translation dictionaries for EN and AR", () => {
    assert.ok(Object.keys(enJson).length > 0, "EN notifications.json must not be empty");
    assert.ok(Object.keys(arJson).length > 0, "AR notifications.json must not be empty");
  });

  it("achieves 100% key parity between English and Arabic notifications.json", () => {
    const enKeys = getLeafKeys(enJson).sort();
    const arKeys = getLeafKeys(arJson).sort();

    const missingInAr = enKeys.filter((k) => !arKeys.includes(k));
    const missingInEn = arKeys.filter((k) => !enKeys.includes(k));

    assert.deepEqual(
      missingInAr,
      [],
      `Missing keys in Arabic notifications.json: ${missingInAr.join(", ")}`
    );
    assert.deepEqual(
      missingInEn,
      [],
      `Unexpected keys in Arabic notifications.json: ${missingInEn.join(", ")}`
    );
    assert.equal(
      enKeys.length,
      arKeys.length,
      "Both locales must contain exactly the same number of keys"
    );
  });

  it("ensures no translation leaf key contains empty or whitespace-only values", () => {
    const enKeys = getLeafKeys(enJson);
    const arKeys = getLeafKeys(arJson);

    for (const key of enKeys) {
      const val = getLeafValue(enJson, key);
      assert.ok(
        val && val.trim().length > 0,
        `EN key "${key}" contains empty value`
      );
    }

    for (const key of arKeys) {
      const val = getLeafValue(arJson, key);
      assert.ok(
        val && val.trim().length > 0,
        `AR key "${key}" contains empty value`
      );
    }
  });

  it("ensures variable interpolation tokens match between EN and AR", () => {
    const enKeys = getLeafKeys(enJson);

    for (const key of enKeys) {
      const enVal = getLeafValue(enJson, key);
      const arVal = getLeafValue(arJson, key);

      const enTokens = extractInterpolationTokens(enVal);
      const arTokens = extractInterpolationTokens(arVal);

      assert.deepEqual(
        enTokens,
        arTokens,
        `Interpolation token mismatch for key "${key}": EN has [${enTokens.join(
          ", "
        )}], AR has [${arTokens.join(", ")}]`
      );
    }
  });

  it("verifies Header dropdown and page structure keys are present", () => {
    assert.ok(getLeafValue(enJson, "header.title"));
    assert.ok(getLeafValue(arJson, "header.title"));
    assert.ok(getLeafValue(enJson, "dropdown.title"));
    assert.ok(getLeafValue(arJson, "dropdown.title"));
    assert.ok(getLeafValue(enJson, "dropdown.viewAll"));
    assert.ok(getLeafValue(arJson, "dropdown.viewAll"));
    assert.ok(getLeafValue(enJson, "filters.categories.WORKOUT"));
    assert.ok(getLeafValue(arJson, "filters.categories.WORKOUT"));
    assert.ok(getLeafValue(enJson, "preferences.workout.title"));
    assert.ok(getLeafValue(arJson, "preferences.workout.title"));
  });

  it("localizes notifications correctly in English and Arabic preserving user data", () => {
    // Simple mock translation function mimicking react-i18next
    const mockT = (key: string, options?: Record<string, any>) => {
      const cleanKey = key.replace(/^notifications:/, "");
      const dict = options?.lng === "ar" ? arJson : enJson;
      let text = getLeafValue(dict, cleanKey) || cleanKey;
      if (options) {
        for (const [k, v] of Object.entries(options)) {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
        }
      }
      return text;
    };

    // 1. Coaching Invitation
    const inviteNotif: Notification = {
      id: "1",
      title: "Coaching Invitation Received",
      message: "Coach Sarah Connor has invited you to start a coaching relationship.",
      type: "COACHING_INVITATION_RECEIVED",
      category: "COACHING",
      priority: "HIGH",
      readAt: null,
      actionUrl: "/dashboard",
      metadata: { trainerName: "Sarah Connor" },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const enInvite = localizeNotification(
      inviteNotif,
      (k, opts) => mockT(k, { ...opts, lng: "en" }),
      "en"
    );
    assert.equal(enInvite.title, "Coaching Invitation Received");
    assert.ok(enInvite.message.includes("Sarah Connor"));

    const arInvite = localizeNotification(
      inviteNotif,
      (k, opts) => mockT(k, { ...opts, lng: "ar" }),
      "ar"
    );
    assert.equal(arInvite.title, "دعوة تدريب جديدة");
    assert.ok(arInvite.message.includes("Sarah Connor"));
    assert.ok(arInvite.message.includes("دعاك المدرب"));

    // 2. Workout Completed
    const workoutNotif: Notification = {
      id: "2",
      title: "Workout Completed",
      message: 'Great job! You completed "Chest Hypertrophy" in 45 minutes.',
      type: "WORKOUT_COMPLETED",
      category: "WORKOUT",
      priority: "NORMAL",
      readAt: null,
      actionUrl: "/sessions/123",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const arWorkout = localizeNotification(
      workoutNotif,
      (k, opts) => mockT(k, { ...opts, lng: "ar" }),
      "ar"
    );
    assert.equal(arWorkout.title, "اكتمل التمرين");
    assert.ok(arWorkout.message.includes("Chest Hypertrophy"));
    assert.ok(arWorkout.message.includes("45"));
    assert.ok(arWorkout.message.includes("عمل رائع"));

    // 3. Achievement Unlocked
    const achNotif: Notification = {
      id: "3",
      title: "Achievement Unlocked: Century Club!",
      message: 'You earned the "Century Club" badge: 100 sessions (+250 pts)',
      type: "ACHIEVEMENT_UNLOCKED",
      category: "ACHIEVEMENT",
      priority: "HIGH",
      readAt: null,
      actionUrl: "/gamification",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const arAch = localizeNotification(
      achNotif,
      (k, opts) => mockT(k, { ...opts, lng: "ar" }),
      "ar"
    );
    assert.ok(arAch.title.includes("Century Club"));
    assert.ok(arAch.message.includes("Century Club"));
    assert.ok(arAch.message.includes("250"));
    assert.ok(arAch.message.includes("نقطة"));
  });

  it("verifies relative time formatting in both locales", () => {
    const mockT = (key: string, options?: Record<string, any>) => {
      const cleanKey = key.replace(/^notifications:/, "");
      const dict = options?.lng === "ar" ? arJson : enJson;
      let text = getLeafValue(dict, cleanKey) || cleanKey;
      if (options) {
        for (const [k, v] of Object.entries(options)) {
          text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
        }
      }
      return text;
    };

    const justNowDate = new Date(Date.now() - 10 * 1000).toISOString();
    assert.equal(
      formatNotificationTimeAgo(
        justNowDate,
        (k, opts) => mockT(k, { ...opts, lng: "en" }),
        "en"
      ),
      "Just now"
    );
    assert.equal(
      formatNotificationTimeAgo(
        justNowDate,
        (k, opts) => mockT(k, { ...opts, lng: "ar" }),
        "ar"
      ),
      "الآن"
    );

    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    assert.equal(
      formatNotificationTimeAgo(
        fiveMinAgo,
        (k, opts) => mockT(k, { ...opts, lng: "en" }),
        "en"
      ),
      "5m ago"
    );
    assert.equal(
      formatNotificationTimeAgo(
        fiveMinAgo,
        (k, opts) => mockT(k, { ...opts, lng: "ar" }),
        "ar"
      ),
      "منذ 5 د"
    );
  });
});
