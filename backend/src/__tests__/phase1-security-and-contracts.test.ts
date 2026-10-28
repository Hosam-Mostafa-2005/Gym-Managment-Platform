import { describe, it } from "node:test";
import assert from "node:assert/strict";
import jwt from "jsonwebtoken";

process.env.JWT_SECRET = process.env.JWT_SECRET || "phase1-test-secret";
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

import { registerSchema } from "../validators/auth.validator.js";
import { updateAssignmentSchema } from "../validators/assignment.validator.js";
import {
  createExerciseSchema,
  updateExerciseSchema,
} from "../validators/exercise.validator.js";
import { Roles } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { Difficulty, Equipment } from "../constants/exercise.js";
import { protect, restrictTo } from "../middleware/auth.middleware.js";
import ApiFeatures, { escapeRegex } from "../utils/ApiFeatures.js";
import mapWorkoutSession from "../mappers/workout-session.mapper.js";
import mapAssignment from "../mappers/assignment.mapper.js";
import { mapBodyMeasurement } from "../mappers/body-measurement.mapper.js";
import mapExercise from "../mappers/exercise.mapper.js";
import prisma from "../config/prisma.js";
import authService from "../services/auth.service.js";
import workoutService from "../services/workout.service.js";
import exerciseService from "../services/exercise.service.js";
import storageService from "../services/storage.service.js";
import {
  validateImageBuffer,
  MAX_IMAGE_SIZE_BYTES,
} from "../utils/imageValidator.js";

describe("STREN Phase 1 — Security & Data Contract Stabilization", () => {
  describe("1. P0 — Registration privilege escalation", () => {
    it("rejects admin and trainer roles in public registerSchema", () => {
      const adminAttempt = registerSchema.safeParse({
        body: {
          name: "Attacker Admin",
          email: "attacker@example.com",
          password: "password123",
          role: Roles.ADMIN,
        },
      });
      assert.equal(adminAttempt.success, false);

      const trainerAttempt = registerSchema.safeParse({
        body: {
          name: "Attacker Trainer",
          email: "trainer@example.com",
          password: "password123",
          role: Roles.TRAINER,
        },
      });
      assert.equal(trainerAttempt.success, false);
    });

    it("accepts member registration with omitted role or explicit member role", () => {
      const omittedRole = registerSchema.safeParse({
        body: {
          name: "Legit Member",
          email: "member@example.com",
          password: "password123",
        },
      });
      assert.equal(omittedRole.success, true);

      const explicitMember = registerSchema.safeParse({
        body: {
          name: "Legit Member",
          email: "member@example.com",
          password: "password123",
          role: Roles.MEMBER,
        },
      });
      assert.equal(explicitMember.success, true);
    });

    it("enforces member role in authService.register and strips privileged fields", async () => {
      await assert.rejects(
        async () => {
          await authService.register({
            name: "Escalation Attempt",
            email: "escalate@example.com",
            password: "password123",
            role: Roles.ADMIN,
          });
        },
        (err: any) => err.statusCode === 403,
      );

      let createdPayload: any = null;
      const origFindUnique = prisma.user.findUnique;
      const origCreate = prisma.user.create;

      (prisma.user as any).findUnique = async () => null;
      (prisma.user as any).create = async (args: any) => {
        createdPayload = args.data;
        return {
          id: "507f1f77bcf86cd799439011",
          name: args.data.name,
          email: args.data.email,
          role: args.data.role,
          isActive: true,
        };
      };

      try {
        await authService.register({
          name: "Safe Member",
          email: "safe@example.com",
          password: "password123",
          ...({ isActive: false, hourlyRate: 999 } as any),
        });

        assert.deepEqual(Object.keys(createdPayload).sort(), [
          "email",
          "emailVerifiedAt",
          "isEmailVerified",
          "name",
          "onboardingCompleted",
          "onboardingStep",
          "password",
          "role",
        ]);
        assert.equal(createdPayload.role, Roles.MEMBER);
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
        (prisma.user as any).create = origCreate;
      }
    });
  });

  describe("2. P0 — Unauthorized user listing", () => {
    it("restrictTo(ADMIN, TRAINER) blocks member role with 403 and allows trainer/admin", () => {
      const middleware = restrictTo(Roles.ADMIN, Roles.TRAINER);

      let memberErr: any = null;
      middleware(
        { user: { role: Roles.MEMBER } } as any,
        {} as any,
        (err?: any) => {
          memberErr = err;
        },
      );
      assert.ok(memberErr);
      assert.equal(memberErr.statusCode, 403);

      let nextCalled = false;
      middleware(
        { user: { role: Roles.TRAINER } } as any,
        {} as any,
        (err?: any) => {
          if (!err) nextCalled = true;
        },
      );
      assert.equal(nextCalled, true);
    });
  });

  describe("3. P0 — Inactive accounts", () => {
    it("protect middleware rejects authenticated users with isActive === false", async () => {
      const validToken = jwt.sign(
        { id: "507f1f77bcf86cd799439012" },
        process.env.JWT_SECRET!,
      );

      const origFindUnique = prisma.user.findUnique;
      (prisma.user as any).findUnique = async () => ({
        id: "507f1f77bcf86cd799439012",
        role: Roles.MEMBER,
        isActive: false,
      });

      try {
        const forwardedError = await new Promise<any>((resolve) => {
          protect(
            {
              headers: { authorization: `Bearer ${validToken}` },
              cookies: {},
            } as any,
            {} as any,
            (err?: any) => {
              resolve(err);
            },
          );
        });

        assert.ok(forwardedError);
        assert.equal(forwardedError.statusCode, 401);
        assert.match(forwardedError.message, /deactivated/i);
      } finally {
        (prisma.user as any).findUnique = origFindUnique;
      }
    });
  });

  describe("4. P1 — Security filters cannot be overridden by query parameters", () => {
    it("ApiFeatures.filter preserves baseFilter and blocks protected keys", () => {
      let appliedFilter: Record<string, any> = {};
      const fakeQuery: any = {
        getFilter: () => ({
          isActive: true,
          createdBy: "trainer-1",
          trainer: "trainer-1",
        }),
        find(filterObj: Record<string, any>) {
          appliedFilter = filterObj;
          return this;
        },
      };

      const features = new ApiFeatures(fakeQuery, {
        isActive: "false",
        createdBy: "trainer-2",
        trainer: "trainer-2",
        difficulty: "beginner",
        $where: "malicious",
      });

      features.filter(["difficulty"]);

      assert.equal(appliedFilter.isActive, true);
      assert.equal(appliedFilter.createdBy, "trainer-1");
      assert.equal(appliedFilter.trainer, "trainer-1");
      assert.equal(appliedFilter.difficulty, "beginner");
      assert.equal(appliedFilter.$where, undefined);
    });

    it("escapeRegex escapes regex metacharacters in search queries", () => {
      const raw = "bench.*(press)+?[a-z]$^";
      const escaped = escapeRegex(raw);
      const regex = new RegExp(escaped, "i");
      assert.equal(regex.test("bench.*(press)+?[a-z]$^"), true);
      assert.equal(regex.test("bench press"), false);
    });
  });

  describe("5. P1 — Workout ownership", () => {
    it("rejects trainer accessing another trainer's private workout in getById, update, and delete", async () => {
      const fakeWorkout: any = {
        id: "507f1f77bcf86cd799439099",
        title: "Private Hypertrophy",
        createdById: "owner-trainer-id",
        isTemplate: false,
        isActive: true,
        exercises: [],
      };

      const origFindFirst = prisma.workout.findFirst;
      (prisma.workout as any).findFirst = async () => fakeWorkout;

      try {
        await assert.rejects(
          async () => {
            await workoutService.getById(
              "507f1f77bcf86cd799439099",
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );

        await assert.rejects(
          async () => {
            await workoutService.update(
              "507f1f77bcf86cd799439099",
              { title: "Hijacked" },
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );

        await assert.rejects(
          async () => {
            await workoutService.delete(
              "507f1f77bcf86cd799439099",
              "other-trainer-id",
              Roles.TRAINER,
            );
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        (prisma.workout as any).findFirst = origFindFirst;
      }
    });

    it("rejects member accessing an unassigned private workout in getById", async () => {
      const fakeWorkout: any = {
        id: "507f1f77bcf86cd799439099",
        title: "Private Hypertrophy",
        createdById: "owner-trainer-id",
        isTemplate: false,
        isActive: true,
        exercises: [],
      };

      const origFindFirstWorkout = prisma.workout.findFirst;
      const origFindFirstAssignment = prisma.assignment.findFirst;

      (prisma.workout as any).findFirst = async () => fakeWorkout;
      (prisma.assignment as any).findFirst = async () => null;

      try {
        await assert.rejects(
          async () => {
            await workoutService.getById(
              "507f1f77bcf86cd799439099",
              "unassigned-member-id",
              Roles.MEMBER,
            );
          },
          (err: any) => err.statusCode === 403,
        );
      } finally {
        (prisma.workout as any).findFirst = origFindFirstWorkout;
        (prisma.assignment as any).findFirst = origFindFirstAssignment;
      }
    });
  });

  describe("6. Data-Contract — Assignment detail/edit mapping", () => {
    it("maps populated assignment with id and workout details without corrupting nested IDs", () => {
      const rawAssignment = {
        _id: "assign-1",
        member: { _id: "member-1", name: "Member One", email: "m1@example.com" },
        trainer: { _id: "trainer-1", name: "Trainer One", email: "t1@example.com" },
        workout: {
          _id: "workout-1",
          title: "Upper Body Power",
          description: "Heavy compound lifts",
          category: "strength",
          difficulty: "intermediate",
          estimatedDuration: 60,
          exercises: [],
        },
        startDate: new Date("2026-01-01T00:00:00.000Z"),
        endDate: new Date("2026-02-01T00:00:00.000Z"),
        status: ASSIGNMENT_STATUS.CANCELLED,
        cancelledAt: new Date("2026-01-15T00:00:00.000Z"),
        cancelReason: "Member injured shoulder",
        notes: "Focus on form",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-15T00:00:00.000Z"),
      };

      const mapped = mapAssignment(rawAssignment);
      assert.equal(mapped.id, "assign-1");
      assert.ok(mapped.member);
      assert.ok(mapped.trainer);
      assert.ok(mapped.workout);
      assert.equal(typeof mapped.member.id, "string");
      assert.equal(mapped.member.id, "member-1");
      assert.equal(typeof mapped.trainer.id, "string");
      assert.equal(mapped.trainer.id, "trainer-1");
      assert.equal(typeof mapped.workout.id, "string");
      assert.equal(mapped.workout.id, "workout-1");
      assert.equal(mapped.workout.description, "Heavy compound lifts");
      assert.equal(mapped.workout.estimatedDuration, 60);
      assert.equal(mapped.cancelReason, "Member injured shoulder");
    });

    it("maps populated BodyMeasurement trainer to string ID without object serialization corruption", () => {
      const doc: any = {
        _id: { toString: () => "meas-1" },
        member: { _id: { toString: () => "member-1" } },
        trainer: { _id: { toString: () => "trainer-1" }, name: "Coach Alex" },
        weight: 80,
        height: 180,
        bodyFat: 14,
        circumferences: {},
        measuredAt: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mapped = mapBodyMeasurement(doc);
      assert.equal(mapped.member, "member-1");
      assert.equal(mapped.trainer, "trainer-1");
      assert.equal(mapped.trainerName, "Coach Alex");
    });
  });

  describe("7. Data-Contract — Assignment cancellation validation", () => {
    it("requires cancelReason when status is CANCELLED and rejects cancelReason for non-cancelled status", () => {
      const missingReason = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.CANCELLED,
        },
      });
      assert.equal(missingReason.success, false);

      const validCancellation = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.CANCELLED,
          cancelReason: "Schedule change requested by member",
        },
      });
      assert.equal(validCancellation.success, true);
      if (validCancellation.success) {
        assert.equal(
          validCancellation.data.body.cancelReason,
          "Schedule change requested by member",
        );
      }

      const reasonWithActiveStatus = updateAssignmentSchema.safeParse({
        params: { id: "507f1f77bcf86cd799439011" },
        body: {
          status: ASSIGNMENT_STATUS.ACTIVE,
          cancelReason: "Should not be allowed",
        },
      });
      assert.equal(reasonWithActiveStatus.success, false);
    });
  });

  describe("8. Data-Contract — Workout session telemetry preservation", () => {
    it("preserves progress, rest/active time, volume, completed counts, and notes in mapWorkoutSession", () => {
      const rawSession = {
        _id: "session-1",
        assignment: { _id: "assign-1" },
        status: "COMPLETED",
        startedAt: new Date("2026-03-01T10:00:00Z"),
        endedAt: new Date("2026-03-01T10:45:00Z"),
        duration: 45,
        progress: 100,
        totalRestTime: 600,
        activeTrainingTime: 2100,
        totalVolume: 4850,
        exercisesCompleted: 5,
        setsCompleted: 18,
        notes: "Strong session, hit PR on bench",
      };

      const mapped = mapWorkoutSession(rawSession);
      assert.equal(mapped.id, "session-1");
      assert.equal(mapped.duration, 45);
      assert.equal(mapped.progress, 100);
      assert.equal(mapped.totalRestTime, 600);
      assert.equal(mapped.activeTrainingTime, 2100);
      assert.equal(mapped.totalVolume, 4850);
      assert.equal(mapped.exercisesCompleted, 5);
      assert.equal(mapped.setsCompleted, 18);
      assert.equal(mapped.notes, "Strong session, hit PR on bench");
    });
  });

  describe("9. Data-Contract — Exercise PATCH preserves omitted secondaryMuscles", () => {
    it("does not inject secondaryMuscles: [] when omitted in updateExerciseSchema", () => {
      const createParsed = createExerciseSchema.parse({
        body: {
          name: "Barbell Bench Press",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Chest"],
          instructions: ["Lower bar to chest", "Press up"],
        },
      });
      assert.deepEqual(createParsed.body.secondaryMuscles, []);

      const patchParsed = updateExerciseSchema.parse({
        body: {
          name: "Incline Barbell Bench Press",
        },
      });
      assert.equal(patchParsed.body.secondaryMuscles, undefined);
      assert.equal(
        Object.prototype.hasOwnProperty.call(
          patchParsed.body,
          "secondaryMuscles",
        ) && patchParsed.body.secondaryMuscles !== undefined,
        false,
      );
    });
  });

  describe("10. Data-Contract — Optional Exercise Image Support", () => {
    it("validates that imageUrl is optional and accepts valid URL, empty string, or null", () => {
      const withUrl = createExerciseSchema.safeParse({
        body: {
          name: "Barbell Squat",
          imageUrl: "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Quadriceps"],
          instructions: ["Squat deep and stand"],
        },
      });
      assert.equal(withUrl.success, true);
      if (withUrl.success) {
        assert.equal(
          withUrl.data.body.imageUrl,
          "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
        );
      }

      const withEmptyString = createExerciseSchema.safeParse({
        body: {
          name: "Barbell Squat",
          imageUrl: "",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Quadriceps"],
          instructions: ["Squat deep and stand"],
        },
      });
      assert.equal(withEmptyString.success, true);

      const withNull = createExerciseSchema.safeParse({
        body: {
          name: "Barbell Squat",
          imageUrl: null,
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Quadriceps"],
          instructions: ["Squat deep and stand"],
        },
      });
      assert.equal(withNull.success, true);

      const omitted = createExerciseSchema.safeParse({
        body: {
          name: "Barbell Squat",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Quadriceps"],
          instructions: ["Squat deep and stand"],
        },
      });
      assert.equal(omitted.success, true);

      const invalidUrl = createExerciseSchema.safeParse({
        body: {
          name: "Barbell Squat",
          imageUrl: "invalid-url-format",
          equipment: [Equipment.BARBELL],
          difficulty: Difficulty.INTERMEDIATE,
          primaryMuscles: ["Quadriceps"],
          instructions: ["Squat deep and stand"],
        },
      });
      assert.equal(invalidUrl.success, false);
    });

    it("maps exercise entity to include imageUrl or null when absent", () => {
      const mappedWithImage = mapExercise({
        id: "ex-1",
        name: "Deadlift",
        description: "Pull from floor",
        imageUrl: "https://example.com/deadlift.jpg",
        equipment: ["Barbell"],
        difficulty: "advanced",
        primaryMuscles: ["Back"],
        secondaryMuscles: ["Hamstrings"],
        instructions: ["Pull bar up"],
        tips: [],
      });
      assert.equal(mappedWithImage.imageUrl, "https://example.com/deadlift.jpg");

      const mappedWithoutImage = mapExercise({
        id: "ex-2",
        name: "Pullup",
        description: "Bodyweight pull",
        equipment: ["Bodyweight"],
        difficulty: "intermediate",
        primaryMuscles: ["Lats"],
        secondaryMuscles: ["Biceps"],
        instructions: ["Pull chin over bar"],
        tips: [],
      });
      assert.equal(mappedWithoutImage.imageUrl, null);
    });

    it("validates image magic bytes, MIME types, and 5 MB size limits", () => {
      // Valid PNG signature: 89 50 4E 47 0D 0A 1A 0A + padding
      const pngBuffer = Buffer.from([
        0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      ]);
      const validPng = validateImageBuffer(pngBuffer, "image/png");
      assert.equal(validPng.mimeType, "image/png");
      assert.equal(validPng.extension, "png");

      // Valid JPEG signature: FF D8 FF + padding
      const jpgBuffer = Buffer.from([
        0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
      ]);
      const validJpg = validateImageBuffer(jpgBuffer, "image/jpg");
      assert.equal(validJpg.mimeType, "image/jpeg");
      assert.equal(validJpg.extension, "jpg");

      // Valid WEBP signature: "RIFF" + 4 bytes + "WEBP"
      const webpBuffer = Buffer.from("RIFF\x00\x00\x00\x00WEBP", "ascii");
      const validWebp = validateImageBuffer(webpBuffer, "image/webp");
      assert.equal(validWebp.mimeType, "image/webp");
      assert.equal(validWebp.extension, "webp");

      // Spoofed content (text/SVG pretending to be PNG)
      const spoofedBuffer = Buffer.from("<svg><script>alert(1)</script></svg>");
      assert.throws(
        () => validateImageBuffer(spoofedBuffer, "image/png"),
        /Invalid or corrupted image file content/i,
      );

      // Mismatched MIME type (PNG bytes declared as image/webp)
      assert.throws(
        () => validateImageBuffer(pngBuffer, "image/webp"),
        /does not match declared image MIME type/i,
      );

      // Unsupported MIME type
      assert.throws(
        () => validateImageBuffer(pngBuffer, "image/svg+xml"),
        /Unsupported file type/i,
      );

      // Oversized buffer (> 5 MB)
      const oversized = Buffer.alloc(MAX_IMAGE_SIZE_BYTES + 1024);
      assert.throws(
        () => validateImageBuffer(oversized, "image/png"),
        /exceeds the 5 MB limit/i,
      );
    });

    it("prevents unauthorized users from uploading an image for an exercise they cannot edit and protects shared assets", async () => {
      const origFindFirst = prisma.exercise.findFirst;
      const origCount = prisma.exercise.count;

      try {
        // Platform exercise (isCustom: false) cannot be modified by a MEMBER
        (prisma.exercise as any).findFirst = async () => ({
          id: "ex-platform-1",
          name: "Barbell Bench Press",
          isCustom: false,
          createdById: null,
          isActive: true,
        });

        const pngBuffer = Buffer.from([
          0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00,
          0x0d,
        ]);
        const info = validateImageBuffer(pngBuffer, "image/png");

        await assert.rejects(
          () =>
            exerciseService.uploadImage(pngBuffer, info, {
              exerciseId: "ex-platform-1",
              userId: "member-1",
              role: Roles.MEMBER,
            }),
          (err: any) => {
            assert.equal(err.statusCode, 403);
            return true;
          },
        );

        // Shared asset reference check: deleteIfUnused must NOT delete when count > 0
        const managedCloudinaryUrl =
          "https://res.cloudinary.com/demo/image/upload/v1700000000/stren/exercises/123e4567-e89b-12d3-a456-426614174000.png";
        const parsed = storageService.parseManagedAsset(managedCloudinaryUrl);
        assert.ok(parsed);
        assert.equal(parsed.provider, "cloudinary");
        assert.equal(
          parsed.key,
          "stren/exercises/123e4567-e89b-12d3-a456-426614174000",
        );

        // External URL is not treated as a managed asset
        assert.equal(
          storageService.parseManagedAsset(
            "https://images.unsplash.com/photo-1574680096145-d05b474e2155",
          ),
          null,
        );

        // When another exercise still references the URL, deleteIfUnused returns false without deleting
        (prisma.exercise as any).count = async () => 1;
        const deletedWhenReferenced = await storageService.deleteIfUnused(
          managedCloudinaryUrl,
          "ex-1",
        );
        assert.equal(deletedWhenReferenced, false);
      } finally {
        (prisma.exercise as any).findFirst = origFindFirst;
        (prisma.exercise as any).count = origCount;
      }
    });
  });
});
