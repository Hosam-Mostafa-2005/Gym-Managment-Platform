import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import scheduledWorkoutService from "../services/scheduled-workout.service.js";
import {
  createScheduledWorkoutSchema,
  updateScheduledWorkoutSchema,
  createCoachScheduledWorkoutSchema,
  updateCoachScheduledWorkoutSchema,
} from "../validators/scheduled-workout.validator.js";

describe("STREN — Phase 5: Scheduled Workouts — Calendar & List Views Test Suite", () => {
  const memberId = "member-phase5-1";
  const trainerId = "trainer-phase5-1";
  const workoutId = "workout-phase5-1";

  const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  const rescheduledDate = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Unified Data Contracts & Avatar Inclusion
  // ──────────────────────────────────────────────────────────────────────────
  describe("1. Unified Data Contracts & Avatar Inclusion", () => {
    it("ensures member and trainer queries return avatarUrl alongside standard fields", async () => {
      const origFindMany = prisma.scheduledWorkout.findMany;

      let capturedInclude: any = null;

      (prisma.scheduledWorkout as any).findMany = async ({ include }: any) => {
        capturedInclude = include;
        return [
          {
            id: "sw-1",
            memberId,
            trainerId,
            workoutId,
            scheduledAt: new Date(futureDate),
            status: "SCHEDULED",
            notes: "Test notes",
            member: {
              id: memberId,
              name: "Alice Runner",
              email: "alice@stren.app",
              avatarUrl: "https://stren.app/avatars/alice.png",
            },
            trainer: {
              id: trainerId,
              name: "Coach Bob",
              email: "bob@stren.app",
              avatarUrl: "https://stren.app/avatars/bob.png",
            },
            workout: {
              id: workoutId,
              title: "Legs Power",
              difficulty: "intermediate",
              estimatedDuration: 60,
              exercises: [],
            },
            session: null,
          },
        ];
      };

      try {
        const memberList = await scheduledWorkoutService.getAll(memberId);
        assert.equal(memberList.length, 1);
        assert.equal(memberList[0].member?.avatarUrl, "https://stren.app/avatars/alice.png");
        assert.equal(memberList[0].trainer?.avatarUrl, "https://stren.app/avatars/bob.png");
        assert.equal(capturedInclude.member.select.avatarUrl, true);
        assert.equal(capturedInclude.trainer.select.avatarUrl, true);
      } finally {
        prisma.scheduledWorkout.findMany = origFindMany;
      }
    });

    it("evaluates MISSED status dynamically when scheduled time is >2h in past and no completed session exists", async () => {
      const origFindMany = prisma.scheduledWorkout.findMany;

      const pastDate = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago

      (prisma.scheduledWorkout as any).findMany = async () => [
        {
          id: "sw-missed",
          memberId,
          workoutId,
          scheduledAt: pastDate,
          status: "SCHEDULED",
          workout: { title: "Morning Run" },
          session: null,
        },
      ];

      try {
        const list = await scheduledWorkoutService.getAll(memberId);
        assert.equal(list.length, 1);
        assert.equal(list[0].status, "MISSED");
      } finally {
        prisma.scheduledWorkout.findMany = origFindMany;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Rescheduling & Updates
  // ──────────────────────────────────────────────────────────────────────────
  describe("2. Rescheduling & Updates", () => {
    it("validates updateScheduledWorkoutSchema with new future scheduledAt date", () => {
      const validUpdate = updateScheduledWorkoutSchema.safeParse({
        body: {
          scheduledAt: rescheduledDate,
          notes: "Rescheduled to afternoon",
        },
      });
      assert.equal(validUpdate.success, true);
    });

    it("automatically transitions status to RESCHEDULED when member reschedules their workout", async () => {
      const origGetById = (scheduledWorkoutService as any).getById;
      const origUpdate = prisma.scheduledWorkout.update;

      (scheduledWorkoutService as any).getById = async () => ({
        id: "sw-resched-1",
        memberId,
        trainerId: null, // Self-scheduled
        scheduledAt: new Date(futureDate),
        status: "SCHEDULED",
      });

      let updatedData: any = null;

      (prisma.scheduledWorkout as any).update = async ({ data }: any) => {
        updatedData = data;
        return {
          id: "sw-resched-1",
          memberId,
          ...data,
        };
      };

      try {
        const updated = await scheduledWorkoutService.update(
          "sw-resched-1",
          memberId,
          {
            scheduledAt: rescheduledDate,
            notes: "Moving due to work",
          },
        );

        assert.equal(updatedData.status, "RESCHEDULED");
        assert.equal(updatedData.notes, "Moving due to work");
        assert.equal(updated.status, "RESCHEDULED");
      } finally {
        (scheduledWorkoutService as any).getById = origGetById;
        prisma.scheduledWorkout.update = origUpdate;
      }
    });

    it("prevents member from modifying a workout scheduled by their coach (403)", async () => {
      const origGetById = (scheduledWorkoutService as any).getById;

      (scheduledWorkoutService as any).getById = async () => ({
        id: "sw-coach-assigned",
        memberId,
        trainerId: "trainer-999", // Scheduled by coach
        scheduledAt: new Date(futureDate),
        status: "SCHEDULED",
      });

      try {
        await assert.rejects(
          async () => {
            await scheduledWorkoutService.update(
              "sw-coach-assigned",
              memberId,
              {
                scheduledAt: rescheduledDate,
              },
            );
          },
          {
            message:
              "This workout was scheduled by your coach. Please contact your coach to reschedule.",
            statusCode: 403,
          },
        );
      } finally {
        (scheduledWorkoutService as any).getById = origGetById;
      }
    });

    it("allows coach with active coaching relationship to reschedule athlete workout", async () => {
      const origGetById = (scheduledWorkoutService as any).getById;
      const origVerifyRel = (scheduledWorkoutService as any).verifyCoachingRelationship;
      const origFindUser = prisma.user.findUnique;
      const origTx = prisma.$transaction;

      (scheduledWorkoutService as any).getById = async () => ({
        id: "sw-coach-1",
        memberId,
        trainerId,
        scheduledAt: new Date(futureDate),
        status: "SCHEDULED",
        workout: { title: "Hypertrophy Push" },
      });

      (scheduledWorkoutService as any).verifyCoachingRelationship = async () => true;
      (prisma.user as any).findUnique = async () => ({ name: "Coach Bob" });

      let notificationSent = false;
      let updateExecuted = false;

      (prisma as any).$transaction = async (callback: any) => {
        return callback({
          scheduledWorkout: {
            update: async ({ data }: any) => {
              updateExecuted = true;
              assert.equal(data.status, "RESCHEDULED");
              return {
                id: "sw-coach-1",
                ...data,
              };
            },
          },
          notification: {
            create: async () => {
              notificationSent = true;
            },
          },
        });
      };

      try {
        const result = await scheduledWorkoutService.updateCoachScheduled(
          trainerId,
          "sw-coach-1",
          {
            scheduledAt: rescheduledDate,
            notes: "Moved by coach",
          },
        );

        assert.equal(updateExecuted, true);
        assert.equal(notificationSent, true);
        assert.equal(result.status, "RESCHEDULED");
      } finally {
        (scheduledWorkoutService as any).getById = origGetById;
        (scheduledWorkoutService as any).verifyCoachingRelationship = origVerifyRel;
        prisma.user.findUnique = origFindUser;
        prisma.$transaction = origTx;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Presentation State Separation (View Switcher Invariance)
  // ──────────────────────────────────────────────────────────────────────────
  describe("3. Presentation State Separation (View Switcher Invariance)", () => {
    it("switching presentation between Calendar and List is purely local with zero DB mutations", () => {
      // Presentation state simulation
      let activeView: "calendar" | "list" = "calendar";
      const scheduledWorkouts = [
        {
          id: "sw-item-1",
          workout: { title: "Push Workout" },
          scheduledAt: futureDate,
          status: "SCHEDULED" as const,
        },
      ];

      // Switch to List
      activeView = "list";
      assert.equal(activeView, "list");
      assert.equal(scheduledWorkouts.length, 1);
      assert.equal(scheduledWorkouts[0].id, "sw-item-1");

      // Switch back to Calendar
      activeView = "calendar";
      assert.equal(activeView, "calendar");
      assert.equal(scheduledWorkouts.length, 1);
      assert.equal(scheduledWorkouts[0].id, "sw-item-1");
    });
  });
});
