import { describe, it } from "node:test";
import assert from "node:assert/strict";

import prisma from "../config/prisma.js";
import workoutSessionService from "../services/workout-session.service.js";
import mapAssignment from "../mappers/assignment.mapper.js";
import mapWorkout from "../mappers/workout.mapper.js";
import mapWorkoutSession from "../mappers/workout-session.mapper.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

describe("STREN — Live Workout UI, Exercise Images & Flexible Replay Verification", () => {
  const memberId = "member-replay-uuid-001";
  const coachId = "coach-replay-uuid-002";
  const workoutId = "workout-replay-uuid-003";
  const historicalSessionId = "session-hist-uuid-004";
  const exerciseId = "ex-replay-uuid-005";

  describe("1. Flexible Workout Replay & Historical Integrity", () => {
    it("allows member to start a new session for a previously completed workout without active assignment", async () => {
      const origSessionFindFirst = prisma.workoutSession.findFirst;
      const origWorkoutFindUnique = prisma.workout.findUnique;
      const origAssignmentFindFirst = prisma.assignment.findFirst;
      const origTransaction = prisma.$transaction;

      let createdSessionData: any = null;

      // Mock finding no active session
      (prisma.workoutSession as any).findFirst = async ({ where }: any) => {
        if (where?.status === WORKOUT_SESSION_STATUS.IN_PROGRESS) {
          return null; // No active session in progress
        }
        if (where?.status === WORKOUT_SESSION_STATUS.COMPLETED) {
          // Finds previously completed session
          return {
            id: historicalSessionId,
            memberId,
            workoutId,
            status: WORKOUT_SESSION_STATUS.COMPLETED,
            isActive: true,
            endedAt: new Date("2026-10-01T10:00:00Z"),
          };
        }
        return null;
      };

      (prisma.workout as any).findUnique = async () => ({
        id: workoutId,
        title: "Upper Body Hypertrophy",
        description: "Intense chest and triceps session",
        createdBy: coachId, // Created by coach, NOT by member
        isTemplate: false,
        isActive: true,
        exercises: [
          {
            order: 1,
            sets: 3,
            reps: "10-12",
            exerciseId,
            exercise: {
              id: exerciseId,
              name: "Incline Barbell Bench Press",
              imageUrl: "https://stren.app/uploads/incline-press.png",
              primaryMuscles: ["Chest"],
              secondaryMuscles: ["Triceps"],
              equipment: ["Barbell"],
            },
          },
        ],
      });

      // No active assignment
      (prisma.assignment as any).findFirst = async () => null;

      // Transaction mock
      (prisma as any).$transaction = async (fn: any) => {
        const fakeTx = {
          workoutSession: {
            create: async ({ data }: any) => {
              createdSessionData = data;
              return {
                id: "new-session-uuid-999",
                ...data,
                startedAt: new Date(),
                workout: {
                  id: workoutId,
                  title: "Upper Body Hypertrophy",
                },
              };
            },
          },
          workoutExerciseLog: {
            create: async ({ data }: any) => ({
              id: "new-ex-log-uuid",
              ...data,
            }),
          },
          workoutSetLog: {
            create: async ({ data }: any) => ({
              id: "new-set-log-uuid",
              ...data,
            }),
          },
          scheduledWorkout: {
            updateMany: async () => ({ count: 0 }),
          },
        };
        return fn(fakeTx);
      };

      try {
        const result = await workoutSessionService.start(
          memberId,
          undefined,
          workoutId,
        );

        assert.ok(result);
        assert.equal(result.status, WORKOUT_SESSION_STATUS.IN_PROGRESS);
        assert.equal(createdSessionData.workoutId, workoutId);
        assert.equal(createdSessionData.memberId, memberId);
        assert.equal(createdSessionData.status, WORKOUT_SESSION_STATUS.IN_PROGRESS);
        // Brand new session created, leaving historical session intact
        assert.notEqual(result.id, historicalSessionId);
      } finally {
        prisma.workoutSession.findFirst = origSessionFindFirst;
        prisma.workout.findUnique = origWorkoutFindUnique;
        prisma.assignment.findFirst = origAssignmentFindFirst;
        prisma.$transaction = origTransaction;
      }
    });

    it("rejects starting a new session with 409 conflict when member already has an active session", async () => {
      const origSessionFindFirst = prisma.workoutSession.findFirst;

      (prisma.workoutSession as any).findFirst = async ({ where }: any) => {
        if (where?.status === WORKOUT_SESSION_STATUS.IN_PROGRESS) {
          return {
            id: "already-active-session-id",
            memberId,
            workoutId: "other-workout-id",
            status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
            workout: {
              id: "other-workout-id",
              title: "Current Leg Day",
            },
          };
        }
        return null;
      };

      try {
        await assert.rejects(
          async () => {
            await workoutSessionService.start(
              memberId,
              undefined,
              workoutId,
            );
          },
          (err: any) => {
            assert.equal(err.statusCode, 409);
            assert.equal(err.message, "You already have an active workout session.");
            assert.equal(err.data.activeSessionId, "already-active-session-id");
            assert.equal(err.data.activeWorkoutTitle, "Current Leg Day");
            return true;
          },
        );
      } finally {
        prisma.workoutSession.findFirst = origSessionFindFirst;
      }
    });
  });

  describe("2. Previous Performance Comparisons for Replay Sessions", () => {
    it("excludes the current session and retrieves the previous completed session metrics", async () => {
      const origLogFindMany = prisma.workoutExerciseLog.findMany;

      (prisma.workoutExerciseLog as any).findMany = async ({ where }: any) => {
        // Verify excludeSessionId is respected
        assert.equal(where?.session?.status, WORKOUT_SESSION_STATUS.COMPLETED);
        assert.equal(where?.session?.id?.not, "new-session-uuid-999");
        assert.deepEqual(where?.exerciseId, { in: [exerciseId] });

        return [
          {
            exerciseId,
            session: {
              id: historicalSessionId,
              startedAt: new Date("2026-10-01T09:00:00Z"),
              endedAt: new Date("2026-10-01T10:00:00Z"),
              workout: { title: "Upper Body Hypertrophy" },
              assignment: null,
            },
            sets: [
              { setNumber: 1, weight: 80, actualReps: 10, completed: true },
              { setNumber: 2, weight: 85, actualReps: 8, completed: true },
            ],
          },
        ];
      };

      try {
        const perf = await workoutSessionService.getPreviousPerformanceForExercises(
          [exerciseId],
          memberId,
          "new-session-uuid-999",
        );

        assert.ok(perf[exerciseId]);
        assert.equal(perf[exerciseId].sessionId, historicalSessionId);
        assert.equal(perf[exerciseId].workoutTitle, "Upper Body Hypertrophy");
        assert.equal(perf[exerciseId].maxWeight, 85);
        assert.equal(perf[exerciseId].totalVolume, 80 * 10 + 85 * 8);
        assert.equal(perf[exerciseId].sets.length, 2);
      } finally {
        prisma.workoutExerciseLog.findMany = origLogFindMany;
      }
    });
  });

  describe("3. Exercise Image Flow & Mapper Data Contracts", () => {
    it("preserves imageUrl and exerciseCount in workout.mapper.ts", () => {
      const dbWorkout = {
        id: "w-1",
        title: "Leg Day",
        description: "Heavy squats",
        category: "Strength",
        difficulty: "Advanced",
        estimatedDuration: 60,
        isTemplate: false,
        isActive: true,
        createdBy: "trainer-1",
        creator: { id: "trainer-1", name: "Coach Mike" },
        createdAt: new Date(),
        updatedAt: new Date(),
        exercises: [
          {
            order: 1,
            sets: 4,
            reps: "8",
            exercise: {
              id: "ex-1",
              name: "Barbell Back Squat",
              imageUrl: "https://stren.app/uploads/squat.jpg",
            },
          },
          {
            order: 2,
            sets: 3,
            reps: "12",
            exercise: {
              id: "ex-2",
              name: "Leg Press",
              imageUrl: null,
            },
          },
        ],
      };

      const mapped = mapWorkout(dbWorkout as any);
      assert.equal(mapped.imageUrl, "https://stren.app/uploads/squat.jpg");
      assert.equal(mapped.exerciseCount, 2);
    });

    it("preserves imageUrl and exerciseCount in assignment.mapper.ts", () => {
      const dbAssignment = {
        id: "a-1",
        member: { id: "m-1", name: "Alice", email: "alice@test.com" },
        trainer: { id: "t-1", name: "Coach Mike", email: "mike@test.com" },
        workout: {
          id: "w-1",
          title: "Leg Day",
          description: "Heavy squats",
          category: "Strength",
          difficulty: "Advanced",
          estimatedDuration: 60,
          exercises: [
            {
              order: 1,
              exercise: {
                id: "ex-1",
                name: "Barbell Back Squat",
                imageUrl: "https://stren.app/uploads/squat.jpg",
              },
            },
          ],
        },
        startDate: new Date(),
        endDate: null,
        status: "ACTIVE",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mapped = mapAssignment(dbAssignment as any);
      assert.ok(mapped.workout);
      assert.equal(mapped.workout.imageUrl, "https://stren.app/uploads/squat.jpg");
      assert.equal(mapped.workout.exerciseCount, 1);
    });

    it("preserves imageUrl and exercise details in mapWorkoutSession", () => {
      const sessionEntity = {
        id: "s-1",
        status: "IN_PROGRESS",
        startedAt: new Date(),
        duration: 25,
        progress: 50,
        workout: {
          id: "w-1",
          title: "Full Body Blast",
          imageUrl: "https://stren.app/uploads/blast.webp",
          exerciseCount: 5,
        },
      };

      const mapped = mapWorkoutSession(sessionEntity as any);
      assert.ok(mapped.workout);
      assert.equal(mapped.workout.imageUrl, "https://stren.app/uploads/blast.webp");
      assert.equal(mapped.workout.exerciseCount, 5);
    });
  });
});
