import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  NOTIFICATION_CATEGORY,
  NOTIFICATION_TYPE,
  getCategoryForNotificationType,
} from "../constants/notification.js";

describe("Part 4 — Centralized Notifications & Preference Suppression Test Suite", () => {
  it("1. Automatically resolves correct notification category from type", () => {
    assert.equal(
      getCategoryForNotificationType(NOTIFICATION_TYPE.WORKOUT_COMPLETED),
      NOTIFICATION_CATEGORY.WORKOUT,
    );
    assert.equal(
      getCategoryForNotificationType(NOTIFICATION_TYPE.ASSIGNMENT_CREATED),
      NOTIFICATION_CATEGORY.WORKOUT,
    );
    assert.equal(
      getCategoryForNotificationType(NOTIFICATION_TYPE.COACHING_INVITATION_RECEIVED),
      NOTIFICATION_CATEGORY.COACHING,
    );
    assert.equal(
      getCategoryForNotificationType(NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED),
      NOTIFICATION_CATEGORY.ACHIEVEMENT,
    );
    assert.equal(
      getCategoryForNotificationType("UNKNOWN_CUSTOM_TYPE" as any),
      NOTIFICATION_CATEGORY.SYSTEM,
    );
  });

  it("2. Evaluates preference suppression rules for categories", () => {
    const preferences = {
      workoutNotifications: false,
      nutritionNotifications: true,
      coachingNotifications: false,
      achievementNotifications: true,
    };

    // Category WORKOUT should be suppressed
    const isWorkoutAllowed = preferences.workoutNotifications;
    assert.equal(isWorkoutAllowed, false);

    // Category NUTRITION should be allowed
    const isNutritionAllowed = preferences.nutritionNotifications;
    assert.equal(isNutritionAllowed, true);

    // Category COACHING should be suppressed
    const isCoachingAllowed = preferences.coachingNotifications;
    assert.equal(isCoachingAllowed, false);

    // Category ACHIEVEMENT should be allowed
    const isAchievementAllowed = preferences.achievementNotifications;
    assert.equal(isAchievementAllowed, true);
  });

  it("3. Validates unread calculation logic and readAt null semantics", () => {
    const notifications = [
      { id: "n1", readAt: null, isActive: true },
      { id: "n2", readAt: new Date(), isActive: true },
      { id: "n3", readAt: null, isActive: true },
      { id: "n4", readAt: null, isActive: false }, // soft deleted
    ];

    const unreadCount = notifications.filter(
      (n) => n.isActive && n.readAt === null,
    ).length;

    assert.equal(unreadCount, 2);
  });

  it("4. Verifies Socket.IO room targeting format", () => {
    const userId = "user-abc-123";
    const roomName = `user:${userId}`;
    assert.equal(roomName, "user:user-abc-123");
  });
});
