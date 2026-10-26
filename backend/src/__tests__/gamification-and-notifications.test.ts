// src/__tests__/gamification-and-notifications.test.ts
import { describe, it, before, after } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CATEGORY,
} from "../constants/notification.js";
import notificationService from "../services/notification.service.js";
import gamificationService from "../services/gamification.service.js";

describe("STREN — Gamification, Achievements & Centralized Notifications Test Suite", () => {
  let memberId: string;
  let coachId: string;
  const unauthorizedCoachId = "00000000-0000-0000-0000-000000000999";

  before(async () => {
    // 1. Find or create real member
    let member = await prisma.user.findFirst({
      where: { role: Roles.MEMBER, isActive: true },
    });
    if (!member) {
      member = await prisma.user.create({
        data: {
          name: "Alex Athlete",
          email: `alex.gamify.${Date.now()}@stren.app`,
          password: "test-password",
          role: Roles.MEMBER,
          isActive: true,
        },
      });
    }
    memberId = member.id;

    // 2. Find or create real coach
    let coach = await prisma.user.findFirst({
      where: { role: Roles.TRAINER, isActive: true },
    });
    if (!coach) {
      coach = await prisma.user.create({
        data: {
          name: "Coach Jordan",
          email: `jordan.gamify.${Date.now()}@stren.app`,
          password: "test-password",
          role: Roles.TRAINER,
          isActive: true,
        },
      });
    }
    coachId = coach.id;

    // Ensure system achievements are seeded
    await gamificationService.seedSystemAchievements();
  });

  after(async () => {
    // Clean up test achievements & notifications for this test user
    if (memberId) {
      await prisma.userAchievement.deleteMany({ where: { userId: memberId } });
      await prisma.notification.deleteMany({
        where: { userId: memberId, title: { contains: "Test" } },
      });
    }
  });

  // ==========================================================================
  // SECTION 1: SYSTEM ACHIEVEMENTS SEEDING & EVALUATION
  // ==========================================================================
  describe("1. System Achievements Engine & Idempotency", () => {
    it("A. Seeds system achievement definitions idempotently", async () => {
      await gamificationService.seedSystemAchievements();

      const achievements = await prisma.achievement.findMany({
        where: { isActive: true },
      });

      assert.ok(achievements.length >= 10);
      assert.ok(achievements.some((a) => a.code === "FIRST_WORKOUT"));
      assert.ok(achievements.some((a) => a.code === "WORKOUTS_5"));
      assert.ok(achievements.some((a) => a.code === "STREAK_7"));
      assert.ok(achievements.some((a) => a.code === "FIRST_FOOD_LOG"));

      // Run a second time to ensure idempotency
      await gamificationService.seedSystemAchievements();
      const countAfter = await prisma.achievement.count();
      assert.equal(countAfter, achievements.length);
    });

    it("B. Awards FIRST_WORKOUT on first completed session and notifies member", async () => {
      const origSessions = prisma.workoutSession.findMany;
      const origFood = prisma.foodLog.findMany;
      const origMeas = prisma.bodyMeasurement.count;
      const origRelFind = prisma.coachMemberRelationship.findFirst;

      let createdNotification: any = null;
      const origNotifCreate = notificationService.create;
      (notificationService as any).create = async (dto: any) => {
        createdNotification = dto;
        return dto;
      };

      (prisma.workoutSession as any).findMany = async () => [
        {
          id: "session-1",
          startedAt: new Date(),
          endedAt: new Date(),
        },
      ];
      (prisma.foodLog as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).count = async () => 0;
      (prisma.coachMemberRelationship as any).findFirst = async () => null;

      try {
        await prisma.userAchievement.deleteMany({ where: { userId: memberId } });

        const newlyAwarded =
          await gamificationService.evaluateUserAchievements(memberId);

        assert.ok(newlyAwarded.length >= 1);
        const firstWorkoutAch = newlyAwarded.find(
          (a) => a.achievement.code === "FIRST_WORKOUT",
        );
        assert.ok(firstWorkoutAch);
        assert.equal(firstWorkoutAch.userId, memberId);

        // Verify notification
        assert.ok(createdNotification);
        assert.equal(
          createdNotification.type,
          NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED,
        );
        assert.equal(
          createdNotification.category,
          NOTIFICATION_CATEGORY.ACHIEVEMENT,
        );
        assert.ok(createdNotification.title.includes("First Sweat"));

        // Evaluate again -> must NOT award again (idempotent)
        const secondRun =
          await gamificationService.evaluateUserAchievements(memberId);
        assert.equal(secondRun.length, 0);
      } finally {
        prisma.workoutSession.findMany = origSessions;
        prisma.foodLog.findMany = origFood;
        prisma.bodyMeasurement.count = origMeas;
        prisma.coachMemberRelationship.findFirst = origRelFind;
        notificationService.create = origNotifCreate;
      }
    });

    it("C. Calculates streaks and awards STREAK_3 when active across 3 consecutive days", async () => {
      const origSessions = prisma.workoutSession.findMany;
      const origFood = prisma.foodLog.findMany;
      const origMeas = prisma.bodyMeasurement.count;
      const origRelFind = prisma.coachMemberRelationship.findFirst;

      const today = new Date();
      const yesterday = new Date(Date.now() - 86400000);
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);

      (prisma.workoutSession as any).findMany = async () => [
        { id: "s-today", startedAt: today, endedAt: today },
        { id: "s-yesterday", startedAt: yesterday, endedAt: yesterday },
        { id: "s-twoDaysAgo", startedAt: twoDaysAgo, endedAt: twoDaysAgo },
      ];
      (prisma.foodLog as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).count = async () => 0;
      (prisma.coachMemberRelationship as any).findFirst = async () => null;

      try {
        await prisma.userAchievement.deleteMany({ where: { userId: memberId } });

        const newlyAwarded =
          await gamificationService.evaluateUserAchievements(memberId);

        const streakAch = newlyAwarded.find(
          (a) => a.achievement.code === "STREAK_3",
        );
        assert.ok(streakAch, "STREAK_3 must be awarded for 3 consecutive days");

        const overview =
          await gamificationService.getUserGamificationOverview(memberId);
        assert.ok(overview.streak.current >= 3);
        assert.ok(overview.streak.longest >= 3);
      } finally {
        prisma.workoutSession.findMany = origSessions;
        prisma.foodLog.findMany = origFood;
        prisma.bodyMeasurement.count = origMeas;
        prisma.coachMemberRelationship.findFirst = origRelFind;
      }
    });

    it("D. Calculates comeback after 14+ days gap and awards COMEBACK_CHAMPION", async () => {
      const origSessions = prisma.workoutSession.findMany;
      const origFood = prisma.foodLog.findMany;
      const origMeas = prisma.bodyMeasurement.count;
      const origRelFind = prisma.coachMemberRelationship.findFirst;

      const recentSession = new Date(); // Today
      const oldSession = new Date(Date.now() - 16 * 86400000); // 16 days ago

      (prisma.workoutSession as any).findMany = async () => [
        { id: "s-recent", startedAt: recentSession, endedAt: recentSession },
        { id: "s-old", startedAt: oldSession, endedAt: oldSession },
      ];
      (prisma.foodLog as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).count = async () => 0;
      (prisma.coachMemberRelationship as any).findFirst = async () => null;

      try {
        await prisma.userAchievement.deleteMany({ where: { userId: memberId } });

        const newlyAwarded =
          await gamificationService.evaluateUserAchievements(memberId);

        const comebackAch = newlyAwarded.find(
          (a) => a.achievement.code === "COMEBACK_CHAMPION",
        );
        assert.ok(comebackAch, "COMEBACK_CHAMPION must be awarded for >=14 days gap");
      } finally {
        prisma.workoutSession.findMany = origSessions;
        prisma.foodLog.findMany = origFood;
        prisma.bodyMeasurement.count = origMeas;
        prisma.coachMemberRelationship.findFirst = origRelFind;
      }
    });
  });

  // ==========================================================================
  // SECTION 2: NOTIFICATIONS ENGINE & USER PREFERENCES
  // ==========================================================================
  describe("2. Centralized Notifications & Preferences", () => {
    it("A. Automatically assigns correct category and creates notification", async () => {
      const notif = await notificationService.create({
        user: memberId,
        title: "Test Workout Assigned",
        message: "You have a new workout assigned.",
        type: NOTIFICATION_TYPE.ASSIGNMENT_CREATED,
      });

      assert.ok(notif);
      assert.equal(notif.category, NOTIFICATION_CATEGORY.WORKOUT);
      assert.equal(notif.isRead, false);

      // Clean up
      if (notif.id) {
        await prisma.notification.delete({ where: { id: notif.id } });
      }
    });

    it("B. Respects user notification preferences and suppresses disabled categories", async () => {
      // Set preferences to disable ACHIEVEMENT notifications
      await notificationService.updatePreferences(memberId, {
        achievementNotifications: false,
        workoutNotifications: true,
      });

      const suppressed = await notificationService.create({
        user: memberId,
        title: "Should be suppressed",
        message: "Suppressed achievement",
        type: NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED,
      });

      assert.equal(
        suppressed,
        null,
        "Notification must be suppressed when category preference is disabled",
      );

      // Re-enable
      await notificationService.updatePreferences(memberId, {
        achievementNotifications: true,
      });

      const allowed = await notificationService.create({
        user: memberId,
        title: "Allowed achievement",
        message: "Allowed achievement notice",
        type: NOTIFICATION_TYPE.ACHIEVEMENT_UNLOCKED,
      });

      assert.ok(allowed);
      assert.equal(allowed.category, NOTIFICATION_CATEGORY.ACHIEVEMENT);

      if (allowed.id) {
        await prisma.notification.delete({ where: { id: allowed.id } });
      }
    });

    it("C. Filters notifications by category and read/unread status", async () => {
      // Create 2 test notifications: 1 workout unread, 1 nutrition read
      const n1 = await notificationService.create({
        user: memberId,
        title: "Workout A",
        message: "Body workout",
        type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
      });

      const n2 = await notificationService.create({
        user: memberId,
        title: "Nutrition Plan",
        message: "Meal plan notice",
        type: NOTIFICATION_TYPE.NUTRITION_PLAN_ASSIGNED,
      });

      assert.ok(n1?.id && n2?.id);
      await notificationService.markAsRead(n2.id, memberId);

      // 1. Query unread only
      const unreadList = await notificationService.getMyNotifications(memberId, {
        status: "unread",
      });
      assert.ok(unreadList.notifications.some((n) => n.id === n1.id));
      assert.ok(!unreadList.notifications.some((n) => n.id === n2.id));

      // 2. Query nutrition category only
      const nutritionList = await notificationService.getMyNotifications(
        memberId,
        { category: NOTIFICATION_CATEGORY.NUTRITION },
      );
      assert.ok(nutritionList.notifications.some((n) => n.id === n2.id));
      assert.ok(!nutritionList.notifications.some((n) => n.id === n1.id));

      // 3. Mark all as read
      await notificationService.markAllAsRead(memberId);
      const afterReadAll = await notificationService.getMyNotifications(
        memberId,
        { status: "unread" },
      );
      assert.equal(afterReadAll.unreadCount, 0);

      // Clean up
      await prisma.notification.deleteMany({
        where: { id: { in: [n1.id, n2.id] } },
      });
    });
  });

  // ==========================================================================
  // SECTION 3: COACH GAMIFICATION & ENCOURAGEMENT AUTHORIZATION
  // ==========================================================================
  describe("3. Coach Gamification View & Encouragement Authorization", () => {
    it("A. Rejects unauthorized coach from viewing member gamification", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      const origAssignmentFind = prisma.assignment.findFirst;

      (prisma.coachMemberRelationship as any).findFirst = async () => null;
      (prisma.assignment as any).findFirst = async () => null;

      try {
        await assert.rejects(
          async () => {
            await gamificationService.getCoachMemberGamification(
              unauthorizedCoachId,
              memberId,
              false,
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 403);
            return true;
          },
        );
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
        prisma.assignment.findFirst = origAssignmentFind;
      }
    });

    it("B. Authorized coach sends encouragement and triggers notification to athlete", async () => {
      const origRelFind = prisma.coachMemberRelationship.findFirst;
      const origUserFind = prisma.user.findUnique;

      let sentNotification: any = null;
      const origNotif = notificationService.create;
      (notificationService as any).create = async (payload: any) => {
        sentNotification = payload;
        return payload;
      };

      (prisma.coachMemberRelationship as any).findFirst = async () => ({
        id: "rel-active-1",
        trainerId: coachId,
        memberId,
        status: "ACTIVE",
      });

      (prisma.user as any).findUnique = async ({ where }: any) => {
        if (where.id === coachId) return { id: coachId, name: "Coach Jordan" };
        return null;
      };

      try {
        await gamificationService.sendCoachEncouragement(
          coachId,
          memberId,
          "Incredible consistency this week, Alex! Keep crushing your squat sets!",
          false,
        );

        assert.ok(sentNotification);
        assert.equal(sentNotification.user, memberId);
        assert.equal(
          sentNotification.type,
          NOTIFICATION_TYPE.COACH_ENCOURAGEMENT,
        );
        assert.equal(
          sentNotification.category,
          NOTIFICATION_CATEGORY.COACHING,
        );
        assert.ok(sentNotification.title.includes("Coach Jordan"));
        assert.ok(sentNotification.message.includes("Incredible consistency"));
      } finally {
        prisma.coachMemberRelationship.findFirst = origRelFind;
        prisma.user.findUnique = origUserFind;
        notificationService.create = origNotif;
      }
    });
  });
});
