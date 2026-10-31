import { describe, it } from "node:test";
import assert from "node:assert/strict";
import workoutSessionService from "../services/workout-session.service.js";
import prisma from "../config/prisma.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

describe("STREN — Exercise-Specific Highest Performance (Historical Best / PR)", () => {
  it("computes Highest PR correctly with weighted exercise comparison rules (weight > reps)", async () => {
    const origFindMany = prisma.workoutExerciseLog.findMany;
    const exerciseId = "ex-bench-press";
    const memberId = "member-user-1";

    const mockLogs = [
      // Session 2 (Yesterday, endedAt: 2026-10-29): 80kg x 10, 85kg x 8 (Most recent -> Prev)
      {
        id: "log-sess-2",
        exerciseId,
        session: {
          id: "sess-2-yesterday",
          startedAt: new Date("2026-10-29T10:00:00Z"),
          endedAt: new Date("2026-10-29T11:00:00Z"),
          workout: { title: "Push Day A" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 80, actualReps: 10, completed: true },
          { setNumber: 2, segmentIndex: 0, weight: 85, actualReps: 8, completed: true },
        ],
      },
      // Session 1 (Last week, endedAt: 2026-10-20): 90kg x 6, 90kg x 8 (Historical Best Weight & Reps)
      {
        id: "log-sess-1",
        exerciseId,
        session: {
          id: "sess-1-last-week",
          startedAt: new Date("2026-10-20T10:00:00Z"),
          endedAt: new Date("2026-10-20T11:00:00Z"),
          workout: { title: "Push Day Heavy" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 90, actualReps: 6, completed: true },
          { setNumber: 2, segmentIndex: 0, weight: 90, actualReps: 8, completed: true },
          // Uncompleted set with higher theoretical weight must be ignored
          { setNumber: 3, segmentIndex: 0, weight: 95, actualReps: 2, completed: false },
        ],
      },
    ];

    prisma.workoutExerciseLog.findMany = (async (args: any) => {
      assert.deepEqual(args.where.exerciseId, { in: [exerciseId] });
      assert.equal(args.where.session.memberId, memberId);
      assert.equal(args.where.session.status, WORKOUT_SESSION_STATUS.COMPLETED);
      return mockLogs;
    }) as any;

    try {
      const perf = await workoutSessionService.getPreviousPerformanceForExercises(
        [exerciseId],
        memberId,
        "current-active-sess-id",
      );

      assert.ok(perf[exerciseId]);
      // Prev represents most recent completed session (sess-2-yesterday)
      assert.equal(perf[exerciseId].sessionId, "sess-2-yesterday");
      assert.equal(perf[exerciseId].sets.length, 2);
      assert.equal(perf[exerciseId].sets[0].weight, 80);
      assert.equal(perf[exerciseId].sets[0].actualReps, 10);
      assert.equal(perf[exerciseId].sets[1].weight, 85);
      assert.equal(perf[exerciseId].sets[1].actualReps, 8);

      // Highest represents historical best completed set across all sessions (90kg x 8 from sess-1)
      assert.ok(perf[exerciseId].highestPerformance);
      assert.equal(perf[exerciseId].highestPerformance.weight, 90);
      assert.equal(perf[exerciseId].highestPerformance.actualReps, 8);
      assert.equal(perf[exerciseId].highestPerformance.sessionId, "sess-1-last-week");
    } finally {
      prisma.workoutExerciseLog.findMany = origFindMany;
    }
  });

  it("handles bodyweight / 0-weight exercises comparing completed reps", async () => {
    const origFindMany = prisma.workoutExerciseLog.findMany;
    const exerciseId = "ex-pull-ups";
    const memberId = "member-user-1";

    const mockLogs = [
      {
        id: "log-bw-2",
        exerciseId,
        session: {
          id: "sess-pullups-recent",
          startedAt: new Date("2026-10-28T10:00:00Z"),
          endedAt: new Date("2026-10-28T10:45:00Z"),
          workout: { title: "Back Calisthenics" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 0, actualReps: 15, completed: true },
          { setNumber: 2, segmentIndex: 0, weight: 0, actualReps: 12, completed: true },
        ],
      },
      {
        id: "log-bw-1",
        exerciseId,
        session: {
          id: "sess-pullups-older",
          startedAt: new Date("2026-10-15T10:00:00Z"),
          endedAt: new Date("2026-10-15T10:45:00Z"),
          workout: { title: "Back Endurance" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 0, actualReps: 22, completed: true },
        ],
      },
    ];

    prisma.workoutExerciseLog.findMany = (async () => mockLogs) as any;

    try {
      const perf = await workoutSessionService.getPreviousPerformanceForExercises(
        [exerciseId],
        memberId,
      );

      assert.ok(perf[exerciseId]);
      assert.equal(perf[exerciseId].sessionId, "sess-pullups-recent");
      assert.equal(perf[exerciseId].highestPerformance?.weight, 0);
      assert.equal(perf[exerciseId].highestPerformance?.actualReps, 22);
      assert.equal(perf[exerciseId].highestPerformance?.sessionId, "sess-pullups-older");
    } finally {
      prisma.workoutExerciseLog.findMany = origFindMany;
    }
  });

  it("prioritizes weighted bodyweight (weight > 0) over unweighted bodyweight (weight = 0)", async () => {
    const origFindMany = prisma.workoutExerciseLog.findMany;
    const exerciseId = "ex-dips";
    const memberId = "member-user-1";

    const mockLogs = [
      {
        id: "log-dips-2",
        exerciseId,
        session: {
          id: "sess-dips-weighted",
          startedAt: new Date("2026-10-27T10:00:00Z"),
          endedAt: new Date("2026-10-27T10:45:00Z"),
          workout: { title: "Chest & Triceps" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 15, actualReps: 8, completed: true },
        ],
      },
      {
        id: "log-dips-1",
        exerciseId,
        session: {
          id: "sess-dips-unweighted",
          startedAt: new Date("2026-10-10T10:00:00Z"),
          endedAt: new Date("2026-10-10T10:45:00Z"),
          workout: { title: "Endurance Dips" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 0, actualReps: 25, completed: true },
        ],
      },
    ];

    prisma.workoutExerciseLog.findMany = (async () => mockLogs) as any;

    try {
      const perf = await workoutSessionService.getPreviousPerformanceForExercises(
        [exerciseId],
        memberId,
      );

      assert.ok(perf[exerciseId]);
      // 15kg x 8 beats 0kg x 25 reps because weighted takes priority over bodyweight
      assert.equal(perf[exerciseId].highestPerformance?.weight, 15);
      assert.equal(perf[exerciseId].highestPerformance?.actualReps, 8);
    } finally {
      prisma.workoutExerciseLog.findMany = origFindMany;
    }
  });

  it("strictly isolates performance per exerciseId and never blends different exercises", async () => {
    const origFindMany = prisma.workoutExerciseLog.findMany;
    const benchPressId = "ex-bench-press";
    const inclineDumbbellId = "ex-incline-dumbbell-press";
    const memberId = "member-user-1";

    const mockLogs = [
      {
        id: "log-bench",
        exerciseId: benchPressId,
        session: {
          id: "sess-1",
          startedAt: new Date(),
          endedAt: new Date(),
          workout: { title: "Chest Day" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 120, actualReps: 5, completed: true },
        ],
      },
      {
        id: "log-incline",
        exerciseId: inclineDumbbellId,
        session: {
          id: "sess-1",
          startedAt: new Date(),
          endedAt: new Date(),
          workout: { title: "Chest Day" },
          assignment: null,
        },
        sets: [
          { setNumber: 1, segmentIndex: 0, weight: 36, actualReps: 10, completed: true },
        ],
      },
    ];

    prisma.workoutExerciseLog.findMany = (async () => mockLogs) as any;

    try {
      const perf = await workoutSessionService.getPreviousPerformanceForExercises(
        [benchPressId, inclineDumbbellId],
        memberId,
      );

      assert.equal(perf[benchPressId]?.highestPerformance?.weight, 120);
      assert.equal(perf[benchPressId]?.highestPerformance?.actualReps, 5);

      assert.equal(perf[inclineDumbbellId]?.highestPerformance?.weight, 36);
      assert.equal(perf[inclineDumbbellId]?.highestPerformance?.actualReps, 10);
      // Ensure no crossover
      assert.notEqual(perf[inclineDumbbellId]?.highestPerformance?.weight, 120);
    } finally {
      prisma.workoutExerciseLog.findMany = origFindMany;
    }
  });

  it("returns null when an exercise has no completed historical sessions", async () => {
    const origFindMany = prisma.workoutExerciseLog.findMany;
    const newExerciseId = "ex-brand-new-movement";
    const memberId = "member-user-1";

    prisma.workoutExerciseLog.findMany = (async () => []) as any;

    try {
      const perf = await workoutSessionService.getPreviousPerformanceForExercises(
        [newExerciseId],
        memberId,
      );

      assert.equal(perf[newExerciseId], null);
    } finally {
      prisma.workoutExerciseLog.findMany = origFindMany;
    }
  });
});
