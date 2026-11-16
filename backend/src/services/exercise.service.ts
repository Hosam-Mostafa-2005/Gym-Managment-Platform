import prisma from "../config/prisma.js";
import type {
  CreateExerciseDto,
  UpdateExerciseDto,
} from "../types/exercise.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";
import mapExercise from "../mappers/exercise.mapper.js";
import { Roles, type Role } from "../constants/roles.js";
import storageService from "./storage.service.js";
import type { ValidatedImageInfo } from "../utils/imageValidator.js";

class ExerciseService {
  async assertCanModify(id: string, userId?: string, role?: Role) {
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    if (role === Roles.MEMBER) {
      if (!exercise.isCustom || exercise.createdById !== userId) {
        throw new AppError(
          "You can only modify your own custom exercises.",
          403,
        );
      }
    } else if (
      role === Roles.TRAINER &&
      (!exercise.isCustom || exercise.createdById !== userId)
    ) {
      throw new AppError("You can only modify your own custom exercises.", 403);
    }

    return exercise;
  }

  async uploadImage(
    buffer: Buffer,
    imageInfo: ValidatedImageInfo,
    options: {
      exerciseId?: string;
      userId?: string;
      role?: Role;
      requestBaseUrl?: string;
    } = {},
  ) {
    if (options.exerciseId) {
      await this.assertCanModify(
        options.exerciseId,
        options.userId,
        options.role,
      );
    }

    return storageService.uploadExerciseImage(
      buffer,
      imageInfo,
      options.requestBaseUrl,
    );
  }

  async deleteStagedImage(imageUrl: string | undefined | null) {
    if (!imageUrl) return false;
    const parsed = storageService.parseManagedAsset(imageUrl);
    if (!parsed || parsed.key.includes("avatars")) {
      return false;
    }
    return storageService.deleteIfUnused(imageUrl);
  }

  // Create Exercise
  async create(data: CreateExerciseDto, userId?: string, role?: Role) {
    try {
      const isMember = role === Roles.MEMBER;
      const isTrainer = role === Roles.TRAINER;
      const isCustom = isMember || isTrainer;
      const createdById = userId || null;

      // Duplicate check
      let duplicateWhere: any;
      if (isMember && userId) {
        duplicateWhere = {
          name: data.name,
          isActive: true,
          OR: [{ isCustom: false }, { createdById: userId }],
        };
      } else {
        duplicateWhere = {
          name: data.name,
          isActive: true,
          isCustom: false,
        };
      }

      const existingExercise = await prisma.exercise.findFirst({
        where: duplicateWhere,
      });

      if (existingExercise) {
        throw new AppError("Exercise already exists.", 409);
      }

      if (data.alternatives?.length) {
        const altWhere: any = {
          id: { in: data.alternatives },
          isActive: true,
        };
        if (isMember && userId) {
          altWhere.OR = [{ isCustom: false }, { createdById: userId }];
        } else {
          altWhere.isCustom = false;
        }

        const alternativesCount = await prisma.exercise.count({
          where: altWhere,
        });

        if (alternativesCount !== data.alternatives.length) {
          throw new AppError(
            "One or more alternative exercises are invalid.",
            400,
          );
        }
      }

      const exercise = await prisma.exercise.create({
        data: {
          name: data.name,
          description: data.description ?? "",
          imageUrl: data.imageUrl ? data.imageUrl : null,
          videoUrl: data.videoUrl ? data.videoUrl : null,
          equipment: data.equipment,
          difficulty: data.difficulty as any,
          primaryMuscles: data.primaryMuscles,
          secondaryMuscles: data.secondaryMuscles ?? [],
          instructions: data.instructions,
          tips: data.tips ?? [],
          isCustom,
          createdById,
          alternatives: data.alternatives?.length
            ? {
                connect: data.alternatives.map((altId) => ({ id: altId })),
              }
            : undefined,
        },
        include: {
          alternatives: true,
        },
      });

      return mapExercise(exercise);
    } catch (error) {
      if (data.imageUrl) {
        await storageService.deleteIfUnused(data.imageUrl);
      }
      throw error;
    }
  }

  // Get All Exercises with Pagination Metadata
  async getAll(query: Record<string, any>, userId?: string, role?: Role) {
    const isMember = role === Roles.MEMBER;
    const baseWhere: any = { isActive: true };

    if (isMember && userId) {
      baseWhere.OR = [
        { isCustom: false },
        { createdById: userId },
        {
          memberAccess: {
            some: {
              memberId: userId,
              isActive: true,
            },
          },
        },
      ];
    } else if (role === Roles.TRAINER && userId) {
      baseWhere.OR = [{ isCustom: false }, { createdById: userId }];
    } else if (role !== Roles.ADMIN) {
      baseWhere.isCustom = false;
    }

    // Support explicit query filter for isCustom
    const normalizedQuery = { ...query };
    if (normalizedQuery.isCustom !== undefined) {
      const isCustomBool =
        normalizedQuery.isCustom === "true" ||
        normalizedQuery.isCustom === true;
      if (isCustomBool && userId) {
        baseWhere.isCustom = true;
        baseWhere.createdById = userId;
        delete baseWhere.OR;
      } else if (!isCustomBool) {
        baseWhere.isCustom = false;
        delete baseWhere.OR;
      }
      delete normalizedQuery.isCustom;
    }

    const features = new ApiFeatures(baseWhere, normalizedQuery)
      .filter([
        "equipment",
        "difficulty",
        "primaryMuscles",
        "secondaryMuscles",
      ])
      .search(["name", "primaryMuscles", "secondaryMuscles"])
      .sort()
      .paginate();

    const [totalResults, exercises] = await Promise.all([
      prisma.exercise.count({
        where: features.prismaWhere,
      }),
      prisma.exercise.findMany({
        where: features.prismaWhere,
        orderBy: features.prismaOrderBy,
        skip: features.prismaSkip,
        take: features.prismaTake,
        include: {
          alternatives: true,
        },
      }),
    ]);

    return {
      exercises: exercises.map(mapExercise),
      totalResults,
    };
  }

  // Get Exercise By Id
  async getById(id: string, userId?: string, role?: Role) {
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        alternatives: true,
      },
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    if (exercise.isCustom && role !== Roles.ADMIN) {
      if (role === Roles.TRAINER) {
        if (!userId || exercise.createdById !== userId) {
          throw new AppError("Exercise not found.", 404);
        }
      } else if (role === Roles.MEMBER) {
        if (exercise.createdById !== userId) {
          const hasAccess = await prisma.memberExerciseAccess.findFirst({
            where: {
              memberId: userId,
              exerciseId: id,
              isActive: true,
            },
          });
          if (!hasAccess) {
            throw new AppError("Exercise not found.", 404);
          }
        }
      }
    }

    return mapExercise(exercise);
  }

  async grantAccess(exerciseId: string, memberId: string, coachId: string) {
    const exercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, isActive: true, createdById: coachId },
    });
    if (!exercise) {
      throw new AppError("Custom exercise not found or not owned by you.", 404);
    }

    const access = await prisma.memberExerciseAccess.upsert({
      where: {
        memberId_exerciseId: { memberId, exerciseId },
      },
      create: {
        memberId,
        exerciseId,
        grantedById: coachId,
        isActive: true,
      },
      update: {
        isActive: true,
        revokedAt: null,
      },
    });

    return access;
  }

  async revokeAccess(exerciseId: string, memberId: string, coachId: string) {
    const exercise = await prisma.exercise.findFirst({
      where: { id: exerciseId, isActive: true, createdById: coachId },
    });
    if (!exercise) {
      throw new AppError("Custom exercise not found or not owned by you.", 404);
    }

    await prisma.memberExerciseAccess.updateMany({
      where: {
        exerciseId,
        memberId,
        grantedById: coachId,
      },
      data: {
        isActive: false,
        revokedAt: new Date(),
      },
    });

    return { success: true };
  }

  // Update Exercise
  async update(
    id: string,
    data: UpdateExerciseDto,
    userId?: string,
    role?: Role,
  ) {
    const exercise = await this.assertCanModify(id, userId, role);
    const previousImageUrl = exercise.imageUrl;

    try {
      if (data.name) {
        let duplicateWhere: any;
        if (role === Roles.MEMBER && userId) {
          duplicateWhere = {
            name: data.name,
            isActive: true,
            id: { not: id },
            OR: [{ isCustom: false }, { createdById: userId }],
          };
        } else {
          duplicateWhere = {
            name: data.name,
            isActive: true,
            id: { not: id },
            isCustom: false,
          };
        }

        const existingExercise = await prisma.exercise.findFirst({
          where: duplicateWhere,
        });

        if (existingExercise) {
          throw new AppError("Exercise already exists.", 409);
        }
      }

      if (data.alternatives?.length) {
        const altWhere: any = {
          id: { in: data.alternatives },
          isActive: true,
        };
        if (role === Roles.MEMBER && userId) {
          altWhere.OR = [{ isCustom: false }, { createdById: userId }];
        } else {
          altWhere.isCustom = false;
        }

        const alternativesCount = await prisma.exercise.count({
          where: altWhere,
        });

        if (alternativesCount !== data.alternatives.length) {
          throw new AppError(
            "One or more alternative exercises are invalid.",
            400,
          );
        }
      }

      const updatedExercise = await prisma.exercise.update({
        where: { id },
        data: {
          ...(data.name !== undefined && { name: data.name }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.imageUrl !== undefined && {
            imageUrl: data.imageUrl ? data.imageUrl : null,
          }),
          ...(data.videoUrl !== undefined && {
            videoUrl: data.videoUrl ? data.videoUrl : null,
          }),
          ...(data.equipment !== undefined && { equipment: data.equipment }),
          ...(data.difficulty !== undefined && {
            difficulty: data.difficulty as any,
          }),
          ...(data.primaryMuscles !== undefined && {
            primaryMuscles: data.primaryMuscles,
          }),
          ...(data.secondaryMuscles !== undefined && {
            secondaryMuscles: data.secondaryMuscles,
          }),
          ...(data.instructions !== undefined && {
            instructions: data.instructions,
          }),
          ...(data.tips !== undefined && { tips: data.tips }),
          ...(data.alternatives !== undefined && {
            alternatives: {
              set: data.alternatives.map((altId) => ({ id: altId })),
            },
          }),
        },
        include: {
          alternatives: true,
        },
      });

      // If imageUrl was replaced or cleared, safely clean up old asset if no other exercise references it
      if (
        data.imageUrl !== undefined &&
        previousImageUrl &&
        previousImageUrl !== updatedExercise.imageUrl
      ) {
        await storageService.deleteIfUnused(previousImageUrl, id);
      }

      return mapExercise(updatedExercise);
    } catch (error) {
      if (data.imageUrl && data.imageUrl !== previousImageUrl) {
        await storageService.deleteIfUnused(data.imageUrl);
      }
      throw error;
    }
  }

  // Soft Delete
  async delete(id: string, userId?: string, role?: Role) {
    const exercise = await prisma.exercise.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    if (role === Roles.MEMBER) {
      if (!exercise.isCustom || exercise.createdById !== userId) {
        throw new AppError(
          "You can only delete your own custom exercises.",
          403,
        );
      }
    } else if (
      role === Roles.TRAINER &&
      (!exercise.isCustom || exercise.createdById !== userId)
    ) {
      throw new AppError("You can only delete your own custom exercises.", 403);
    }

    const usedInWorkout = await prisma.workoutExercise.findFirst({
      where: {
        exerciseId: id,
        workout: {
          isActive: true,
        },
      },
    });

    if (usedInWorkout) {
      throw new AppError(
        "Cannot delete an exercise that is used in a workout.",
        409,
      );
    }

    await prisma.exercise.update({
      where: { id },
      data: { isActive: false },
    });

    return;
  }
}

export default new ExerciseService();
