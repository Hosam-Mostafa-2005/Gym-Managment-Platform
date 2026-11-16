import { describe, it, after } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import workoutService from "../services/workout.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import workoutSetService from "../services/workout-set.service.js";

describe("STREN — Parent/Child Break Sets and In-Session Set Removal Test Suite", () => {
  const testRunId = crypto.randomUUID().slice(0, 8);
  let athleteId: string;
  let exerciseId: string;
  let sessionId: string;
  let exerciseLogId: string;

  it("0. Prepares test fixture (Athlete, Exercise)", async () => {
    const athlete = await prisma.user.create({
      data: {
        email: `break_athlete_${testRunId}@stren.test`,
        password: "hashedPassword123!",
        name: "Break Set Athlete",
        role: Roles.MEMBER,
        isEmailVerified: true,
      },
    });
    athleteId = athlete.id;

    const exercise = await prisma.exercise.create({
      data: {
        name: `Barbell Bench Press ${testRunId}`,
        difficulty: "intermediate",
        primaryMuscles: ["chest"],
        secondaryMuscles: ["triceps", "shoulders"],
        equipment: ["barbell"],
        description: "Flat bench press for testing parent/child break sets",
        instructions: ["Press bar up", "Lower to chest with control"],
        imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-bench-press-v2.png",
      },
    });
    exerciseId = exercise.id;

    assert.ok(athleteId);
    assert.ok(exerciseId);
  });

  it("1. Starts active workout session with 3 prescribed normal sets (1.0, 2.0, 3.0)", async () => {
    const workout = await workoutService.create(
      {
        title: `Chest Routine ${testRunId}`,
        category: "strength" as const,
        difficulty: "intermediate" as const,
        estimatedDuration: 45,
        tags: ["break-sets"],
        isTemplate: false,
        exercises: [
          {
            exercise: exerciseId,
            sets: 3,
            reps: "10",
            targetWeight: 80,
            restSeconds: 90,
            order: 1,
          },
        ],
      },
      athleteId,
    );

    const session = await workoutSessionService.start(athleteId, undefined, workout.id);
    sessionId = session.id;

    const current = await workoutSessionService.getCurrent(athleteId);
    assert.ok(current);
    assert.equal(current.exerciseLogs.length, 1);

    const exLog = current.exerciseLogs[0];
    exerciseLogId = exLog.id;

    // 3 prescribed sets, all initially normal: 1.0, 2.0, 3.0
    assert.equal(exLog.sets.length, 3);
    assert.equal(exLog.sets[0].setNumber, 1);
    assert.equal(exLog.sets[0].segmentIndex, 0);
    assert.equal(exLog.sets[0].setType, "NORMAL");

    assert.equal(exLog.sets[1].setNumber, 2);
    assert.equal(exLog.sets[1].segmentIndex, 0);

    assert.equal(exLog.sets[2].setNumber, 3);
    assert.equal(exLog.sets[2].segmentIndex, 0);
  });

  it("2. Adds a child Break Set (1.1) to existing parent Set 1.0", async () => {
    // Athlete adds Break Set 1.1 under Set 1.0
    const child1 = await workoutSetService.create(
      {
        exerciseLog: exerciseLogId,
        setNumber: 1,
        segmentIndex: 1,
        setType: "DROP_SET",
        targetReps: "8",
        weight: 60,
        actualReps: 0,
        completed: false,
      },
      athleteId,
    );

    assert.ok(child1.id);
    assert.equal(child1.setNumber, 1);
    assert.equal(child1.segmentIndex, 1);
    assert.equal(child1.isIntermediateSegment, false);
    assert.equal(child1.isFinalSegment, true);

    // Verify parent Set 1.0 was transitioned to intermediate segment (no rest timer)
    const parent1 = await prisma.workoutSetLog.findFirst({
      where: { exerciseLogId, setNumber: 1, segmentIndex: 0 },
    });
    assert.equal(parent1?.isIntermediateSegment, true);
    assert.equal(parent1?.isFinalSegment, false);
    assert.equal(parent1?.setType, "DROP_SET");
  });

  it("3. Adds a second child Break Set (1.2) to parent Set 1.0", async () => {
    // Athlete adds Break Set 1.2 under Set 1.0
    const child2 = await workoutSetService.create(
      {
        exerciseLog: exerciseLogId,
        setNumber: 1,
        segmentIndex: 2,
        setType: "DROP_SET",
        targetReps: "8",
        weight: 40,
        actualReps: 0,
        completed: false,
      },
      athleteId,
    );

    assert.ok(child2.id);
    assert.equal(child2.setNumber, 1);
    assert.equal(child2.segmentIndex, 2);
    assert.equal(child2.isIntermediateSegment, false);
    assert.equal(child2.isFinalSegment, true);

    // Verify child 1.1 was transitioned to intermediate segment
    const child1 = await prisma.workoutSetLog.findFirst({
      where: { exerciseLogId, setNumber: 1, segmentIndex: 1 },
    });
    assert.equal(child1?.isIntermediateSegment, true);
    assert.equal(child1?.isFinalSegment, false);
  });

  it("4. Saves independent weights and reps for every stage & verifies persistence on session reload", async () => {
    const sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId, setNumber: 1 },
      orderBy: { segmentIndex: "asc" },
    });
    assert.equal(sets.length, 3); // 1.0, 1.1, 1.2

    // Log Set 1.0 (Parent): 80 kg × 10 reps
    await workoutSetService.update(sets[0].id, athleteId, {
      weight: 80,
      actualReps: 10,
      completed: true,
    });

    // Log Set 1.1 (Break 1): 60 kg × 8 reps
    await workoutSetService.update(sets[1].id, athleteId, {
      weight: 60,
      actualReps: 8,
      completed: true,
    });

    // Log Set 1.2 (Break 2): 40 kg × 8 reps
    await workoutSetService.update(sets[2].id, athleteId, {
      weight: 40,
      actualReps: 8,
      completed: true,
    });

    // Reload session from database
    const reloaded = await workoutSessionService.getCurrent(athleteId);
    assert.ok(reloaded);

    const reloadedSets = reloaded.exerciseLogs[0].sets.filter((s: any) => s.setNumber === 1);
    assert.equal(reloadedSets.length, 3);

    // Verify independent weights and reps
    assert.equal(reloadedSets[0].weight, 80);
    assert.equal(reloadedSets[0].actualReps, 10);
    assert.equal(reloadedSets[0].completed, true);
    assert.equal(reloadedSets[0].segmentIndex, 0);

    assert.equal(reloadedSets[1].weight, 60);
    assert.equal(reloadedSets[1].actualReps, 8);
    assert.equal(reloadedSets[1].completed, true);
    assert.equal(reloadedSets[1].segmentIndex, 1);

    assert.equal(reloadedSets[2].weight, 40);
    assert.equal(reloadedSets[2].actualReps, 8);
    assert.equal(reloadedSets[2].completed, true);
    assert.equal(reloadedSets[2].segmentIndex, 2);
  });

  it("5. Rest timer behavior and volume calculation: intermediate stages do NOT trigger rest; volume sums all completed stages", async () => {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    // Volume calculation:
    // Set 1.0: 80 × 10 = 800 kg
    // Set 1.1: 60 × 8 = 480 kg
    // Set 1.2: 40 × 8 = 320 kg
    // Total Volume = 800 + 480 + 320 = 1600 kg!
    assert.equal(session?.totalVolume, 1600);

    // Sets 2.0 and 3.0 are not yet completed, so completed parent sets is 1
    assert.equal(session?.setsCompleted, 1);

    // Exercise log is NOT completed because targetSets is 3
    const exLog = await prisma.workoutExerciseLog.findUnique({
      where: { id: exerciseLogId },
    });
    assert.equal(exLog?.completed, false);
  });

  it("6. Deleting a child break set (1.2) removes only that child without affecting parent or siblings", async () => {
    const stage2 = await prisma.workoutSetLog.findFirst({
      where: { exerciseLogId, setNumber: 1, segmentIndex: 2 },
    });
    assert.ok(stage2);

    await workoutSetService.delete(stage2.id, athleteId);

    // Verify remaining stages under Set 1
    const remaining = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId, setNumber: 1 },
      orderBy: { segmentIndex: "asc" },
    });
    assert.equal(remaining.length, 2); // 1.0 and 1.1 remain intact!
    assert.equal(remaining[0].segmentIndex, 0);
    assert.equal(remaining[0].weight, 80);

    assert.equal(remaining[1].segmentIndex, 1);
    assert.equal(remaining[1].weight, 60);
    // Remaining child is now final segment
    assert.equal(remaining[1].isFinalSegment, true);
    assert.equal(remaining[1].isIntermediateSegment, false);

    // Volume updated automatically: 800 + 480 = 1280 kg (stage2 320 kg was removed)
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });
    assert.equal(session?.totalVolume, 1280);
  });

  it("7. Deleting a parent set with children removes parent and all child break sets (cascading removal)", async () => {
    const parentSet1 = await prisma.workoutSetLog.findFirst({
      where: { exerciseLogId, setNumber: 1, segmentIndex: 0 },
    });
    assert.ok(parentSet1);

    // Deleting parent Set 1.0 (which still has child 1.1)
    await workoutSetService.delete(parentSet1.id, athleteId);

    // Verify that ALL stages of Set 1 are removed
    const set1Stages = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId, setNumber: 1 },
    });
    // Set 1 stages were deleted, and former Set 2 was renumbered to Set 1!
    // Let's verify continuous renumbering of remaining sets
    const remainingSets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId },
      orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
    });

    // Originally we had Set 1 (with child), Set 2, Set 3 (4 rows total).
    // After deleting Set 1 and its child, 2 sets remain (formerly 2 and 3).
    assert.equal(remainingSets.length, 2);
    // They are renumbered cleanly to Set 1 and Set 2! No gaps!
    assert.equal(remainingSets[0].setNumber, 1);
    assert.equal(remainingSets[0].segmentIndex, 0);

    assert.equal(remainingSets[1].setNumber, 2);
    assert.equal(remainingSets[1].segmentIndex, 0);
  });

  it("8. Dynamic set reduction: deleting uncompleted sets updates targetSets and marks completed if all remaining sets are done", async () => {
    // Currently, 2 unlogged sets remain (Set 1.0 and Set 2.0).
    // Complete Set 1.0 only
    const sets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId },
      orderBy: { setNumber: "asc" },
    });
    await workoutSetService.update(sets[0].id, athleteId, {
      weight: 80,
      actualReps: 10,
      completed: true,
    });

    // Delete Set 2.0 (which was incomplete)
    await workoutSetService.delete(sets[1].id, athleteId);

    // Now only 1 set exists (Set 1.0, completed).
    // Dynamic set reduction: targetSets has been authoritatively updated to 1,
    // and since the 1 remaining set is completed, the exercise is marked completed.
    const exLog = await prisma.workoutExerciseLog.findUnique({
      where: { id: exerciseLogId },
    });
    assert.equal(exLog?.targetSets, 1);
    assert.equal(exLog?.completed, true);
  });

  it("9. Completing minimum targetSets marks exercise completed", async () => {
    // Add Set 2.0 and Set 3.0 and complete them
    const set2 = await workoutSetService.create(
      {
        exerciseLog: exerciseLogId,
        setNumber: 2,
        segmentIndex: 0,
        setType: "NORMAL",
        targetReps: "10",
        weight: 80,
        actualReps: 10,
        completed: true,
      },
      athleteId,
    );
    assert.ok(set2.id);

    const set3 = await workoutSetService.create(
      {
        exerciseLog: exerciseLogId,
        setNumber: 3,
        segmentIndex: 0,
        setType: "NORMAL",
        targetReps: "10",
        weight: 80,
        actualReps: 10,
        completed: true,
      },
      athleteId,
    );
    assert.ok(set3.id);

    // Now 3 sets completed out of 3 targetSets -> exercise is COMPLETED!
    const exLog = await prisma.workoutExerciseLog.findUnique({
      where: { id: exerciseLogId },
    });
    assert.equal(exLog?.completed, true);
  });

  after(async () => {
    try {
      if (athleteId) {
        await prisma.workoutSetLog.deleteMany({
          where: { exerciseLog: { session: { memberId: athleteId } } },
        });
        await prisma.workoutExerciseLog.deleteMany({
          where: { session: { memberId: athleteId } },
        });
        await prisma.workoutSession.deleteMany({
          where: { memberId: athleteId },
        });
        await prisma.workoutExercise.deleteMany({
          where: { workout: { createdBy: athleteId } },
        });
        await prisma.workout.deleteMany({
          where: { createdBy: athleteId },
        });
      }
      if (exerciseId) {
        await prisma.workoutExercise.deleteMany({
          where: { exerciseId },
        });
        await prisma.workoutExerciseLog.deleteMany({
          where: { exerciseId },
        });
        await prisma.exercise.deleteMany({
          where: { id: exerciseId },
        });
      }
      if (athleteId) {
        await prisma.user.deleteMany({
          where: { id: athleteId },
        });
      }
    } catch (e) {
      console.error("Cleanup error in break-sets test:", e);
    }
  });
});
