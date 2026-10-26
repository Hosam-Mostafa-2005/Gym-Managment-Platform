// src/__tests__/member-experience-integration.test.ts
import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { RELATIONSHIP_STATUS } from "../constants/coaching-relationship.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import dashboardService from "../services/dashboard.service.js";
import nutritionService from "../services/nutrition.service.js";
import coachMemberRelationshipService from "../services/coach-member-relationship.service.js";
import bodyMeasurementService from "../services/body-measurement.service.js";
import notificationService from "../services/notification.service.js";

describe("STREN — Member Experience Cross-Module Integration & Consistency Test Suite", () => {
  const memberId = "test-member-integration-1";
  const coachId = "test-coach-integration-1";

  // ==========================================================================
  // PART 1: MEMBER DASHBOARD ↔ NUTRITION SYSTEM INTEGRATION
  // ==========================================================================
  describe("1. Member Dashboard Nutrition Snapshot Integration", () => {
    it("A. Member Dashboard returns full nutrition snapshot with targets, logged intake, and macros", async () => {
      const origNutritionGetMemberOverview = nutritionService.getMemberOverview;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origWorkoutExerciseLogGroupBy = prisma.workoutExerciseLog.groupBy;
      const origWorkoutSetLogFindFirst = prisma.workoutSetLog.findFirst;
      const origWorkoutSessionFindFirst = prisma.workoutSession.findFirst;
      const origScheduledWorkoutFindMany = prisma.scheduledWorkout?.findMany;
      const origBodyMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origCoachRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origNotificationCount = prisma.notification.count;

      try {
        (prisma.assignment as any).findFirst = async () => null;
        (prisma.assignment as any).findMany = async () => [];
        (prisma.workout as any).findFirst = async () => null;
        (prisma.workoutSession as any).findMany = async () => [];
        (prisma.workoutSession as any).findFirst = async () => null;
        (prisma.workoutExerciseLog as any).groupBy = async () => [];
        (prisma.workoutSetLog as any).findFirst = async () => null;
        if (prisma.scheduledWorkout) {
          (prisma.scheduledWorkout as any).findMany = async () => [];
        }
        (prisma.bodyMeasurement as any).findMany = async () => [];
        (prisma.coachMemberRelationship as any).findFirst = async () => null;
        (prisma.notification as any).count = async () => 0;

        (nutritionService as any).getMemberOverview = async (mId: string) => {
          assert.equal(mId, memberId);
          return {
            date: "2026-10-25",
            hasActivePlan: true,
            onboardingCompleted: true,
            plan: {
              id: "plan-1",
              name: "Hypertrophy Cutting Fuel",
              source: "MEMBER_CALCULATED",
              coach: null,
              targetCalories: 2400,
              targetProteinG: 180,
              targetCarbsG: 250,
              targetFatG: 70,
            },
            intake: {
              targetCalories: 2400,
              targetProteinG: 180,
              targetCarbsG: 250,
              targetFatG: 70,
              loggedCalories: 1850,
              loggedProteinG: 145,
              loggedCarbsG: 190,
              loggedFatG: 55,
              remainingCalories: 550,
              calorieProgressPct: 77,
              proteinProgressPct: 81,
              carbsProgressPct: 76,
              fatProgressPct: 79,
            },
            todayLogs: [
              { id: "log-1", foodNameSnapshot: "Oats & Whey" },
              { id: "log-2", foodNameSnapshot: "Chicken Rice Bowl" },
            ],
          };
        };

        const result = await dashboardService.getMemberDashboard(memberId);

        assert.ok(result.overview.nutritionSnapshot, "nutritionSnapshot must exist on overview");
        assert.ok(result.nutritionSnapshot, "nutritionSnapshot must exist on root object");

        const snapshot = result.overview.nutritionSnapshot!;
        assert.equal(snapshot.hasActivePlan, true);
        assert.equal(snapshot.onboardingCompleted, true);
        assert.equal(snapshot.planName, "Hypertrophy Cutting Fuel");
        assert.equal(snapshot.targetCalories, 2400);
        assert.equal(snapshot.loggedCalories, 1850);
        assert.equal(snapshot.remainingCalories, 550);
        assert.equal(snapshot.calorieProgressPct, 77);
        assert.equal(snapshot.targetProteinG, 180);
        assert.equal(snapshot.loggedProteinG, 145);
        assert.equal(snapshot.proteinProgressPct, 81);
        assert.equal(snapshot.targetCarbsG, 250);
        assert.equal(snapshot.loggedCarbsG, 190);
        assert.equal(snapshot.carbsProgressPct, 76);
        assert.equal(snapshot.targetFatG, 70);
        assert.equal(snapshot.loggedFatG, 55);
        assert.equal(snapshot.fatProgressPct, 79);
        assert.equal(snapshot.logsCount, 2);
      } finally {
        nutritionService.getMemberOverview = origNutritionGetMemberOverview;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.workoutExerciseLog.groupBy = origWorkoutExerciseLogGroupBy;
        prisma.workoutSetLog.findFirst = origWorkoutSetLogFindFirst;
        prisma.workoutSession.findFirst = origWorkoutSessionFindFirst;
        if (prisma.scheduledWorkout && origScheduledWorkoutFindMany) {
          prisma.scheduledWorkout.findMany = origScheduledWorkoutFindMany;
        }
        prisma.bodyMeasurement.findMany = origBodyMeasurementFindMany;
        prisma.coachMemberRelationship.findFirst = origCoachRelFindFirst;
        prisma.notification.count = origNotificationCount;
      }
    });

    it("B. Member Dashboard returns null nutritionSnapshot gracefully if nutrition service fails or no data", async () => {
      const origNutritionGetMemberOverview = nutritionService.getMemberOverview;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origWorkoutSessionFindMany = prisma.workoutSession.findMany;
      const origWorkoutExerciseLogGroupBy = prisma.workoutExerciseLog.groupBy;
      const origWorkoutSetLogFindFirst = prisma.workoutSetLog.findFirst;
      const origWorkoutSessionFindFirst = prisma.workoutSession.findFirst;
      const origScheduledWorkoutFindMany = prisma.scheduledWorkout?.findMany;
      const origBodyMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origCoachRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origNotificationCount = prisma.notification.count;

      try {
        (prisma.assignment as any).findFirst = async () => null;
        (prisma.assignment as any).findMany = async () => [];
        (prisma.workout as any).findFirst = async () => null;
        (prisma.workoutSession as any).findMany = async () => [];
        (prisma.workoutSession as any).findFirst = async () => null;
        (prisma.workoutExerciseLog as any).groupBy = async () => [];
        (prisma.workoutSetLog as any).findFirst = async () => null;
        if (prisma.scheduledWorkout) {
          (prisma.scheduledWorkout as any).findMany = async () => [];
        }
        (prisma.bodyMeasurement as any).findMany = async () => [];
        (prisma.coachMemberRelationship as any).findFirst = async () => null;
        (prisma.notification as any).count = async () => 0;

        (nutritionService as any).getMemberOverview = async () => {
          throw new Error("Nutrition DB timeout");
        };

        const result = await dashboardService.getMemberDashboard(memberId);

        assert.equal(result.overview.nutritionSnapshot, null);
        assert.equal(result.nutritionSnapshot, null);
      } finally {
        nutritionService.getMemberOverview = origNutritionGetMemberOverview;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.workoutSession.findMany = origWorkoutSessionFindMany;
        prisma.workoutExerciseLog.groupBy = origWorkoutExerciseLogGroupBy;
        prisma.workoutSetLog.findFirst = origWorkoutSetLogFindFirst;
        prisma.workoutSession.findFirst = origWorkoutSessionFindFirst;
        if (prisma.scheduledWorkout && origScheduledWorkoutFindMany) {
          prisma.scheduledWorkout.findMany = origScheduledWorkoutFindMany;
        }
        prisma.bodyMeasurement.findMany = origBodyMeasurementFindMany;
        prisma.coachMemberRelationship.findFirst = origCoachRelFindFirst;
        prisma.notification.count = origNotificationCount;
      }
    });
  });

  // ==========================================================================
  // PART 2: NOTIFICATION ROUTING CONVENTIONS & PERMISSION SAFEGUARDS
  // ==========================================================================
  describe("2. Notification Routing URL Verifications", () => {
    it("A. Coaching invitation received notification for a member directs to /dashboard", async () => {
      const origUserFindFirst = prisma.user.findFirst;
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origTransaction = prisma.$transaction;
      const origNotificationCreate = notificationService.create;

      let capturedNotificationPayload: any = null;

      try {
        (prisma.user as any).findFirst = async ({ where }: any) => {
          if (where?.id === coachId) {
            return { id: coachId, name: "Coach Mike", role: Roles.TRAINER, isActive: true };
          }
          if (where?.email === "athlete@stren.app") {
            return { id: memberId, name: "Athlete John", role: Roles.MEMBER, isActive: true };
          }
          return null;
        };

        (prisma.coachMemberRelationship as any).findFirst = async () => null;

        (prisma as any).$transaction = async (fn: any) => {
          const txMock = {
            coachMemberRelationship: {
              create: async (args: any) => ({
                id: "rel-test-1",
                trainerId: coachId,
                memberId,
                status: RELATIONSHIP_STATUS.PENDING,
                isActive: true,
                trainer: { id: coachId, name: "Coach Mike", email: "coach@stren.app" },
                member: { id: memberId, name: "Athlete John", email: "athlete@stren.app" },
                ...args.data,
              }),
            },
          };
          return fn(txMock);
        };

        (notificationService as any).create = async (payload: any) => {
          capturedNotificationPayload = payload;
          return { id: "notif-1", ...payload };
        };

        await coachMemberRelationshipService.inviteMember(coachId, {
          email: "athlete@stren.app",
          notes: "Welcome to coaching!",
        });

        assert.ok(capturedNotificationPayload, "Notification must be sent to the invited member");
        assert.equal(capturedNotificationPayload.user, memberId);
        assert.equal(capturedNotificationPayload.type, NOTIFICATION_TYPE.COACHING_INVITATION_RECEIVED);
        assert.equal(
          capturedNotificationPayload.actionUrl,
          "/dashboard",
          "Notification actionUrl must be /dashboard (members lack /members/* permissions)",
        );
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        prisma.$transaction = origTransaction;
        notificationService.create = origNotificationCreate;
      }
    });

    it("B. Body measurement created by trainer routes to /measurements for member", async () => {
      const origUserFindFirst = prisma.user.findFirst;
      const origMeasurementCreate = prisma.bodyMeasurement.create;
      const origRelFindFirst = prisma.coachMemberRelationship.findFirst;
      const origNotificationCreate = notificationService.create;

      let capturedNotificationPayload: any = null;

      try {
        (prisma.user as any).findFirst = async ({ where }: any) => {
          if (where?.id === memberId) {
            return { id: memberId, name: "Athlete John", role: Roles.MEMBER, isActive: true };
          }
          return null;
        };

        (prisma.coachMemberRelationship as any).findFirst = async () => ({
          id: "rel-1",
          trainerId: coachId,
          memberId,
          status: RELATIONSHIP_STATUS.ACTIVE,
          isActive: true,
        });

        (prisma.bodyMeasurement as any).create = async (args: any) => ({
          id: "measurement-123",
          memberId,
          trainerId: coachId,
          weight: 78.5,
          measuredAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
          isActive: true,
          trainer: { id: coachId, name: "Coach Mike" },
        });

        (notificationService as any).create = async (payload: any) => {
          capturedNotificationPayload = payload;
          return { id: "notif-2", ...payload };
        };

        await bodyMeasurementService.create(
          {
            member: memberId,
            trainer: coachId,
            weight: 78.5,
            height: 180,
          },
          coachId,
          Roles.TRAINER,
        );

        assert.ok(capturedNotificationPayload, "Notification must be sent for trainer-created measurement");
        assert.equal(capturedNotificationPayload.user, memberId);
        assert.equal(capturedNotificationPayload.type, NOTIFICATION_TYPE.BODY_MEASUREMENT_CREATED);
        assert.equal(
          capturedNotificationPayload.actionUrl,
          "/measurements",
          "actionUrl must route to /measurements",
        );
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.bodyMeasurement.create = origMeasurementCreate;
        prisma.coachMemberRelationship.findFirst = origRelFindFirst;
        notificationService.create = origNotificationCreate;
      }
    });
  });
});
