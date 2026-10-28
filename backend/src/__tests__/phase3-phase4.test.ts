import { describe, it } from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";

import prisma from "../config/prisma.js";
import { Roles } from "../constants/roles.js";
import {
  isLargeMuscleGroup,
  getRecommendedRestSeconds,
} from "../utils/rest-classification.js";
import {
  createWorkoutSchema,
  updateWorkoutSchema,
} from "../validators/workout.validator.js";
import {
  createWorkoutSetSchema,
  updateWorkoutSetSchema,
} from "../validators/workout-set.validator.js";
import {
  createCustomFoodSchema,
  updateCustomFoodSchema,
} from "../validators/nutrition.validator.js";
import { WorkoutShareService } from "../services/workout-share.service.js";
import { FoodCatalogService } from "../services/food-catalog.service.js";
import userService from "../services/user.service.js";
import storageService from "../services/storage.service.js";
import { validateImageBuffer } from "../utils/imageValidator.js";

describe("STREN — Phase 3 & Phase 4 Integration Test Suite", () => {
  const shareService = new WorkoutShareService();
  const foodService = new FoodCatalogService();

  // ──────────────────────────────────────────────────────────────────────────
  // 1. Phase 3.1 & 3.2: Muscle Group Classification & Rest Auto-Assignment
  // ──────────────────────────────────────────────────────────────────────────
  describe("1. Phase 3.1 & 3.2: Rest Classification & Auto Assignment", () => {
    it("classifies major compound muscle groups as large, and accessories as small", () => {
      assert.equal(isLargeMuscleGroup(["CHEST"]), true);
      assert.equal(isLargeMuscleGroup(["Back"]), true);
      assert.equal(isLargeMuscleGroup(["Lats"]), true);
      assert.equal(isLargeMuscleGroup(["Quadriceps"]), true);
      assert.equal(isLargeMuscleGroup(["quads"]), true);
      assert.equal(isLargeMuscleGroup(["Hamstrings"]), true);
      assert.equal(isLargeMuscleGroup(["Glutes"]), true);
      assert.equal(isLargeMuscleGroup(["legs"]), true);

      // Small muscle groups
      assert.equal(isLargeMuscleGroup(["BICEPS"]), false);
      assert.equal(isLargeMuscleGroup(["triceps"]), false);
      assert.equal(isLargeMuscleGroup(["Shoulders"]), false);
      assert.equal(isLargeMuscleGroup(["Abs"]), false);
      assert.equal(isLargeMuscleGroup(["Forearms"]), false);
      assert.equal(isLargeMuscleGroup(["Calves"]), false);
      assert.equal(isLargeMuscleGroup([]), false);
    });

    it("recommends custom or default rest times based on muscle group", () => {
      // Default 90s large, 60s small
      assert.equal(getRecommendedRestSeconds(["Chest"]), 90);
      assert.equal(getRecommendedRestSeconds(["Biceps"]), 60);

      // Custom workout defaults e.g. 120s large, 45s small
      assert.equal(getRecommendedRestSeconds(["Quads"], 120, 45), 120);
      assert.equal(getRecommendedRestSeconds(["Triceps"], 120, 45), 45);
    });

    it("validates defaultRestLarge and defaultRestSmall within 15s to 600s range", () => {
      const validWorkout = {
        body: {
          title: "Hypertrophy Push",
          category: "strength",
          difficulty: "intermediate",
          estimatedDuration: 60,
          defaultRestLarge: 90,
          defaultRestSmall: 60,
          exercises: [
            {
              exercise: "ex-1",
              sets: 3,
              reps: "10-12",
              order: 1,
              restSeconds: 90,
              isRestOverridden: false,
            },
          ],
        },
      };

      const validParsed = createWorkoutSchema.safeParse(validWorkout);
      assert.equal(validParsed.success, true);

      // Reject too low (< 15) or too high (> 600)
      const tooLow = createWorkoutSchema.safeParse({
        body: { ...validWorkout.body, defaultRestLarge: 10 },
      });
      assert.equal(tooLow.success, false);

      const tooHigh = createWorkoutSchema.safeParse({
        body: { ...validWorkout.body, defaultRestSmall: 700 },
      });
      assert.equal(tooHigh.success, false);
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 2. Phase 3.3: Smart Rest Timer & Drop Sets / Rest-Pause Support
  // ──────────────────────────────────────────────────────────────────────────
  describe("2. Phase 3.3: Smart Rest Timer & Set Types", () => {
    it("validates setType, segmentIndex, and intermediate/final flags", () => {
      const dropSetIntermediate = createWorkoutSetSchema.safeParse({
        body: {
          exerciseLog: "log-1",
          setNumber: 1,
          setType: "DROP_SET",
          segmentIndex: 0,
          isIntermediateSegment: true,
          isFinalSegment: false,
          weight: 100,
          actualReps: 8,
        },
      });
      assert.equal(dropSetIntermediate.success, true);

      const dropSetFinal = updateWorkoutSetSchema.safeParse({
        body: {
          setType: "DROP_SET",
          segmentIndex: 1,
          isIntermediateSegment: false,
          isFinalSegment: true,
          completed: true,
          weight: 70,
          actualReps: 6,
        },
      });
      assert.equal(dropSetFinal.success, true);
    });

    it("determines that intermediate segments do not trigger standard rest timer, while final segments do", () => {
      // Simulating frontend rest trigger evaluation rule:
      const shouldTriggerRest = (set: {
        isIntermediateSegment?: boolean;
        isFinalSegment?: boolean;
      }) => {
        return !set.isIntermediateSegment && set.isFinalSegment !== false;
      };

      // 1. Normal set: should trigger
      assert.equal(
        shouldTriggerRest({ isIntermediateSegment: false, isFinalSegment: true }),
        true,
      );

      // 2. Drop-set segment 1 of 2 (intermediate): MUST NOT trigger
      assert.equal(
        shouldTriggerRest({ isIntermediateSegment: true, isFinalSegment: false }),
        false,
      );

      // 3. Drop-set segment 2 of 2 (final): MUST trigger
      assert.equal(
        shouldTriggerRest({ isIntermediateSegment: false, isFinalSegment: true }),
        true,
      );

      // 4. Rest-pause intermediate: MUST NOT trigger
      assert.equal(
        shouldTriggerRest({ isIntermediateSegment: true }),
        false,
      );
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 3. Phase 4.4: Workout Sharing via Link or Share Code
  // ──────────────────────────────────────────────────────────────────────────
  describe("3. Phase 4.4: Workout Sharing End-to-End", () => {
    const creatorId = "user-creator-123";
    const recipientId = "user-recipient-456";
    const workoutId = "workout-shared-789";

    const mockWorkout = {
      id: workoutId,
      title: "Legs & Abs Blast",
      description: "Intense hypertrophy session",
      category: "Hypertrophy",
      difficulty: "Advanced",
      estimatedDuration: 75,
      defaultRestLarge: 100,
      defaultRestSmall: 50,
      tags: ["legs", "quads"],
      isActive: true,
      createdBy: creatorId,
      isTemplate: false,
      creator: { name: "Coach Alex" },
      exercises: [
        {
          id: "we-1",
          order: 1,
          sets: 4,
          reps: "8-10",
          targetWeight: 120,
          targetRpe: 8,
          restSeconds: 100,
          isRestOverridden: false,
          notes: "Focus on slow eccentric",
          exercise: {
            id: "ex-squat",
            name: "Barbell Back Squat",
            imageUrl: "https://stren.app/squat.jpg",
            primaryMuscles: ["Quadriceps", "Glutes"],
            secondaryMuscles: ["Hamstrings"],
            equipment: ["Barbell"],
            difficulty: "Advanced",
          },
        },
      ],
    };

    let generatedShareId = "share-abc-123";
    let generatedShareCode = "STR-TEST1";
    let storedHash = "";

    it("creates a cryptographically secure 32-byte hex token and 8-character share code", async () => {
      const origFindWorkout = prisma.workout.findFirst;
      const origFindShare = prisma.workoutShare.findUnique;
      const origCreateShare = prisma.workoutShare.create;

      (prisma.workout as any).findFirst = async () => mockWorkout;
      (prisma.workoutShare as any).findUnique = async () => null;
      (prisma.workoutShare as any).create = async ({ data }: any) => {
        generatedShareId = "share-" + crypto.randomUUID();
        generatedShareCode = data.shareCode;
        storedHash = data.shareTokenHash;
        return {
          id: generatedShareId,
          workoutId: data.workoutId,
          userId: data.userId,
          shareCode: data.shareCode,
          shareTokenHash: data.shareTokenHash,
          isActive: true,
          expiresAt: data.expiresAt,
          createdAt: new Date(),
          workout: { title: mockWorkout.title },
        };
      };

      try {
        const result = await shareService.createShare(workoutId, creatorId, null);

        assert.equal(result.workoutId, workoutId);
        assert.equal(result.workoutTitle, "Legs & Abs Blast");
        assert.match(result.shareCode, /^STR-[A-Z0-9]{5,6}$/);
        assert.equal(result.shareToken.length, 64); // 32 bytes hex = 64 characters

        // Verify SHA-256 hash match
        const computedHash = crypto
          .createHash("sha256")
          .update(result.shareToken)
          .digest("hex");
        assert.equal(computedHash, storedHash);
      } finally {
        prisma.workout.findFirst = origFindWorkout;
        prisma.workoutShare.findUnique = origFindShare;
        prisma.workoutShare.create = origCreateShare;
      }
    });

    it("sanitizes public preview with ZERO leaks of creator's private logs or sessions", async () => {
      const origFindShare = prisma.workoutShare.findFirst;
      const origUpdateShare = prisma.workoutShare.update;

      (prisma.workoutShare as any).findFirst = async () => ({
        id: generatedShareId,
        workoutId,
        shareCode: generatedShareCode,
        isActive: true,
        expiresAt: null,
        viewCount: 10,
        importCount: 2,
        createdAt: new Date(),
        workout: mockWorkout,
      });
      (prisma.workoutShare as any).update = async () => ({});

      try {
        const preview = await shareService.getSharePreview(generatedShareCode);

        assert.equal(preview.shareCode, generatedShareCode);
        assert.equal(preview.workout.title, "Legs & Abs Blast");
        assert.equal(preview.workout.creatorName, "Coach Alex");
        assert.equal(preview.workout.defaultRestLarge, 100);
        assert.equal(preview.workout.defaultRestSmall, 50);
        assert.equal(preview.workout.exercises.length, 1);
        assert.equal(preview.workout.exercises[0].exercise.name, "Barbell Back Squat");

        // Strict Privacy Assertions: Verify no user logs, sessions, or private IDs leaked
        assert.equal((preview as any).workout.sessions, undefined);
        assert.equal((preview as any).workout.exerciseLogs, undefined);
        assert.equal((preview as any).workout.creatorId, undefined);
        assert.equal((preview as any).workout.createdBy, undefined);
      } finally {
        prisma.workoutShare.findFirst = origFindShare;
        prisma.workoutShare.update = origUpdateShare;
      }
    });

    it("rejects preview when share link has expired", async () => {
      const origFindShare = prisma.workoutShare.findFirst;

      (prisma.workoutShare as any).findFirst = async () => ({
        id: generatedShareId,
        workoutId,
        shareCode: generatedShareCode,
        isActive: true,
        expiresAt: new Date(Date.now() - 10000), // Expired 10s ago
        viewCount: 5,
        importCount: 1,
        workout: mockWorkout,
      });

      try {
        await assert.rejects(
          async () => {
            await shareService.getSharePreview(generatedShareCode);
          },
          {
            message: "This workout share link has expired.",
            statusCode: 410,
          },
        );
      } finally {
        prisma.workoutShare.findFirst = origFindShare;
      }
    });

    it("imports shared workout into recipient's private library transactionally", async () => {
      const origFindShare = prisma.workoutShare.findFirst;
      const origTx = prisma.$transaction;

      (prisma.workoutShare as any).findFirst = async () => ({
        id: generatedShareId,
        workoutId,
        shareCode: generatedShareCode,
        isActive: true,
        expiresAt: null,
        viewCount: 12,
        importCount: 3,
        workout: mockWorkout,
      });

      let importedWorkoutCreated = false;
      let importCountIncremented = false;

      (prisma as any).$transaction = async (callback: any) => {
        return callback({
          workout: {
            create: async ({ data }: any) => {
              importedWorkoutCreated = true;
              assert.equal(data.createdBy, recipientId);
              assert.equal(data.title, "Legs & Abs Blast (Shared)");
              assert.equal(data.isTemplate, false);
              assert.equal(data.defaultRestLarge, 100);
              assert.equal(data.defaultRestSmall, 50);
              assert.equal(data.exercises.create.length, 1);
              return {
                id: "workout-cloned-new",
                ...data,
                exercises: [
                  {
                    id: "we-cloned-1",
                    exerciseId: "ex-squat",
                    exercise: mockWorkout.exercises[0].exercise,
                  },
                ],
              };
            },
          },
          workoutShare: {
            update: async ({ data }: any) => {
              if (data.importCount?.increment === 1) {
                importCountIncremented = true;
              }
            },
          },
        });
      };

      try {
        const cloned = await shareService.importSharedWorkout(
          generatedShareCode,
          recipientId,
        );

        assert.equal(importedWorkoutCreated, true);
        assert.equal(importCountIncremented, true);
        assert.equal(cloned.title, "Legs & Abs Blast (Shared)");
      } finally {
        prisma.workoutShare.findFirst = origFindShare;
        prisma.$transaction = origTx;
      }
    });

    it("revokes a share so subsequent preview requests fail with 404", async () => {
      const origFindUnique = prisma.workoutShare.findUnique;
      const origUpdate = prisma.workoutShare.update;
      const origFindFirst = prisma.workoutShare.findFirst;

      let revoked = false;

      (prisma.workoutShare as any).findUnique = async () => ({
        id: generatedShareId,
        userId: creatorId,
        workout: { createdBy: creatorId },
      });

      (prisma.workoutShare as any).update = async ({ data }: any) => {
        revoked = data.isActive === false;
      };

      // Mock preview lookup for deactivated share
      (prisma.workoutShare as any).findFirst = async () => null;

      try {
        await shareService.revokeShare(generatedShareId, creatorId, Roles.TRAINER);
        assert.equal(revoked, true);

        await assert.rejects(
          async () => {
            await shareService.getSharePreview(generatedShareCode);
          },
          {
            message: "Shared workout not found or link has been revoked.",
            statusCode: 404,
          },
        );
      } finally {
        prisma.workoutShare.findUnique = origFindUnique;
        prisma.workoutShare.update = origUpdate;
        prisma.workoutShare.findFirst = origFindFirst;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 4. Phase 4.5: Profile Picture Management & Security
  // ──────────────────────────────────────────────────────────────────────────
  describe("4. Phase 4.5: Profile Picture Validation & Management", () => {
    it("validates magic bytes for JPEG, PNG, and WebP, rejecting other formats", () => {
      // JPEG Magic bytes: FF D8 FF with minimum 12 bytes length
      const jpegBuffer = Buffer.concat([
        Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]),
        Buffer.alloc(8),
      ]);
      const jpegInfo = validateImageBuffer(jpegBuffer, "image/jpeg");
      assert.equal(jpegInfo.mimeType, "image/jpeg");
      assert.equal(jpegInfo.extension, "jpg");

      // PNG Magic bytes: 89 50 4E 47 0D 0A 1A 0A with minimum 12 bytes length
      const pngBuffer = Buffer.concat([
        Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
        Buffer.alloc(8),
      ]);
      const pngInfo = validateImageBuffer(pngBuffer, "image/png");
      assert.equal(pngInfo.mimeType, "image/png");
      assert.equal(pngInfo.extension, "png");

      // WebP Magic bytes: "RIFF" .... "WEBP"
      const webpBuffer = Buffer.concat([
        Buffer.from("RIFF"),
        Buffer.alloc(4),
        Buffer.from("WEBP"),
      ]);
      const webpInfo = validateImageBuffer(webpBuffer, "image/webp");
      assert.equal(webpInfo.mimeType, "image/webp");
      assert.equal(webpInfo.extension, "webp");

      // Reject HTML / script / text disguise
      const scriptBuffer = Buffer.from("<script>alert('xss')</script>");
      assert.throws(
        () => validateImageBuffer(scriptBuffer, "text/html"),
        /Unsupported file type/,
      );

      // Reject spoofed declared mime type with invalid binary content
      assert.throws(
        () => validateImageBuffer(scriptBuffer, "image/jpeg"),
        /Invalid or corrupted image file content/,
      );
    });

    it("parses managed storage URLs to safely identify avatar assets for cleanup", () => {
      // Local managed avatar
      const localUrl = "http://localhost:5000/uploads/avatars/avatar-123.jpg";
      const localParsed = storageService.parseManagedAsset(localUrl);
      assert.notEqual(localParsed, null);
      assert.equal(localParsed?.provider, "local");
      assert.equal(localParsed?.key, "avatars/avatar-123.jpg");

      // Cloudinary managed avatar
      const cloudinaryUrl =
        "https://res.cloudinary.com/demo/image/upload/v12345/stren/avatars/user-456.jpg";
      const cloudParsed = storageService.parseManagedAsset(cloudinaryUrl);
      assert.notEqual(cloudParsed, null);
      assert.equal(cloudParsed?.provider, "cloudinary");
      assert.equal(cloudParsed?.key, "stren/avatars/user-456");

      // External unmanaged URL
      const externalUrl = "https://images.unsplash.com/photo-123";
      assert.equal(storageService.parseManagedAsset(externalUrl), null);
    });

    it("deletes user avatar and clears avatarUrl", async () => {
      const origFindUnique = prisma.user.findUnique;
      const origUpdate = prisma.user.update;
      const origDeleteAsset = storageService.deleteManagedAsset;

      let assetDeleted = false;
      let userAvatarCleared = false;

      (prisma.user as any).findUnique = async () => ({
        id: "user-avatar-1",
        name: "Test User",
        email: "test@stren.app",
        role: Roles.MEMBER,
        avatarUrl: "http://localhost:5000/uploads/avatars/avatar-123.jpg",
      });

      (storageService as any).deleteManagedAsset = async () => {
        assetDeleted = true;
      };

      (prisma.user as any).update = async ({ data }: any) => {
        if (data.avatarUrl === null) {
          userAvatarCleared = true;
        }
        return {
          id: "user-avatar-1",
          name: "Test User",
          email: "test@stren.app",
          role: Roles.MEMBER,
          avatarUrl: null,
        };
      };

      try {
        const updated = await userService.deleteAvatar("user-avatar-1");
        assert.equal(assetDeleted, true);
        assert.equal(userAvatarCleared, true);
        assert.equal(updated.avatarUrl, null);
      } finally {
        prisma.user.findUnique = origFindUnique;
        prisma.user.update = origUpdate;
        storageService.deleteManagedAsset = origDeleteAsset;
      }
    });
  });

  // ──────────────────────────────────────────────────────────────────────────
  // 5. Phase 4.6: Custom Personal Foods in Food Diary
  // ──────────────────────────────────────────────────────────────────────────
  describe("5. Phase 4.6: Custom Personal Foods & Food Diary", () => {
    const memberAId = "member-alice-111";
    const memberBId = "member-bob-222";

    it("validates custom food schema, rejecting negative macros or empty names", () => {
      const validFood = {
        body: {
          name: "Homemade Protein Oats",
          category: "Breakfast",
          servingSize: 100,
          servingUnit: "g",
          calories: 380,
          protein: 32,
          carbs: 45,
          fat: 8,
          fiber: 6,
        },
      };
      assert.equal(createCustomFoodSchema.safeParse(validFood).success, true);

      // Negative protein
      assert.equal(
        createCustomFoodSchema.safeParse({
          body: { ...validFood.body, protein: -5 },
        }).success,
        false,
      );

      // Negative calories
      assert.equal(
        createCustomFoodSchema.safeParse({
          body: { ...validFood.body, calories: -100 },
        }).success,
        false,
      );

      // Name too short
      assert.equal(
        createCustomFoodSchema.safeParse({
          body: { ...validFood.body, name: "A" },
        }).success,
        false,
      );
    });

    it("ensures search isolation: user sees global foods + their custom foods, but never another user's custom foods", async () => {
      const origFindMany = prisma.food.findMany;
      const origCount = prisma.food.count;

      let capturedWhere: any = null;

      (prisma.food as any).findMany = async ({ where }: any) => {
        capturedWhere = where;
        return [];
      };
      (prisma.food as any).count = async () => 0;

      try {
        await foodService.searchFoods({
          userId: memberAId,
          search: "Oats",
        });

        // Verify the OR query structure isolates memberA's foods and verified foods
        assert.equal(capturedWhere.isActive, true);
        const orConditions = capturedWhere.OR;
        assert.deepEqual(orConditions[0], { isCustom: false, isVerified: true });
        assert.deepEqual(orConditions[1], {
          isCustom: true,
          userId: memberAId,
          isActive: true,
        });
      } finally {
        prisma.food.findMany = origFindMany;
        prisma.food.count = origCount;
      }
    });

    it("prevents user B from editing or deleting user A's custom food (403)", async () => {
      const origFindFirst = prisma.food.findFirst;

      (prisma.food as any).findFirst = async () => ({
        id: "custom-food-alice-1",
        name: "Alice's Protein Bar",
        isCustom: true,
        userId: memberAId,
        isActive: true,
      });

      try {
        // User B attempts to delete Alice's food
        await assert.rejects(
          async () => {
            await foodService.deleteCustomFood(memberBId, "custom-food-alice-1");
          },
          {
            message: "You can only delete your own custom foods.",
            statusCode: 403,
          },
        );

        // User B attempts to update Alice's food
        await assert.rejects(
          async () => {
            await foodService.updateCustomFood(memberBId, "custom-food-alice-1", {
              name: "Hacked Name",
            });
          },
          {
            message: "You can only edit your own custom foods.",
            statusCode: 403,
          },
        );
      } finally {
        prisma.food.findFirst = origFindFirst;
      }
    });

    it("calculates nutrients accurately according to serving ratio", () => {
      const baseFood = {
        id: "food-1",
        name: "Greek Yogurt",
        servingSize: 100,
        servingUnit: "g",
        calories: 100,
        protein: 15,
        carbs: 4,
        fat: 2,
        fiber: 0,
      };

      // 250g serving => ratio 2.5
      const calculated = foodService.calculateNutrients(baseFood, 250, "g");
      assert.equal(calculated.calories, 250);
      assert.equal(calculated.protein, 37.5);
      assert.equal(calculated.carbs, 10);
      assert.equal(calculated.fat, 5);
    });

    it("soft-deletes custom food to ensure historical FoodLog records remain intact", async () => {
      const origFindFirst = prisma.food.findFirst;
      const origUpdate = prisma.food.update;

      let softDeleted = false;

      (prisma.food as any).findFirst = async () => ({
        id: "custom-food-alice-2",
        name: "Alice Smoothie",
        isCustom: true,
        userId: memberAId,
        isActive: true,
      });

      (prisma.food as any).update = async ({ data }: any) => {
        softDeleted = data.isActive === false;
      };

      try {
        const result = await foodService.deleteCustomFood(
          memberAId,
          "custom-food-alice-2",
        );
        assert.equal(result.success, true);
        assert.equal(softDeleted, true);
      } finally {
        prisma.food.findFirst = origFindFirst;
        prisma.food.update = origUpdate;
      }
    });
  });
});
