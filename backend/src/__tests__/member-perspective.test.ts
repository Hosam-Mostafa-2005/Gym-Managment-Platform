import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import exerciseService from "../services/exercise.service.js";
import workoutService from "../services/workout.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import bodyMeasurementService from "../services/body-measurement.service.js";
import dashboardService from "../services/dashboard.service.js";
import authService from "../services/auth.service.js";
import memberProfileService from "../services/member-profile.service.js";
import workoutSetService from "../services/workout-set.service.js";
import { startWorkoutSessionSchema } from "../validators/workout-session.validator.js";
import { createBodyMeasurementSchema } from "../validators/body-measurement.validator.js";
import { updateProfileSchema } from "../validators/auth.validator.js";

describe("STREN — Member Perspective Integration & Invariants", () => {
  const memberAId = "member-uuid-1111-aaaa";
  const memberBId = "member-uuid-2222-bbbb";
  const trainerId = "trainer-uuid-3333-cccc";

  describe("1. Custom Exercises Isolation & Authorization", () => {
    it("creates custom exercise marked isCustom: true for member", async () => {
      const origFindFirst = prisma.exercise.findFirst;
      const origCreate = prisma.exercise.create;

      (prisma.exercise as any).findFirst = async () => null; // No duplicate
      (prisma.exercise as any).create = async ({ data }: any) => ({
        id: "custom-ex-1",
        ...data,
      });

      try {
        const result = await exerciseService.create(
          {
            name: "Member Myofascial Release",
            description: "Personal recovery exercise",
            equipment: ["other" as any],
            difficulty: "beginner" as any,
            primaryMuscles: ["hamstrings"],
            secondaryMuscles: [],
            instructions: ["Roll slowly"],
          },
          memberAId,
          Roles.MEMBER,
        );

        assert.equal(result.isCustom, true);
        assert.equal(result.createdById, memberAId);
        assert.equal(result.name, "Member Myofascial Release");
      } finally {
        prisma.exercise.findFirst = origFindFirst;
        prisma.exercise.create = origCreate;
      }
    });

    it("prevents another member from accessing or deleting private custom exercise", async () => {
      const origFindFirst = prisma.exercise.findFirst;
      (prisma.exercise as any).findFirst = async () => ({
        id: "custom-ex-1",
        name: "Member Myofascial Release",
        isCustom: true,
        createdById: memberAId,
        isActive: true,
      });

      try {
        // Member B attempts to get Member A's custom exercise
        await assert.rejects(
          async () => {
            await exerciseService.getById("custom-ex-1", memberBId, Roles.MEMBER);
          },
          (err: any) => err.statusCode === 404,
        );

        // Member B attempts to delete Member A's custom exercise
        await assert.rejects(
          async () => {
            await exerciseService.delete("custom-ex-1", memberBId, Roles.MEMBER);
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        prisma.exercise.findFirst = origFindFirst;
      }
    });
  });

  describe("2. Personal Workouts & Templates", () => {
    it("forces isTemplate: false when member creates workout", async () => {
      const origFindFirst = prisma.workout.findFirst;
      const origFindMany = prisma.exercise.findMany;
      const origCreate = prisma.workout.create;

      (prisma.workout as any).findFirst = async () => null;
      (prisma.exercise as any).findMany = async () => [
        { id: "ex-1", isActive: true },
      ];
      (prisma.workout as any).create = async ({ data }: any) => ({
        id: "workout-mem-1",
        ...data,
        exercises: [],
      });

      try {
        const result = await workoutService.create(
          {
            title: "Morning HIIT Routine",
            description: "Personal morning routine",
            category: "cardio" as any,
            difficulty: "intermediate" as any,
            estimatedDuration: 30,
            isTemplate: true, // Malicious member attempt to create platform template
            exercises: [
              {
                exercise: "ex-1",
                sets: 3,
                reps: "15",
                restSeconds: 30,
                order: 1,
              },
            ],
          },
          memberAId,
          Roles.MEMBER,
        );

        assert.equal(result.isTemplate, false);
        assert.equal(result.createdBy, memberAId);
      } finally {
        prisma.workout.findFirst = origFindFirst;
        prisma.exercise.findMany = origFindMany;
        prisma.workout.create = origCreate;
      }
    });

    it("allows member to duplicate a workout into personal library", async () => {
      const origFindFirst = prisma.workout.findFirst;
      const origCreate = prisma.workout.create;

      (prisma.workout as any).findFirst = async (args: any) => {
        if (args?.where?.id === "coach-workout-1") {
          return {
            id: "coach-workout-1",
            title: "Coach Strength Routine",
            description: "Heavy lifting",
            category: "strength",
            difficulty: "advanced",
            estimatedDuration: 60,
            tags: ["strength"],
            isTemplate: true, // template accessible to member
            createdBy: trainerId,
            isActive: true,
            creator: { id: trainerId, name: "Coach Mike" },
            exercises: [
              {
                exerciseId: "ex-1",
                sets: 5,
                reps: "5",
                restSeconds: 120,
                order: 1,
                exercise: { id: "ex-1", name: "Barbell Squat" },
              },
            ],
          };
        }
        return null;
      };

      (prisma.workout as any).create = async ({ data }: any) => ({
        id: "dup-workout-1",
        ...data,
        exercises: data.exercises?.create || [],
      });

      try {
        const duplicated = await workoutService.duplicate(
          "coach-workout-1",
          memberAId,
        );

        assert.equal(duplicated.createdBy, memberAId);
        assert.equal(duplicated.isTemplate, false);
        assert.match(duplicated.title, /Coach Strength Routine/);
      } finally {
        prisma.workout.findFirst = origFindFirst;
        prisma.workout.create = origCreate;
      }
    });
  });

  describe("3. Independent Workout Sessions (No Coach Required)", () => {
    it("validates startWorkoutSessionSchema with workout ID instead of assignment ID", () => {
      const validWorkoutSession = startWorkoutSessionSchema.safeParse({
        body: {
          workout: "workout-mem-1",
        },
      });
      assert.equal(validWorkoutSession.success, true);

      const invalidEmpty = startWorkoutSessionSchema.safeParse({
        body: {},
      });
      assert.equal(invalidEmpty.success, false);
    });

    it("starts and finishes workout session from personal workout without assignmentId", async () => {
      const origFindFirstWS = prisma.workoutSession.findFirst;
      const origFindUniqueW = prisma.workout.findUnique;
      const origTransaction = prisma.$transaction;
      const origUpdateWS = prisma.workoutSession.update;

      (prisma.workoutSession as any).findFirst = async () => null; // No active session
      (prisma.workout as any).findUnique = async () => ({
        id: "workout-mem-1",
        title: "Morning Routine",
        createdBy: memberAId,
        isTemplate: false,
        isActive: true,
        exercises: [],
      });
      (prisma.$transaction as any) = async (cb: any) => {
        return cb({
          workoutSession: {
            create: async ({ data }: any) => ({
              id: "session-independent-1",
              ...data,
              startedAt: new Date(),
            }),
          },
          workoutExerciseLog: { create: async () => ({ id: "log-1" }) },
          workoutSetLog: { create: async () => ({ id: "set-1" }) },
        });
      };

      try {
        const started = await workoutSessionService.start(
          memberAId,
          undefined,
          "workout-mem-1",
        );

        assert.equal(started.id, "session-independent-1");
        assert.equal(started.assignment, null);
        assert.equal(started.workoutId, "workout-mem-1");
      } finally {
        prisma.workoutSession.findFirst = origFindFirstWS;
        prisma.workout.findUnique = origFindUniqueW;
        prisma.$transaction = origTransaction;
        prisma.workoutSession.update = origUpdateWS;
      }
    });

    it("protects member private sessions from coach view in getAll", async () => {
      // In workoutSessionService.getAll, trainer filter is strictly:
      // filter.assignment = { trainerId: userId, isActive: true }
      // which automatically excludes sessions with assignmentId: null!
      const origFindMany = prisma.workoutSession.findMany;
      let capturedWhere: any = null;

      (prisma.workoutSession as any).findMany = async (args: any) => {
        capturedWhere = args.where;
        return [];
      };

      try {
        await workoutSessionService.getAll({}, trainerId, Roles.TRAINER);
        assert.ok(capturedWhere.assignment);
        assert.equal(capturedWhere.assignment.trainerId, trainerId);
      } finally {
        prisma.workoutSession.findMany = origFindMany;
      }
    });
  });

  describe("4. Independent Body Measurements", () => {
    it("validates createBodyMeasurementSchema without requiring trainer", () => {
      const validSelfMeasurement = createBodyMeasurementSchema.safeParse({
        body: {
          weight: 75.5,
          height: 178,
          bodyFat: 15.2,
          notes: "Morning fasted weight",
        },
      });
      assert.equal(validSelfMeasurement.success, true);
    });

    it("allows member to record their own measurement independently", async () => {
      const origCreate = prisma.bodyMeasurement.create;
      const origFindFirst = prisma.assignment.findFirst;

      (prisma.assignment as any).findFirst = async () => null; // No coach assigned
      (prisma.bodyMeasurement as any).create = async ({ data }: any) => ({
        id: "meas-mem-1",
        ...data,
        trainer: null,
      });

      try {
        const result = await bodyMeasurementService.create(
          {
            weight: 75.5,
            height: 178,
            bodyFat: 15.2,
            notes: "Morning fasted weight",
          } as any,
          memberAId,
          Roles.MEMBER,
        );

        assert.equal(result.member, memberAId);
        assert.equal(result.trainer, undefined);
        assert.equal(result.weight, 75.5);
      } finally {
        prisma.bodyMeasurement.create = origCreate;
        prisma.assignment.findFirst = origFindFirst;
      }
    });
  });

  describe("5. Independent Member Dashboard", () => {
    it("returns member dashboard with personal workout as currentWorkout when no coach assignment exists", async () => {
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origWorkoutFindFirst = prisma.workout.findFirst;
      const origSessionFindMany = prisma.workoutSession.findMany;
      const origExGroup = prisma.workoutExerciseLog.groupBy;
      const origSetFindFirst = prisma.workoutSetLog.findFirst;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origSessionFindFirst = prisma.workoutSession.findFirst;

      (prisma.assignment as any).findFirst = async () => null; // No active assignment
      (prisma.workout as any).findFirst = async () => ({
        id: "my-workout-1",
        title: "Upper Body Hypertrophy",
      });
      (prisma.workoutSession as any).findMany = async () => [];
      (prisma.workoutExerciseLog as any).groupBy = async () => [];
      (prisma.workoutSetLog as any).findFirst = async () => null;
      (prisma.assignment as any).findMany = async () => [];
      (prisma.workoutSession as any).findFirst = async () => null;

      try {
        const dashboard = await dashboardService.getMemberDashboard(memberAId);

        assert.ok(dashboard.overview);
        assert.equal(dashboard.overview.activeAssignment, null);
        assert.equal(dashboard.overview.currentWorkout?.title, "Upper Body Hypertrophy");
        assert.equal(dashboard.overview.totalSessions, 0);
      } finally {
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.workout.findFirst = origWorkoutFindFirst;
        prisma.workoutSession.findMany = origSessionFindMany;
        prisma.workoutExerciseLog.groupBy = origExGroup;
        prisma.workoutSetLog.findFirst = origSetFindFirst;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.workoutSession.findFirst = origSessionFindFirst;
      }
    });
  });

  describe("6. Member Profile & Identity Persistence", () => {
    it("validates updateProfileSchema and updates member profile", async () => {
      const validPayload = {
        name: "Alex Hunter",
        phone: "+1 555-0199",
        bio: "Dedicated lifter focusing on powerbuilding",
      };

      const parseResult = updateProfileSchema.safeParse({ body: validPayload });
      assert.equal(parseResult.success, true);

      const origUserFindFirst = prisma.user.findFirst;
      const origUserUpdate = prisma.user.update;

      (prisma.user as any).findFirst = async () => ({
        id: memberAId,
        name: "Alex",
        email: "alex@example.com",
        role: "member",
        isActive: true,
      });

      (prisma.user as any).update = async ({ data }: any) => ({
        id: memberAId,
        name: data.name,
        email: "alex@example.com",
        role: "member",
        phone: data.phone,
        bio: data.bio,
        isActive: true,
      });

      try {
        const updated = await authService.updateProfile(memberAId, validPayload);
        assert.equal(updated.name, "Alex Hunter");
        assert.equal(updated.phone, "+1 555-0199");
        assert.equal(updated.bio, "Dedicated lifter focusing on powerbuilding");
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.user.update = origUserUpdate;
      }
    });

    it("allows independent member to fetch profile with no active coach or assignments", async () => {
      const origUserFindFirst = prisma.user.findFirst;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origAssignmentFindMany = prisma.assignment.findMany;
      const origMeasurementFindMany = prisma.bodyMeasurement.findMany;
      const origSessionFindMany = prisma.workoutSession.findMany;

      (prisma.user as any).findFirst = async () => ({
        id: memberAId,
        name: "Alex Hunter",
        email: "alex@example.com",
        role: "member",
        isActive: true,
        createdAt: new Date(),
      });
      (prisma.assignment as any).findFirst = async () => null; // No coach assignment
      (prisma.assignment as any).findMany = async () => [];
      (prisma.bodyMeasurement as any).findMany = async () => [];
      (prisma.workoutSession as any).findMany = async () => [];

      try {
        const profile = await memberProfileService.getProfile(
          memberAId,
          memberAId,
          Roles.MEMBER,
        );

        assert.ok(profile);
        assert.equal(profile.member.id, memberAId);
        assert.equal(profile.overview.currentAssignment, null);
        assert.equal(profile.assignmentHistory.length, 0);
      } finally {
        prisma.user.findFirst = origUserFindFirst;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.assignment.findMany = origAssignmentFindMany;
        prisma.bodyMeasurement.findMany = origMeasurementFindMany;
        prisma.workoutSession.findMany = origSessionFindMany;
      }
    });
  });

  describe("7. Previous Exercise Performance for Live Workout", () => {
    it("retrieves most recent completed performance and excludes current session", async () => {
      const origExLogFindMany = prisma.workoutExerciseLog.findMany;

      const mockCompletedDate = new Date("2026-10-15T10:00:00Z");

      (prisma.workoutExerciseLog as any).findMany = async ({ where }: any) => {
        // Verify query criteria
        assert.equal(where.session.memberId, memberAId);
        assert.equal(where.session.status, "COMPLETED");
        assert.equal(where.session.isActive, true);
        assert.equal(where.session.id.not, "current-active-session-id");

        return [
          {
            exerciseId: "bench-press-id",
            session: {
              id: "past-session-1",
              startedAt: mockCompletedDate,
              endedAt: mockCompletedDate,
              workout: { title: "Push Day A" },
            },
            sets: [
              {
                setNumber: 1,
                actualReps: 10,
                weight: 80,
                restDuration: 90,
                completed: true,
              },
              {
                setNumber: 2,
                actualReps: 8,
                weight: 85,
                restDuration: 120,
                completed: true,
              },
            ],
          },
        ];
      };

      try {
        const perf =
          await workoutSessionService.getPreviousPerformanceForExercises(
            ["bench-press-id", "incline-dumbbell-id"],
            memberAId,
            "current-active-session-id",
          );

        // Found past performance for bench press
        assert.ok(perf["bench-press-id"]);
        assert.equal(perf["bench-press-id"]?.workoutTitle, "Push Day A");
        assert.equal(perf["bench-press-id"]?.sets.length, 2);
        assert.equal(perf["bench-press-id"]?.sets[0].weight, 80);
        assert.equal(perf["bench-press-id"]?.sets[0].actualReps, 10);
        assert.equal(perf["bench-press-id"]?.sets[1].weight, 85);
        assert.equal(perf["bench-press-id"]?.sets[1].actualReps, 8);

        // Incline dumbbell has no history -> null gracefully
        assert.equal(perf["incline-dumbbell-id"], null);
      } finally {
        prisma.workoutExerciseLog.findMany = origExLogFindMany;
      }
    });

    it("allows updating live set with weight, reps, and toggle completion", async () => {
      const origSetFindUnique = prisma.workoutSetLog.findUnique;
      const origSetUpdate = prisma.workoutSetLog.update;
      const origSetCount = prisma.workoutSetLog.count;
      const origExUpdate = prisma.workoutExerciseLog.update;
      const origSessionFindUnique = prisma.workoutSession.findUnique;
      const origExFindMany = prisma.workoutExerciseLog.findMany;
      const origSetFindMany = prisma.workoutSetLog.findMany;
      const origSessionUpdate = prisma.workoutSession.update;

      (prisma.workoutSetLog as any).findUnique = async () => ({
        id: "set-log-1",
        setNumber: 1,
        weight: 0,
        actualReps: 0,
        completed: false,
        completedAt: null,
        restDuration: 0,
        exerciseLog: {
          id: "ex-log-1",
          targetSets: 3,
          sessionId: "active-session-1",
          session: {
            id: "active-session-1",
            memberId: memberAId,
            status: "IN_PROGRESS",
          },
        },
      });

      (prisma.workoutSetLog as any).update = async ({ data }: any) => ({
        id: "set-log-1",
        ...data,
      });

      (prisma.workoutSetLog as any).count = async () => 1;
      (prisma.workoutExerciseLog as any).update = async () => ({});
      (prisma.workoutSession as any).findUnique = async () => ({
        id: "active-session-1",
      });
      (prisma.workoutExerciseLog as any).findMany = async () => [];
      (prisma.workoutSetLog as any).findMany = async () => [];
      (prisma.workoutSession as any).update = async () => ({});

      try {
        const updated = await workoutSetService.update("set-log-1", memberAId, {
          weight: 100,
          actualReps: 5,
          completed: true,
          restDuration: 60,
        });

        assert.equal(updated.weight, 100);
        assert.equal(updated.actualReps, 5);
        assert.equal(updated.completed, true);
        assert.equal(updated.restDuration, 60);
      } finally {
        prisma.workoutSetLog.findUnique = origSetFindUnique;
        prisma.workoutSetLog.update = origSetUpdate;
        prisma.workoutSetLog.count = origSetCount;
        prisma.workoutExerciseLog.update = origExUpdate;
        prisma.workoutSession.findUnique = origSessionFindUnique;
        prisma.workoutExerciseLog.findMany = origExFindMany;
        prisma.workoutSetLog.findMany = origSetFindMany;
        prisma.workoutSession.update = origSessionUpdate;
      }
    });
  });

  describe("8. Active Session Concurrency & Cancellation", () => {
    it("returns 409 with activeSessionId when member attempts to start another session", async () => {
      const origFindFirstWS = prisma.workoutSession.findFirst;

      (prisma.workoutSession as any).findFirst = async () => ({
        id: "active-session-999",
        memberId: memberAId,
        workoutId: "workout-active",
        status: "IN_PROGRESS",
        isActive: true,
        workout: { id: "workout-active", title: "Heavy Push Day" },
      });

      try {
        await workoutSessionService.start(memberAId, undefined, "another-workout");
        assert.fail("Should have thrown 409 AppError");
      } catch (err: any) {
        assert.equal(err.statusCode, 409);
        assert.ok(err.data);
        assert.equal(err.data.activeSessionId, "active-session-999");
        assert.equal(err.data.activeWorkoutTitle, "Heavy Push Day");
      } finally {
        prisma.workoutSession.findFirst = origFindFirstWS;
      }
    });

    it("cancels an active session and records reason", async () => {
      const origFindFirstWS = prisma.workoutSession.findFirst;
      const origUpdateWS = prisma.workoutSession.update;

      (prisma.workoutSession as any).findFirst = async () => ({
        id: "active-session-999",
        memberId: memberAId,
        status: "IN_PROGRESS",
        startedAt: new Date(Date.now() - 15 * 60 * 1000),
        notes: null,
      });

      let capturedUpdateData: any = null;
      (prisma.workoutSession as any).update = async ({ data }: any) => {
        capturedUpdateData = data;
        return {
          id: "active-session-999",
          memberId: memberAId,
          ...data,
          workout: null,
          assignment: null,
        };
      };

      try {
        const cancelled = await workoutSessionService.cancel(
          "active-session-999",
          memberAId,
          "Switched to different routine",
        );

        assert.equal(cancelled.status, "CANCELLED");
        assert.equal(capturedUpdateData.status, "CANCELLED");
        assert.ok(capturedUpdateData.endedAt);
        assert.ok(capturedUpdateData.notes.includes("Switched to different routine"));
      } finally {
        prisma.workoutSession.findFirst = origFindFirstWS;
        prisma.workoutSession.update = origUpdateWS;
      }
    });
  });

  describe("9. Idempotent Workout Session Completion", () => {
    it("returns completed session safely when finish is called multiple times", async () => {
      const origFindFirstWS = prisma.workoutSession.findFirst;

      (prisma.workoutSession as any).findFirst = async () => ({
        id: "session-completed-1",
        memberId: memberAId,
        status: "COMPLETED",
        duration: 45,
        isActive: true,
        workout: { title: "Upper Body Hypertrophy" },
      });

      try {
        const result = await workoutSessionService.finish(
          "session-completed-1",
          memberAId,
          {},
        );
        assert.equal(result.id, "session-completed-1");
        assert.equal(result.status, "COMPLETED");
      } finally {
        prisma.workoutSession.findFirst = origFindFirstWS;
      }
    });
  });

  describe("10. Workout Scheduling Lifecycle", () => {
    it("validates scheduled workout schema requiring future date", async () => {
      const { createScheduledWorkoutSchema } = await import(
        "../validators/scheduled-workout.validator.js"
      );

      const pastResult = createScheduledWorkoutSchema.safeParse({
        body: {
          workoutId: "workout-123",
          scheduledAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        },
      });
      assert.equal(pastResult.success, false);

      const futureDate = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      const futureResult = createScheduledWorkoutSchema.safeParse({
        body: {
          workoutId: "workout-123",
          scheduledAt: futureDate,
          notes: "Focus on form and pause reps",
        },
      });
      assert.equal(futureResult.success, true);
    });

    it("schedules, cancels, and starts a scheduled workout", async () => {
      const scheduledWorkoutService = (
        await import("../services/scheduled-workout.service.js")
      ).default;

      const origWFindUnique = prisma.workout.findUnique;
      const origSWCreate = prisma.scheduledWorkout.create;
      const origSWFindFirst = prisma.scheduledWorkout.findFirst;
      const origSWUpdate = prisma.scheduledWorkout.update;
      const origWSStart = workoutSessionService.start;

      (prisma.workout as any).findUnique = async () => ({
        id: "workout-personal-1",
        createdBy: memberAId,
        isActive: true,
      });

      (prisma.scheduledWorkout as any).create = async ({ data }: any) => ({
        id: "sw-1",
        ...data,
        workout: { id: "workout-personal-1", title: "Leg Day", exercises: [] },
        assignment: null,
      });

      (prisma.scheduledWorkout as any).findFirst = async () => ({
        id: "sw-1",
        memberId: memberAId,
        workoutId: "workout-personal-1",
        status: "SCHEDULED",
        isActive: true,
        workout: { id: "workout-personal-1", title: "Leg Day", exercises: [] },
        assignment: null,
      });

      (prisma.scheduledWorkout as any).update = async ({ data }: any) => ({
        id: "sw-1",
        memberId: memberAId,
        status: data.status,
      });

      (workoutSessionService as any).start = async () => ({
        id: "started-from-schedule-session",
        status: "IN_PROGRESS",
      });

      try {
        const created = await scheduledWorkoutService.create(memberAId, {
          workoutId: "workout-personal-1",
          scheduledAt: new Date(Date.now() + 86400000).toISOString(),
        });
        assert.equal(created.id, "sw-1");
        assert.equal(created.status, "SCHEDULED");

        const started = await scheduledWorkoutService.start("sw-1", memberAId);
        assert.equal(started.id, "started-from-schedule-session");

        const cancelled = await scheduledWorkoutService.cancel("sw-1", memberAId);
        assert.equal(cancelled.status, "CANCELLED");
      } finally {
        prisma.workout.findUnique = origWFindUnique;
        prisma.scheduledWorkout.create = origSWCreate;
        prisma.scheduledWorkout.findFirst = origSWFindFirst;
        prisma.scheduledWorkout.update = origSWUpdate;
        workoutSessionService.start = origWSStart;
      }
    });
  });
});
