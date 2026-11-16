import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import workoutService from "../services/workout.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import workoutSetService from "../services/workout-set.service.js";

describe("STREN — Dynamic Sets Management, Exercise Removal & Backend Persistence Test Suite", () => {
  const testRunId = crypto.randomUUID().slice(0, 8);
  let testTrainerId: string;
  let testMemberId: string;
  const createdExerciseIds: string[] = [];
  let workoutId: string;
  let sessionId: string;
  let exerciseLogIds: string[] = [];

  it("0. Prepares test fixture (Trainer, Member, 6 Exercises, 24-set Workout)", async () => {
    // 1. Trainer & Member
    const trainer = await prisma.user.create({
      data: {
        email: `dyn_trainer_${testRunId}@stren.test`,
        password: "hashedPassword123!",
        name: "Dynamic Coach",
        role: Roles.TRAINER,
        isEmailVerified: true,
      },
    });
    testTrainerId = trainer.id;

    const member = await prisma.user.create({
      data: {
        email: `dyn_member_${testRunId}@stren.test`,
        password: "hashedPassword123!",
        name: "Dynamic Athlete",
        role: Roles.MEMBER,
        isEmailVerified: true,
      },
    });
    testMemberId = member.id;

    // 2. 6 Distinct Exercises
    for (let i = 1; i <= 6; i++) {
      const ex = await prisma.exercise.create({
        data: {
          name: `Dynamic Exercise ${i} ${testRunId}`,
          difficulty: "intermediate",
          primaryMuscles: ["chest"],
          equipment: ["barbell"],
          description: `Exercise ${i} for dynamic set & removal test`,
          instructions: ["Step 1", "Step 2"],
          createdById: testTrainerId,
        },
      });
      createdExerciseIds.push(ex.id);
    }
    assert.equal(createdExerciseIds.length, 6);

    // 3. Create a 6-exercise workout, each with 4 target sets (total = 24 planned sets)
    const workout = await workoutService.create(
      {
        title: `Dynamic Test Workout ${testRunId}`,
        description: "Workout for testing dynamic sets and removal",
        category: "strength",
        difficulty: "intermediate",
        estimatedDuration: 60,
        isTemplate: true,
        exercises: createdExerciseIds.map((exId, idx) => ({
          exercise: exId,
          order: idx + 1,
          sets: 4,
          reps: "10",
          targetWeight: 60,
          restSeconds: 60,
        })),
      },
      testTrainerId,
    );
    workoutId = workout.id;
    assert.ok(workoutId);
  });

  it("1. Starts session with 6 exercises and 24 initial planned sets", async () => {
    const sessionRes = await workoutSessionService.start(
      testMemberId,
      undefined,
      workoutId,
    );
    sessionId = sessionRes.id;
    assert.ok(sessionId);
    assert.equal(sessionRes.status, WORKOUT_SESSION_STATUS.IN_PROGRESS);

    // Fetch current session state
    const current = await workoutSessionService.getCurrent(testMemberId);
    assert.ok(current);
    assert.equal(current.exerciseLogs.length, 6);

    exerciseLogIds = current.exerciseLogs.map((l: any) => l.id);

    // Calculate total planned sets across session
    let totalPlannedSets = 0;
    for (const ex of current.exerciseLogs) {
      const uniqueSets = new Set(ex.sets.map((s: any) => s.setNumber));
      totalPlannedSets += Math.max(uniqueSets.size, ex.targetSets || 0);
    }

    assert.equal(totalPlannedSets, 24);
    assert.equal(current.session.setsCompleted, 0);
    assert.equal(current.session.progress, 0);
  });

  it("2. Dynamically reduces Exercise 1 from 4 sets to 2 sets & updates targetSets in DB", async () => {
    const ex1Id = exerciseLogIds[0];

    // Query sets for Exercise 1
    const ex1Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex1Id },
      orderBy: { setNumber: "asc" },
    });
    assert.equal(ex1Sets.length, 4);

    // Delete Set 4
    await workoutSetService.delete(ex1Sets[3].id, testMemberId);

    // Delete Set 3
    await workoutSetService.delete(ex1Sets[2].id, testMemberId);

    // Verify Exercise 1 targetSets is updated to 2 in database
    const updatedEx1 = await prisma.workoutExerciseLog.findUnique({
      where: { id: ex1Id },
    });
    assert.equal(updatedEx1?.targetSets, 2);

    // Verify session total planned sets is now 22 (2 for Ex1 + 4*5 for Ex2-6)
    const current = await workoutSessionService.getCurrent(testMemberId);
    let totalPlannedSets = 0;
    for (const ex of current!.exerciseLogs) {
      const uniqueSets = new Set(ex.sets.map((s: any) => s.setNumber));
      totalPlannedSets += Math.max(uniqueSets.size, ex.targetSets || 0);
    }
    assert.equal(totalPlannedSets, 22);
  });

  it("3. Completes 11 sets across session and verifies progress reaches 50%", async () => {
    const ex1Id = exerciseLogIds[0];
    const ex2Id = exerciseLogIds[1];
    const ex3Id = exerciseLogIds[2];
    const ex4Id = exerciseLogIds[3];

    // Complete Ex1 Set 1 and Set 2 (2 sets)
    const ex1Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex1Id },
      orderBy: { setNumber: "asc" },
    });
    for (const s of ex1Sets) {
      await workoutSetService.update(s.id, testMemberId, {
        weight: 70,
        actualReps: 10,
        completed: true,
      });
    }

    // Verify Ex1 is now marked completed since all 2 remaining sets are done
    const ex1InDb = await prisma.workoutExerciseLog.findUnique({
      where: { id: ex1Id },
    });
    assert.equal(ex1InDb?.completed, true);

    // Complete Ex2 all 4 sets (4 sets)
    const ex2Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex2Id },
      orderBy: { setNumber: "asc" },
    });
    for (const s of ex2Sets) {
      await workoutSetService.update(s.id, testMemberId, {
        weight: 80,
        actualReps: 10,
        completed: true,
      });
    }

    // Complete Ex3 all 4 sets (4 sets)
    const ex3Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex3Id },
      orderBy: { setNumber: "asc" },
    });
    for (const s of ex3Sets) {
      await workoutSetService.update(s.id, testMemberId, {
        weight: 90,
        actualReps: 10,
        completed: true,
      });
    }

    // Complete Ex4 Set 1 only (1 set) -> Total completed sets = 2 + 4 + 4 + 1 = 11 sets
    const ex4Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex4Id },
      orderBy: { setNumber: "asc" },
    });
    await workoutSetService.update(ex4Sets[0].id, testMemberId, {
      weight: 100,
      actualReps: 10,
      completed: true,
    });

    // Check session progress: 11 completed / 22 planned = 50%
    const current = await workoutSessionService.getCurrent(testMemberId);
    assert.equal(current?.session.setsCompleted, 11);
    assert.equal(current?.session.progress, 50);
  });

  it("4. Removes uncompleted Exercise 6 (hard removal) and verifies denominator recalculation", async () => {
    const ex6Id = exerciseLogIds[5];

    // Remove Exercise 6
    const updated = await workoutSessionService.removeExercise(
      sessionId,
      ex6Id,
      testMemberId,
    );

    // Verify Ex6 is completely deleted
    const deletedLog = await prisma.workoutExerciseLog.findUnique({
      where: { id: ex6Id },
    });
    assert.equal(deletedLog, null);

    assert.ok(updated);

    // Active exercises count should be 5
    assert.equal(updated.exerciseLogs.length, 5);

    // Order should be continuous 1, 2, 3, 4, 5
    const orders = updated.exerciseLogs.map((l: any) => l.order);
    assert.deepEqual(orders, [1, 2, 3, 4, 5]);

    // Planned sets: Ex1 (2) + Ex2 (4) + Ex3 (4) + Ex4 (4) + Ex5 (4) = 18 sets
    let totalPlannedSets = 0;
    for (const ex of updated.exerciseLogs) {
      const uniqueSets = new Set(ex.sets.map((s: any) => s.setNumber));
      totalPlannedSets += Math.max(uniqueSets.size, ex.targetSets || 0);
    }
    assert.equal(totalPlannedSets, 18);

    // Progress: 11 / 18 = 61%
    assert.equal(updated.session.progress, Math.round((11 / 18) * 100));
  });

  it("5. Removes partially completed Exercise 5 (soft removal) preserving historical sets", async () => {
    const ex5Id = exerciseLogIds[4];

    // Complete Set 1 of Ex5 with 100kg x 8 reps = 800 volume
    const ex5Sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex5Id },
      orderBy: { setNumber: "asc" },
    });
    await workoutSetService.update(ex5Sets[0].id, testMemberId, {
      weight: 100,
      actualReps: 8,
      completed: true,
    });

    // Remove Exercise 5
    const updated = await workoutSessionService.removeExercise(
      sessionId,
      ex5Id,
      testMemberId,
    );

    assert.ok(updated);

    // Active exercises in session is now 4 (Ex1, Ex2, Ex3, Ex4)
    assert.equal(updated.exerciseLogs.length, 4);

    // Orders are continuous 1..4
    const orders = updated.exerciseLogs.map((l: any) => l.order);
    assert.deepEqual(orders, [1, 2, 3, 4]);

    // Verify Ex5 in DB has isRemoved: true and negative order
    const removedEx5 = await prisma.workoutExerciseLog.findUnique({
      where: { id: ex5Id },
      include: { sets: true },
    });
    assert.ok(removedEx5);
    assert.equal(removedEx5.isRemoved, true);
    assert.ok(removedEx5.order < 0);

    // Verify that Ex5's completed set still exists (preserving historical performance!)
    assert.equal(removedEx5.sets.length, 1);
    assert.equal(removedEx5.sets[0].completed, true);
    assert.equal(removedEx5.sets[0].weight, 100);
    assert.equal(removedEx5.sets[0].actualReps, 8);

    // Verify that Ex5's uncompleted sets were deleted
    const uncompletedSets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex5Id, completed: false },
    });
    assert.equal(uncompletedSets.length, 0);

    // Remaining active planned sets: Ex1 (2) + Ex2 (4) + Ex3 (4) + Ex4 (4) = 14 planned sets
    let totalPlannedSets = 0;
    for (const ex of updated.exerciseLogs) {
      const uniqueSets = new Set(ex.sets.map((s: any) => s.setNumber));
      totalPlannedSets += Math.max(uniqueSets.size, ex.targetSets || 0);
    }
    assert.equal(totalPlannedSets, 14);
  });

  it("6. Completes all remaining active sets and verifies progress reaches 100%", async () => {
    const ex4Id = exerciseLogIds[3];

    // Complete remaining sets of Ex4 (Sets 2, 3, 4)
    const ex4Remaining = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId: ex4Id, completed: false },
    });
    for (const s of ex4Remaining) {
      await workoutSetService.update(s.id, testMemberId, {
        weight: 100,
        actualReps: 10,
        completed: true,
      });
    }

    // Now all 14 active sets across Ex1, Ex2, Ex3, Ex4 are completed!
    const current = await workoutSessionService.getCurrent(testMemberId);
    assert.equal(current?.session.setsCompleted, 14);
    assert.equal(current?.session.progress, 100);
    assert.equal(current?.session.exercisesCompleted, 4);
  });

  it("7. Simulates session recovery / browser refresh via getCurrent", async () => {
    const reloaded = await workoutSessionService.getCurrent(testMemberId);
    assert.ok(reloaded);

    // Active session still in progress with 100% progress
    assert.equal(reloaded.session.status, WORKOUT_SESSION_STATUS.IN_PROGRESS);
    assert.equal(reloaded.session.progress, 100);

    // Only active exercises returned (4 exercises)
    assert.equal(reloaded.exerciseLogs.length, 4);
    for (const ex of reloaded.exerciseLogs) {
      assert.equal(ex.isRemoved, false);
      assert.ok(ex.order > 0);
    }

    // Finish session cleanly
    const finished = await workoutSessionService.finish(sessionId, testMemberId, {
      notes: "Dynamic sets and exercise removal verified perfectly",
    });
    assert.equal(finished.status, WORKOUT_SESSION_STATUS.COMPLETED);
  });

  after(async () => {
    try {
      if (testMemberId) {
        await prisma.workoutSetLog.deleteMany({
          where: { exerciseLog: { session: { memberId: testMemberId } } },
        });
        await prisma.workoutExerciseLog.deleteMany({
          where: { session: { memberId: testMemberId } },
        });
        await prisma.workoutSession.deleteMany({
          where: { memberId: testMemberId },
        });
      }
      const userIds = [testTrainerId, testMemberId].filter(Boolean);
      if (userIds.length > 0) {
        await prisma.workoutExercise.deleteMany({
          where: { workout: { createdBy: { in: userIds } } },
        });
        await prisma.workout.deleteMany({
          where: { createdBy: { in: userIds } },
        });
      }
      if (createdExerciseIds.length > 0) {
        await prisma.workoutExercise.deleteMany({
          where: { exerciseId: { in: createdExerciseIds } },
        });
        await prisma.workoutExerciseLog.deleteMany({
          where: { exerciseId: { in: createdExerciseIds } },
        });
        await prisma.exercise.deleteMany({
          where: { id: { in: createdExerciseIds } },
        });
      }
      if (testMemberId) {
        await prisma.user.deleteMany({ where: { id: testMemberId } });
      }
      if (testTrainerId) {
        await prisma.user.deleteMany({ where: { id: testTrainerId } });
      }
    } catch (e) {
      console.error("Cleanup error in dynamic-sets test:", e);
    }
  });
});
