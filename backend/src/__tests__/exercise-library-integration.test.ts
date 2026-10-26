import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import prisma from "../config/prisma.js";
import exerciseService from "../services/exercise.service.js";
import workoutService from "../services/workout.service.js";
import workoutSessionService from "../services/workout-session.service.js";
import { syncExerciseImages } from "../scripts/sync-exercise-images.js";
import { Roles } from "../constants/roles.js";

describe("STREN — Exercise Library Data Integration, Image Mapping & Session Flow", () => {
  it("1. Database has all 49 exercises mapped to verified image URLs and physical assets", async () => {
    const exercises = await prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    assert.ok(
      exercises.length >= 49,
      `Expected at least 49 exercises in DB, found ${exercises.length}`,
    );

    const uploadsDir = path.resolve(process.cwd(), "uploads/exercises");
    for (const ex of exercises) {
      assert.ok(
        ex.imageUrl && ex.imageUrl.trim().length > 0,
        `Exercise "${ex.name}" (${ex.id}) should have a non-empty imageUrl`,
      );
      assert.ok(
        !ex.imageUrl.includes("653a1cd9-64ed-4b64-b2c2-e00e1fe641fa.png"),
        `Exercise "${ex.name}" must not point to the mismatched test banner`,
      );

      // Verify local uploaded file exists on disk
      const filename = ex.imageUrl.split("/uploads/exercises/")[1];
      if (filename) {
        const filePath = path.join(uploadsDir, filename);
        assert.ok(
          fs.existsSync(filePath),
          `Physical asset file must exist at ${filePath} for "${ex.name}"`,
        );
      }
    }
  });

  it("2. syncExerciseImages() is idempotent and preserves all verified URLs on repeat runs", async () => {
    const summary = await syncExerciseImages();

    assert.equal(summary.unmatchedCount, 0);
    assert.equal(summary.replacedMismatchedCount, 0);
    assert.ok(
      summary.preservedCount >= 49,
      `Expected all 49 exercises to be preserved on repeat sync, got ${summary.preservedCount}`,
    );
  });

  it("3. ExerciseService getAll and getById return mapped imageUrl", async () => {
    const { exercises, totalResults } = await exerciseService.getAll(
      { page: "1", limit: "100" },
      undefined,
      Roles.ADMIN,
    );

    assert.ok(totalResults >= 49);
    assert.equal(exercises.length, totalResults);

    for (const ex of exercises) {
      assert.ok(
        typeof ex.imageUrl === "string" && ex.imageUrl.length > 0,
        `Mapped exercise "${ex.name}" must include imageUrl`,
      );
    }

    const first = exercises[0];
    const detail = await exerciseService.getById(
      first.id,
      undefined,
      Roles.ADMIN,
    );
    assert.equal(detail.imageUrl, first.imageUrl);
  });

  it("4. WorkoutService includes nested exercise.imageUrl and top-level workout.imageUrl", async () => {
    const adminUser = await prisma.user.findFirst({
      where: { role: Roles.ADMIN },
    });
    const userId = adminUser?.id || "";

    const workouts = await workoutService.getAll({}, userId, Roles.ADMIN);
    assert.ok(workouts.length > 0, "Expected seeded workouts in database");

    const workoutSummary = workouts.find(
      (w: any) => typeof w.exerciseCount === "number" && w.exerciseCount > 0,
    );
    assert.ok(workoutSummary, "Expected a workout summary with exercises");
    assert.ok(
      workoutSummary.imageUrl,
      "Workout summary should resolve imageUrl from its first exercise",
    );

    const workoutDetail = await workoutService.getById(
      workoutSummary.id,
      userId,
      Roles.ADMIN,
    );
    assert.ok(
      workoutDetail.exercises.length > 0,
      "Workout detail should include exercises",
    );

    for (const item of workoutDetail.exercises) {
      assert.ok(
        item.exercise?.imageUrl,
        `Nested workout exercise "${item.exercise?.name}" must include imageUrl`,
      );
    }
  });

  it("5. WorkoutSessionService getCurrent and getById include exercise.imageUrl on exerciseLogs and session.workout", async () => {
    const activeSessionRecord = await prisma.workoutSession.findFirst({
      where: { status: "IN_PROGRESS", isActive: true },
    });

    if (activeSessionRecord) {
      const current = await workoutSessionService.getCurrent(
        activeSessionRecord.memberId,
      );
      assert.ok(current, "Expected active workout session for member");
      assert.ok(
        current.session.workout?.imageUrl ||
          current.session.assignment?.workout?.imageUrl,
        "Active session workout summary should include imageUrl",
      );
      assert.ok(current.exerciseLogs.length > 0);
      for (const log of current.exerciseLogs) {
        assert.ok(
          log.exercise?.imageUrl,
          `Active session exerciseLog "${log.exerciseName}" must include exercise.imageUrl`,
        );
      }
    }

    const completedSessionRecord = await prisma.workoutSession.findFirst({
      where: { status: "COMPLETED", isActive: true },
    });
    assert.ok(completedSessionRecord, "Expected completed workout session");

    const details = await workoutSessionService.getById(
      completedSessionRecord.id,
      completedSessionRecord.memberId,
      Roles.MEMBER,
    );
    assert.ok(details.exerciseLogs.length > 0);
    for (const log of details.exerciseLogs) {
      assert.ok(
        log.exercise?.imageUrl,
        `Completed session exerciseLog "${log.exerciseName}" must include exercise.imageUrl`,
      );
    }
  });
});
