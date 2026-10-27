import type { ParsedQs } from "qs";
import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";
import type {
  CreateWorkoutDto,
  UpdateWorkoutDto,
} from "../types/workout.types.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import mapWorkout from "../mappers/workout.mapper.js";
import { Roles, type Role } from "../constants/roles.js";

class WorkoutService {
  async create(data: CreateWorkoutDto, trainerId: string, role?: Role) {
    const isMember = role === Roles.MEMBER;
    const isTemplate = isMember ? false : (data.isTemplate ?? false);

    const existingWorkout = await prisma.workout.findFirst({
      where: {
        title: data.title,
        createdBy: trainerId,
        isActive: true,
      },
    });

    if (existingWorkout) {
      throw new AppError("Workout already exists.", 409);
    }

    const exerciseIds = data.exercises.map((exercise) => exercise.exercise);

    const uniqueExercises = new Set(exerciseIds.map(String));

    if (uniqueExercises.size !== exerciseIds.length) {
      throw new AppError("Duplicate exercises are not allowed.", 400);
    }

    const orders = data.exercises.map((e) => e.order).sort((a, b) => a - b);

    const validOrder = orders.every((value, index) => value === index + 1);

    if (!validOrder) {
      throw new AppError(
        "Exercise order must start from 1 without gaps or duplicates.",
        400,
      );
    }

    const existingExercises = await prisma.exercise.findMany({
      where: {
        id: { in: exerciseIds },
        isActive: true,
      },
    });

    if (existingExercises.length !== exerciseIds.length) {
      throw new AppError("One or more exercises do not exist.", 400);
    }

    const workout = await prisma.workout.create({
      data: {
        title: data.title,
        description: data.description ?? "",
        category: data.category as any,
        difficulty: data.difficulty as any,
        estimatedDuration: data.estimatedDuration,
        tags: data.tags ?? [],
        isTemplate,
        createdBy: trainerId,
        exercises: {
          create: data.exercises.map((e) => ({
            exerciseId: e.exercise,
            sets: e.sets,
            reps: e.reps,
            targetWeight: e.targetWeight,
            targetRpe: e.targetRpe,
            restSeconds: e.restSeconds,
            notes: e.notes,
            order: e.order,
          })),
        },
      },
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return {
      ...workout,
      exercises: workout.exercises.map((item) => ({
        ...item,
        exercise: item.exercise,
      })),
    };
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    let filter: any;
    if (role === Roles.ADMIN) {
      filter = { isActive: true };
    } else if (role === Roles.TRAINER) {
      const trainerAssignments = await prisma.assignment.findMany({
        where: { trainerId: userId, isActive: true },
        select: { workoutId: true },
      });
      const assignedWorkoutIds = [
        ...new Set(trainerAssignments.map((a) => a.workoutId)),
      ];

      filter = {
        isActive: true,
        OR: [
          { createdBy: userId },
          { isTemplate: true },
          ...(assignedWorkoutIds.length > 0
            ? [{ id: { in: assignedWorkoutIds } }]
            : []),
        ],
      };
    } else {
      const memberAssignments = await prisma.assignment.findMany({
        where: { memberId: userId, isActive: true },
        select: { workoutId: true },
      });
      const assignedWorkoutIds = [
        ...new Set(memberAssignments.map((a) => a.workoutId)),
      ];

      filter = {
        isActive: true,
        OR: [
          { createdBy: userId },
          { isTemplate: true },
          ...(assignedWorkoutIds.length > 0
            ? [{ id: { in: assignedWorkoutIds } }]
            : []),
        ],
      };
    }

    const normalizedQuery: Record<string, any> = { ...query };
    if (normalizedQuery.isTemplate !== undefined) {
      const isTemplateBool =
        normalizedQuery.isTemplate === "true" ||
        normalizedQuery.isTemplate === true;
      if (isTemplateBool) {
        filter = { isActive: true, isTemplate: true };
      } else {
        filter = { isActive: true, isTemplate: false, createdBy: userId };
      }
      delete normalizedQuery.isTemplate;
    }

    const allowedFilters =
      role === Roles.ADMIN
        ? ["category", "difficulty", "tags", "createdBy"]
        : ["category", "difficulty", "tags"];

    const features = new ApiFeatures(filter, normalizedQuery)
      .filter(allowedFilters)
      .search(["title", "description"])
      .sort()
      .paginate();

    const workouts = await prisma.workout.findMany({
      where: features.prismaWhere,
      orderBy: features.prismaOrderBy,
      skip: features.prismaSkip,
      take: features.prismaTake,
      include: {
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return workouts.map(mapWorkout);
  }

  async getById(id: string, userId?: string, role?: Role) {
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        exercises: {
          include: {
            exercise: true,
          },
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    const creatorId = workout.createdBy ?? (workout as any).createdById;

    if (userId && role && role !== Roles.ADMIN) {
      if (creatorId === userId) {
        // Creator always allowed
      } else if (workout.isTemplate) {
        // Template always allowed
      } else if (role === Roles.MEMBER) {
        const isAssigned = await prisma.assignment.findFirst({
          where: {
            workoutId: workout.id,
            memberId: userId,
            isActive: true,
          },
        });

        if (!isAssigned) {
          throw new AppError(
            "You are not allowed to access this workout.",
            403,
          );
        }
      } else if (role === Roles.TRAINER) {
        const isTrainerAssigned = await prisma.assignment.findFirst({
          where: {
            workoutId: workout.id,
            trainerId: userId,
            isActive: true,
          },
        });

        if (!isTrainerAssigned) {
          throw new AppError(
            "You are not allowed to access this workout.",
            403,
          );
        }
      } else {
        throw new AppError(
          "You are not allowed to access this workout.",
          403,
        );
      }
    }

    return {
      ...workout,
      createdBy: workout.creator,
      exercises: workout.exercises.map((item) => ({
        ...item,
        exercise: item.exercise,
      })),
    };
  }

  async update(id: string, data: UpdateWorkoutDto, userId: string, role: Role) {
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    const creatorId = workout.createdBy ?? (workout as any).createdById;

    if (role !== Roles.ADMIN && creatorId !== userId) {
      throw new AppError("You are not allowed to access this workout.", 403);
    }

    if (data.exercises) {
      const exerciseIds = data.exercises.map((exercise) => exercise.exercise);

      const uniqueExercises = new Set(exerciseIds.map(String));

      if (uniqueExercises.size !== exerciseIds.length) {
        throw new AppError("Duplicate exercises are not allowed.", 400);
      }

      const orders = data.exercises.map((e) => e.order).sort((a, b) => a - b);

      const validOrder = orders.every((value, index) => value === index + 1);

      if (!validOrder) {
        throw new AppError(
          "Exercise order must start from 1 without gaps or duplicates.",
          400,
        );
      }

      const existingExercises = await prisma.exercise.findMany({
        where: {
          id: { in: exerciseIds },
          isActive: true,
        },
      });

      if (existingExercises.length !== exerciseIds.length) {
        throw new AppError("One or more exercises do not exist.", 400);
      }
    }

    if (data.title) {
      const existingWorkout = await prisma.workout.findFirst({
        where: {
          title: data.title,
          createdBy: creatorId,
          isActive: true,
          id: { not: id },
        },
      });

      if (existingWorkout) {
        throw new AppError("Workout already exists.", 409);
      }
    }

    const hasExistingUsage = Boolean(
      (await prisma.assignment.findFirst({
        where: { workoutId: id, isActive: true },
        select: { id: true },
      })) ||
        (await prisma.workoutSession.findFirst({
          where: { workoutId: id, isActive: true },
          select: { id: true },
        })) ||
        (await prisma.scheduledWorkout.findFirst({
          where: { workoutId: id, isActive: true },
          select: { id: true },
        })),
    );

    const isMember = role === Roles.MEMBER;

    // If this is a reusable template that has active assignments or sessions,
    // editing the template creates a new immutable version (v2, v3, ...)
    // so active assignments and scheduled workouts retain their original prescription.
    if (workout.isTemplate && hasExistingUsage) {
      const existingExercises = await prisma.workoutExercise.findMany({
        where: { workoutId: id },
        orderBy: { order: "asc" },
      });

      const updated = await prisma.$transaction(async (tx) => {
        // Demote the current workout from being the active template for future assignments
        await tx.workout.update({
          where: { id },
          data: { isTemplate: false },
        });

        // Create the new published template version
        const newVersionNumber = (workout.version ?? 1) + 1;
        const newTemplate = await tx.workout.create({
          data: {
            title: data.title ?? workout.title,
            description: data.description ?? workout.description,
            category: (data.category as any) ?? workout.category,
            difficulty: (data.difficulty as any) ?? workout.difficulty,
            estimatedDuration:
              data.estimatedDuration ?? workout.estimatedDuration,
            tags: data.tags ?? workout.tags,
            isTemplate: true,
            version: newVersionNumber,
            parentWorkoutId: workout.parentWorkoutId || workout.id,
            createdBy: creatorId,
            exercises: {
              create: data.exercises
                ? data.exercises.map((e) => ({
                    exerciseId: e.exercise,
                    sets: e.sets,
                    reps: e.reps,
                    targetWeight: e.targetWeight,
                    targetRpe: e.targetRpe,
                    restSeconds: e.restSeconds,
                    notes: e.notes,
                    order: e.order,
                  }))
                : existingExercises.map((e) => ({
                    exerciseId: e.exerciseId,
                    sets: e.sets,
                    reps: e.reps,
                    targetWeight: e.targetWeight,
                    targetRpe: e.targetRpe,
                    restSeconds: e.restSeconds,
                    notes: e.notes,
                    order: e.order,
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

        return newTemplate;
      });

      return {
        ...updated,
        exercises: updated.exercises.map((item) => ({
          ...item,
          exercise: item.exercise,
        })),
      };
    }

    // In-place update for workouts without active assignments or non-templates
    const updated = await prisma.$transaction(async (tx) => {
      if (data.exercises) {
        await tx.workoutExercise.deleteMany({
          where: { workoutId: id },
        });

        await tx.workoutExercise.createMany({
          data: data.exercises.map((e) => ({
            workoutId: id,
            exerciseId: e.exercise,
            sets: e.sets,
            reps: e.reps,
            targetWeight: e.targetWeight,
            targetRpe: e.targetRpe,
            restSeconds: e.restSeconds,
            notes: e.notes,
            order: e.order,
          })),
        });
      }

      return tx.workout.update({
        where: { id },
        data: {
          ...(data.title !== undefined && { title: data.title }),
          ...(data.description !== undefined && {
            description: data.description,
          }),
          ...(data.category !== undefined && { category: data.category as any }),
          ...(data.difficulty !== undefined && {
            difficulty: data.difficulty as any,
          }),
          ...(data.estimatedDuration !== undefined && {
            estimatedDuration: data.estimatedDuration,
          }),
          ...(data.tags !== undefined && { tags: data.tags }),
          ...(data.isTemplate !== undefined && !isMember && {
            isTemplate: data.isTemplate,
          }),
        },
        include: {
          exercises: {
            include: { exercise: true },
            orderBy: { order: "asc" },
          },
        },
      });
    });

    return {
      ...updated,
      exercises: updated.exercises.map((item) => ({
        ...item,
        exercise: item.exercise,
      })),
    };
  }

  async duplicate(id: string, userId: string, customTitle?: string) {
    const source = await this.getById(id, userId, Roles.MEMBER);

    const title = customTitle || `${source.title} (Personal Copy)`;

    const existing = await prisma.workout.findFirst({
      where: {
        title,
        createdBy: userId,
        isActive: true,
      },
    });

    const finalTitle = existing ? `${title} ${Date.now().toString().slice(-4)}` : title;

    const duplicated = await prisma.workout.create({
      data: {
        title: finalTitle,
        description: source.description || "",
        category: source.category as any,
        difficulty: source.difficulty as any,
        estimatedDuration: source.estimatedDuration,
        tags: source.tags || [],
        isTemplate: false,
        createdBy: userId,
        exercises: {
          create: source.exercises.map((e: any) => ({
            exerciseId: e.exerciseId || e.exercise?.id,
            sets: e.sets,
            reps: e.reps,
            restSeconds: e.restSeconds,
            notes: e.notes,
            order: e.order,
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

    return mapWorkout(duplicated);
  }

  async delete(id: string, userId: string, role: Role) {
    const workout = await prisma.workout.findFirst({
      where: {
        id,
        isActive: true,
      },
    });

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    const creatorId = workout.createdBy ?? (workout as any).createdById;

    if (role !== Roles.ADMIN && creatorId !== userId) {
      throw new AppError("You are not allowed to access this workout.", 403);
    }

    const activeAssignment = await prisma.assignment.findFirst({
      where: {
        workoutId: id,
        status: "ACTIVE",
        isActive: true,
      },
    });

    if (activeAssignment) {
      throw new AppError(
        "Cannot delete a workout that is assigned to members.",
        409,
      );
    }

    await prisma.workout.update({
      where: { id },
      data: { isActive: false },
    });
  }
}

export default new WorkoutService();
