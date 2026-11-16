import crypto from "node:crypto";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import mapWorkout from "../mappers/workout.mapper.js";

export class WorkoutShareService {
  /**
   * Generates a 32-byte secure bearer token and an 8-character unique share code.
   */
  async createShare(
    workoutId: string,
    userId: string,
    expiresAt?: Date | null,
  ) {
    const workout = await prisma.workout.findFirst({
      where: { id: workoutId, isActive: true },
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    const creatorId = workout.createdBy ?? (workout as any).createdById;
    if (creatorId !== userId && !workout.isTemplate) {
      throw new AppError("You can only share workouts you own or public templates.", 403);
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const shareTokenHash = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    // Generate unique 8-character code: STR-XXXXX
    let shareCode = "";
    for (let attempts = 0; attempts < 5; attempts++) {
      const candidate = `STR-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
      const existing = await prisma.workoutShare.findUnique({
        where: { shareCode: candidate },
      });
      if (!existing) {
        shareCode = candidate;
        break;
      }
    }

    if (!shareCode) {
      shareCode = `STR-${Date.now().toString(36).slice(-5).toUpperCase()}`;
    }

    const share = await prisma.workoutShare.create({
      data: {
        workoutId,
        userId,
        shareCode,
        shareTokenHash,
        isActive: true,
        expiresAt: expiresAt ?? null,
      },
      include: {
        workout: {
          select: { title: true },
        },
      },
    });

    return {
      id: share.id,
      workoutId: share.workoutId,
      workoutTitle: share.workout.title,
      shareCode: share.shareCode,
      shareToken: rawToken,
      expiresAt: share.expiresAt,
      createdAt: share.createdAt,
    };
  }

  /**
   * Resolves a WorkoutShare by either its raw share token or short share code.
   */
  private async findShare(tokenOrCode: string) {
    const trimmed = (tokenOrCode || "").trim();
    if (!trimmed) {
      throw new AppError("Share code or token is required.", 400);
    }

    // Try finding by shareCode (case-insensitive search)
    let share = await prisma.workoutShare.findFirst({
      where: {
        shareCode: { equals: trimmed, mode: "insensitive" },
        isActive: true,
      },
      include: {
        workout: {
          include: {
            creator: {
              select: { name: true },
            },
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!share) {
      // Try hashing incoming token and find by shareTokenHash
      const hashed = crypto
        .createHash("sha256")
        .update(trimmed)
        .digest("hex");

      share = await prisma.workoutShare.findFirst({
        where: {
          shareTokenHash: hashed,
          isActive: true,
        },
        include: {
          workout: {
            include: {
              creator: {
                select: { name: true },
              },
              exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });
    }

    if (!share || !share.workout || !share.workout.isActive) {
      throw new AppError("Shared workout not found or link has been revoked.", 404);
    }

    if (share.expiresAt && share.expiresAt < new Date()) {
      throw new AppError("This workout share link has expired.", 410);
    }

    return share;
  }

  /**
   * Preview shared workout (Public/Safe sanitization: zero private session logs or user identities).
   */
  async getSharePreview(tokenOrCode: string) {
    const share = await this.findShare(tokenOrCode);

    // Increment view count asynchronously
    prisma.workoutShare
      .update({
        where: { id: share.id },
        data: { viewCount: { increment: 1 } },
      })
      .catch(() => {});

    const workout = share.workout;

    return {
      shareId: share.id,
      shareCode: share.shareCode,
      createdAt: share.createdAt,
      expiresAt: share.expiresAt,
      viewCount: share.viewCount + 1,
      importCount: share.importCount,
      workout: {
        id: workout.id,
        title: workout.title,
        description: workout.description,
        category: workout.category,
        difficulty: workout.difficulty,
        estimatedDuration: workout.estimatedDuration,
        defaultRestLarge: workout.defaultRestLarge ?? 90,
        defaultRestSmall: workout.defaultRestSmall ?? 60,
        tags: workout.tags,
        exerciseCount: workout.exercises.length,
        creatorName: workout.creator?.name || "STREN Athlete",
        exercises: workout.exercises.map((e: any) => ({
          order: e.order,
          sets: e.sets,
          reps: e.reps,
          targetWeight: e.targetWeight,
          targetRpe: e.targetRpe,
          restSeconds: e.restSeconds,
          isRestOverridden: e.isRestOverridden,
          notes: e.notes,
          setsDetail: e.setsDetail,
          exercise: {
            id: e.exercise.id,
            name: e.exercise.name,
            imageUrl: e.exercise.imageUrl,
            primaryMuscles: e.exercise.primaryMuscles,
            secondaryMuscles: e.exercise.secondaryMuscles,
            equipment: e.exercise.equipment,
            difficulty: e.exercise.difficulty,
          },
        })),
      },
    };
  }

  /**
   * Import shared workout transactionally into recipient's private library.
   */
  async importSharedWorkout(tokenOrCode: string, recipientUserId: string) {
    const share = await this.findShare(tokenOrCode);
    const source = share.workout;

    const baseTitle = `${source.title} (Shared)`;
    const existing = await prisma.workout.findFirst({
      where: {
        title: baseTitle,
        createdBy: recipientUserId,
        isActive: true,
      },
    });

    const finalTitle = existing
      ? `${baseTitle} ${Date.now().toString().slice(-4)}`
      : baseTitle;

    const importedWorkout = await prisma.$transaction(async (tx) => {
      // 1. Create recipient's private workout copy
      const created = await tx.workout.create({
        data: {
          title: finalTitle,
          description: source.description || "",
          category: source.category as any,
          difficulty: source.difficulty as any,
          estimatedDuration: source.estimatedDuration,
          defaultRestLarge: source.defaultRestLarge ?? 90,
          defaultRestSmall: source.defaultRestSmall ?? 60,
          tags: source.tags || [],
          isTemplate: false,
          createdBy: recipientUserId,
          exercises: {
            create: source.exercises.map((e: any) => ({
              exerciseId: e.exerciseId,
              sets: e.sets,
              reps: e.reps,
              targetWeight: e.targetWeight,
              targetRpe: e.targetRpe,
              restSeconds: e.restSeconds,
              isRestOverridden: e.isRestOverridden,
              notes: e.notes,
              order: e.order,
              setsDetail: e.setsDetail ?? undefined,
            })),
          },
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      });

      // 2. Increment import count
      await tx.workoutShare.update({
        where: { id: share.id },
        data: { importCount: { increment: 1 } },
      });

      return created;
    });

    return mapWorkout(importedWorkout);
  }

  /**
   * Revoke an active share link or code.
   */
  async revokeShare(shareId: string, userId: string, role?: Role) {
    const share = await prisma.workoutShare.findUnique({
      where: { id: shareId },
    });

    if (!share) {
      throw new AppError("Share not found.", 404);
    }

    if (role !== Roles.ADMIN && share.userId !== userId) {
      throw new AppError("You can only revoke your own share links.", 403);
    }

    await prisma.workoutShare.update({
      where: { id: shareId },
      data: { isActive: false },
    });

    return { success: true, message: "Share link revoked successfully." };
  }

  /**
   * List active shares for a specific workout.
   */
  async getWorkoutShares(workoutId: string, userId: string) {
    return prisma.workoutShare.findMany({
      where: {
        workoutId,
        userId,
        isActive: true,
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shareCode: true,
        expiresAt: true,
        viewCount: true,
        importCount: true,
        createdAt: true,
      },
    });
  }
}

export default new WorkoutShareService();
