import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import {
  createWorkoutSchema,
  updateWorkoutSchema,
} from "../validators/workout.validator.js";
import {
  createWorkoutSetSchema,
  updateWorkoutSetSchema,
} from "../validators/workout-set.validator.js";
import workoutService from "../services/workout.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import workoutSetService from "../services/workout-set.service.js";

describe("STREN — Advanced Sets (Drop Sets & Rest-Pause) Test Suite", () => {
  const testRunId = crypto.randomUUID().slice(0, 8);
  let testTrainerId: string;
  let testMemberId: string;
  let testExerciseId: string;

  it("0. Prepares test fixture (Trainer, Member, Exercise)", async () => {
    // 1. Trainer
    const trainer = await prisma.user.create({
      data: {
        email: `adv_trainer_${testRunId}@stren.test`,
        password: "hashedPassword123!",
        name: "Advanced Coach",
        role: Roles.TRAINER,
        isEmailVerified: true,
      },
    });
    testTrainerId = trainer.id;

    // 2. Member
    const member = await prisma.user.create({
      data: {
        email: `adv_member_${testRunId}@stren.test`,
        password: "hashedPassword123!",
        name: "Advanced Athlete",
        role: Roles.MEMBER,
        isEmailVerified: true,
      },
    });
    testMemberId = member.id;

    // 3. Exercise
    const exercise = await prisma.exercise.create({
      data: {
        name: `Barbell Curl ${testRunId}`,
        difficulty: "intermediate",
        primaryMuscles: ["biceps"],
        secondaryMuscles: ["forearms"],
        equipment: ["barbell"],
        description: "Bicep curl for testing advanced sets",
        instructions: ["Curl the weight", "Lower with control"],
        imageUrl: "https://res.cloudinary.com/c3ygdcb9/image/upload/v1793213807/exercise-barbell-curl-v2.png",
      },
    });
    testExerciseId = exercise.id;

    assert.ok(testTrainerId);
    assert.ok(testMemberId);
    assert.ok(testExerciseId);
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Validation Schemas: Advanced Sets & Stages
  // ──────────────────────────────────────────────────────────────────────────
  describe("1. Validation & Schema Contracts", () => {
    it("validates createWorkoutSchema with multi-stage DROP_SET and REST_PAUSE in setsDetail", () => {
      const payload = {
        title: "Advanced Hypertrophy Routine",
        category: "strength",
        difficulty: "intermediate",
        estimatedDuration: 60,
        defaultRestLarge: 90,
        defaultRestSmall: 60,
        tags: ["hypertrophy", "drop-set"],
        isTemplate: true,
        exercises: [
          {
            exercise: testExerciseId,
            sets: 3,
            reps: "8-10",
            targetWeight: 50,
            restSeconds: 90,
            order: 1,
            setsDetail: [
              {
                setNumber: 1,
                setType: "NORMAL",
                targetWeight: 50,
                targetReps: "10",
              },
              {
                setNumber: 2,
                setType: "WARMUP",
                targetWeight: 30,
                targetReps: "12",
              },
              {
                setNumber: 3,
                setType: "DROP_SET",
                targetWeight: 50,
                targetReps: "5",
                stages: [
                  {
                    segmentIndex: 0,
                    stageLabel: "Stage 1 (Initial)",
                    targetWeight: 50,
                    targetReps: "5",
                  },
                  {
                    segmentIndex: 1,
                    stageLabel: "Stage 2 (Drop 1)",
                    targetWeight: 40,
                    targetReps: "5",
                  },
                  {
                    segmentIndex: 2,
                    stageLabel: "Stage 3 (Drop 2)",
                    targetWeight: 30,
                    targetReps: "6",
                  },
                ],
              },
            ],
          },
        ],
      };

      const result = createWorkoutSchema.safeParse({ body: payload });
      assert.equal(result.success, true);
    });

    it("validates createWorkoutSetSchema for individual stages with segmentIndex and markers", () => {
      const dummyId = crypto.randomUUID();
      const validStage = {
        body: {
          exerciseLog: dummyId,
          setNumber: 3,
          segmentIndex: 1,
          setType: "DROP_SET",
          isIntermediateSegment: true,
          isFinalSegment: false,
          targetReps: "5",
          weight: 40,
          actualReps: 5,
        },
      };

      const result = createWorkoutSetSchema.safeParse(validStage);
      assert.equal(result.success, true);
    });

    it("validates updateWorkoutSetSchema with segmentIndex and markers", () => {
      const validUpdate = {
        body: {
          weight: 45,
          actualReps: 6,
          completed: true,
          segmentIndex: 2,
          isIntermediateSegment: false,
          isFinalSegment: true,
          setType: "DROP_SET",
        },
      };

      const result = updateWorkoutSetSchema.safeParse(validUpdate);
      assert.equal(result.success, true);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Workout Creation & Duplication with Advanced Set Detail
  // ──────────────────────────────────────────────────────────────────────────
  describe("2. Workout Builder Persistence & Duplication", () => {
    let createdWorkoutId: string;

    it("persists setsDetail in WorkoutExercise and returns it correctly", async () => {
      const workoutData = {
        title: `Drop Set Routine ${testRunId}`,
        category: "strength" as const,
        difficulty: "advanced" as const,
        estimatedDuration: 65,
        tags: ["dropset"],
        isTemplate: true,
        exercises: [
          {
            exercise: testExerciseId,
            sets: 2,
            reps: "8-10",
            targetWeight: 60,
            restSeconds: 90,
            order: 1,
            setsDetail: [
              {
                setNumber: 1,
                setType: "NORMAL" as const,
                targetWeight: 60,
                targetReps: "8",
              },
              {
                setNumber: 2,
                setType: "DROP_SET" as const,
                targetWeight: 60,
                targetReps: "6",
                stages: [
                  {
                    segmentIndex: 0,
                    stageLabel: "Stage 1",
                    targetWeight: 60,
                    targetReps: "6",
                  },
                  {
                    segmentIndex: 1,
                    stageLabel: "Stage 2",
                    targetWeight: 50,
                    targetReps: "6",
                  },
                  {
                    segmentIndex: 2,
                    stageLabel: "Stage 3",
                    targetWeight: 40,
                    targetReps: "8",
                  },
                ],
              },
            ],
          },
        ],
      };

      const created = await workoutService.create(workoutData, testTrainerId);
      createdWorkoutId = created.id;
      assert.ok(created.id);

      const retrieved = await workoutService.getById(createdWorkoutId);
      const ex1 = retrieved.exercises[0];
      assert.ok(ex1);
      assert.ok(Array.isArray((ex1 as any).setsDetail));
      assert.equal((ex1 as any).setsDetail.length, 2);
      assert.equal((ex1 as any).setsDetail[1].setType, "DROP_SET");
      assert.equal((ex1 as any).setsDetail[1].stages.length, 3);
      assert.equal((ex1 as any).setsDetail[1].stages[2].targetWeight, 40);
    });

    it("duplicates workout with full preservation of setsDetail", async () => {
      const duplicated = await workoutService.duplicate(
        createdWorkoutId,
        testTrainerId,
      );
      assert.ok(duplicated.id);

      const dupRetrieved = await workoutService.getById(duplicated.id);
      const dupEx = dupRetrieved.exercises[0];
      assert.ok(Array.isArray((dupEx as any).setsDetail));
      assert.equal((dupEx as any).setsDetail[1].setType, "DROP_SET");
      assert.equal((dupEx as any).setsDetail[1].stages.length, 3);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Active Workout Session: Unpacking Stages into WorkoutSetLog
  // ──────────────────────────────────────────────────────────────────────────
  describe("3. Session Unpacking & Stage Row Generation", () => {
    let sessionId: string;
    let exerciseLogId: string;

    it("creates session and unpacks normal set and drop set stages into WorkoutSetLog rows", async () => {
      // Create a workout with:
      // Set 1: NORMAL (1 row)
      // Set 2: DROP_SET with 3 stages (3 rows: segmentIndex 0, 1, 2)
      const workout = await workoutService.create(
        {
          title: `Session Advanced Test ${testRunId}`,
          category: "strength" as const,
          difficulty: "intermediate" as const,
          estimatedDuration: 45,
          tags: ["test"],
          isTemplate: false,
          exercises: [
            {
              exercise: testExerciseId,
              sets: 2,
              reps: "10",
              targetWeight: 50,
              restSeconds: 90,
              order: 1,
              setsDetail: [
                {
                  setNumber: 1,
                  setType: "NORMAL",
                  targetWeight: 50,
                  targetReps: "10",
                },
                {
                  setNumber: 2,
                  setType: "DROP_SET",
                  targetWeight: 50,
                  targetReps: "5",
                  stages: [
                    {
                      segmentIndex: 0,
                      stageLabel: "Stage 1 (Initial)",
                      targetWeight: 50,
                      targetReps: "5",
                    },
                    {
                      segmentIndex: 1,
                      stageLabel: "Stage 2 (Drop 1)",
                      targetWeight: 40,
                      targetReps: "5",
                    },
                    {
                      segmentIndex: 2,
                      stageLabel: "Stage 3 (Drop 2)",
                      targetWeight: 30,
                      targetReps: "6",
                    },
                  ],
                },
              ],
            },
          ],
        },
        testMemberId, // Member creates their own workout
      );

      const session = await workoutSessionService.start(
        testMemberId,
        undefined,
        workout.id,
      );
      sessionId = session.id;

      const current = await workoutSessionService.getCurrent(testMemberId);
      assert.ok(current);
      assert.equal(current.exerciseLogs.length, 1);

      const exLog = current.exerciseLogs[0];
      exerciseLogId = exLog.id;

      // Exercise has 2 parent sets, but 4 WorkoutSetLog rows (1 normal + 3 drop stages)
      assert.equal(exLog.sets.length, 4);

      // Verify Set 1 (Normal)
      const set1 = exLog.sets[0];
      assert.equal(set1.setNumber, 1);
      assert.equal(set1.segmentIndex, 0);
      assert.equal(set1.setType, "NORMAL");
      assert.equal(set1.isIntermediateSegment, false);
      assert.equal(set1.isFinalSegment, true);
      assert.equal(set1.weight, 50);

      // Verify Set 2 Stage 1 (Initial)
      const s2Stage1 = exLog.sets[1];
      assert.equal(s2Stage1.setNumber, 2);
      assert.equal(s2Stage1.segmentIndex, 0);
      assert.equal(s2Stage1.setType, "DROP_SET");
      assert.equal(s2Stage1.isIntermediateSegment, true);
      assert.equal(s2Stage1.isFinalSegment, false);
      assert.equal(s2Stage1.weight, 50);

      // Verify Set 2 Stage 2 (Drop 1)
      const s2Stage2 = exLog.sets[2];
      assert.equal(s2Stage2.setNumber, 2);
      assert.equal(s2Stage2.segmentIndex, 1);
      assert.equal(s2Stage2.setType, "DROP_SET");
      assert.equal(s2Stage2.isIntermediateSegment, true);
      assert.equal(s2Stage2.isFinalSegment, false);
      assert.equal(s2Stage2.weight, 40);

      // Verify Set 2 Stage 3 (Final Drop)
      const s2Stage3 = exLog.sets[3];
      assert.equal(s2Stage3.setNumber, 2);
      assert.equal(s2Stage3.segmentIndex, 2);
      assert.equal(s2Stage3.setType, "DROP_SET");
      assert.equal(s2Stage3.isIntermediateSegment, false);
      assert.equal(s2Stage3.isFinalSegment, true);
      assert.equal(s2Stage3.weight, 30);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 4. Set Completion, Parent Set Rules, Volume, and Rest Timer Contract
    // ────────────────────────────────────────────────────────────────────────
    it("intermediate stages do NOT mark parent set or exercise complete; only final stage completes set", async () => {
      const current = await workoutSessionService.getCurrent(testMemberId);
      const exLog = current!.exerciseLogs[0];
      const [set1, s2Stage1, s2Stage2, s2Stage3] = exLog.sets;

      // 1. Complete Set 1
      await workoutSetService.update(set1.id, testMemberId, {
        actualReps: 10,
        weight: 50,
        completed: true,
      });

      let check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      // TargetSets is 2; 1 set completed out of 2 -> completed should be false
      assert.equal(check?.completed, false);

      // 2. Complete Set 2, Stage 1 (Intermediate)
      // Rest timer rule: isIntermediateSegment: true -> Frontend NEVER starts rest timer!
      assert.equal(s2Stage1.isIntermediateSegment, true);
      assert.equal(s2Stage1.isFinalSegment, false);

      await workoutSetService.update(s2Stage1.id, testMemberId, {
        actualReps: 5,
        weight: 50,
        completed: true,
      });

      check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      // Parent Set 2 is NOT complete because Stage 2 and Stage 3 are incomplete!
      assert.equal(check?.completed, false);

      // 3. Complete Set 2, Stage 2 (Intermediate)
      assert.equal(s2Stage2.isIntermediateSegment, true);
      await workoutSetService.update(s2Stage2.id, testMemberId, {
        actualReps: 5,
        weight: 40,
        completed: true,
      });

      check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      // Still not complete
      assert.equal(check?.completed, false);

      // 4. Complete Set 2, Stage 3 (Final Segment)
      // Rest timer rule: isFinalSegment: true && !isIntermediateSegment -> Frontend starts rest timer!
      assert.equal(s2Stage3.isFinalSegment, true);
      assert.equal(s2Stage3.isIntermediateSegment, false);

      await workoutSetService.update(s2Stage3.id, testMemberId, {
        actualReps: 6,
        weight: 30,
        completed: true,
      });

      check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      // All stages of Set 1 and Set 2 are completed -> exercise is COMPLETED!
      assert.equal(check?.completed, true);
    });

    it("calculates session totalVolume and setsCompleted correctly without double-counting parent sets", async () => {
      const session = await prisma.workoutSession.findUnique({
        where: { id: sessionId },
      });

      // Volume calculation:
      // Set 1: 50 kg × 10 reps = 500 kg
      // Set 2 Stage 1: 50 kg × 5 reps = 250 kg
      // Set 2 Stage 2: 40 kg × 5 reps = 200 kg
      // Set 2 Stage 3: 30 kg × 6 reps = 180 kg
      // Total volume = 500 + 250 + 200 + 180 = 1130 kg!
      assert.equal(session?.totalVolume, 1130);

      // setsCompleted: 2 parent sets completed (not 4 inflated stage rows)
      assert.equal(session?.setsCompleted, 2);
      assert.equal(session?.exercisesCompleted, 1);
      assert.equal(session?.progress, 100);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 5. In-Session Dynamic Stage Addition & Deletion
    // ────────────────────────────────────────────────────────────────────────
    it("supports adding an extra drop stage on the fly during active session and deleting it safely", async () => {
      // Athlete adds Stage 4 (segmentIndex: 3) to Set 2
      const newStage = await workoutSetService.create(
        {
          exerciseLog: exerciseLogId,
          setNumber: 2,
          segmentIndex: 3,
          setType: "DROP_SET",
          isIntermediateSegment: false,
          isFinalSegment: true,
          targetReps: "8",
          weight: 20,
          actualReps: 0,
          completed: false,
        },
        testMemberId,
      );

      assert.ok(newStage.id);
      assert.equal(newStage.segmentIndex, 3);
      assert.equal(newStage.isFinalSegment, true);

      // Because Set 2 now has an incomplete stage 4, the exercise completion status drops to false!
      let check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      assert.equal(check?.completed, false);

      // Athlete deletes the newly added stage
      const delResult = await workoutSetService.delete(
        newStage.id,
        testMemberId,
      );
      assert.equal(delResult.message, "Set deleted successfully");

      // Set 2 Stage 3 is promoted back to isFinalSegment = true, and exercise becomes completed again!
      const stage3 = await prisma.workoutSetLog.findFirst({
        where: { exerciseLogId, setNumber: 2, segmentIndex: 2 },
      });
      assert.equal(stage3?.isFinalSegment, true);

      check = await prisma.workoutExerciseLog.findUnique({
        where: { id: exerciseLogId },
      });
      assert.equal(check?.completed, true);
    });

    // ────────────────────────────────────────────────────────────────────────
    // 6. Session Refresh & Order Restoration
    // ────────────────────────────────────────────────────────────────────────
    it("restores all stages in strict [setNumber, segmentIndex] order with weights and completion intact upon session reload", async () => {
      const reloaded = await workoutSessionService.getCurrent(testMemberId);
      assert.ok(reloaded);

      const sets = reloaded.exerciseLogs[0].sets;
      assert.equal(sets.length, 4);

      // Verify strict ascending order
      for (let i = 0; i < sets.length - 1; i++) {
        const a = sets[i];
        const b = sets[i + 1];
        if (a.setNumber === b.setNumber) {
          assert.ok((a.segmentIndex ?? 0) <= (b.segmentIndex ?? 0));
        } else {
          assert.ok(a.setNumber < b.setNumber);
        }
      }

      // Verify all completed states restored
      assert.ok(sets.every((s: any) => s.completed === true));
    });

    it("finishes session cleanly", async () => {
      const finished = await workoutSessionService.finish(
        sessionId,
        testMemberId,
        { notes: "Great drop set session" },
      );
      assert.equal(finished.status, WORKOUT_SESSION_STATUS.COMPLETED);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 7. Backward Compatibility: Standard Workouts without setsDetail
  // ──────────────────────────────────────────────────────────────────────────
  describe("7. Backward Compatibility with Standard Workouts", () => {
    it("standard workouts without setsDetail generate normal sets with default segment markers seamlessly", async () => {
      const legacyWorkout = await workoutService.create(
        {
          title: `Legacy Standard Workout ${testRunId}`,
          category: "strength",
          difficulty: "beginner",
          estimatedDuration: 30,
          tags: ["standard"],
          isTemplate: false,
          exercises: [
            {
              exercise: testExerciseId,
              sets: 3,
              reps: "10",
              targetWeight: 40,
              restSeconds: 60,
              order: 1,
            },
          ],
        },
        testMemberId,
      );

      const session = await workoutSessionService.start(
        testMemberId,
        undefined,
        legacyWorkout.id,
      );

      const current = await workoutSessionService.getCurrent(testMemberId);
      const sets = current!.exerciseLogs[0].sets;

      assert.equal(sets.length, 3);
      for (let i = 0; i < 3; i++) {
        assert.equal(sets[i].setNumber, i + 1);
        assert.equal(sets[i].segmentIndex, 0);
        assert.equal(sets[i].setType, "NORMAL");
        assert.equal(sets[i].isIntermediateSegment, false);
        assert.equal(sets[i].isFinalSegment, true);
      }

      // Cleanup
      await workoutSessionService.finish(session.id, testMemberId, {});
    });
  });
});
