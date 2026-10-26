import type { ParsedQs } from "qs";

import prisma from "../config/prisma.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";

import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

import type { FinishWorkoutSessionDto } from "../types/workout-session.types.js";
import mapWorkoutSession from "../mappers/workout-session.mapper.js";
import { Roles, type Role } from "../constants/roles.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import gamificationService from "./gamification.service.js";

class WorkoutSessionService {
  async start(
    memberId: string,
    assignmentId?: string,
    workoutIdInput?: string,
  ) {
    let resolvedWorkoutId = workoutIdInput;
    let assignment: any = null;

    if (assignmentId) {
      assignment = await prisma.assignment.findFirst({
        where: {
          id: assignmentId,
          isActive: true,
        },
        include: {
          member: { select: { id: true, name: true } },
          trainer: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      });

      if (!assignment) {
        throw new AppError("Assignment not found.", 404);
      }

      if (assignment.memberId !== memberId) {
        throw new AppError(
          "You are not allowed to start this assignment.",
          403,
        );
      }

      if (assignment.status !== ASSIGNMENT_STATUS.ACTIVE) {
        throw new AppError("Assignment is not active.", 400);
      }

      resolvedWorkoutId = assignment.workoutId;
    }

    if (!resolvedWorkoutId) {
      throw new AppError("No workout specified for session.", 400);
    }

    const activeSession = await prisma.workoutSession.findFirst({
      where: {
        memberId,
        status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        isActive: true,
      },
      include: {
        workout: { select: { id: true, title: true } },
        assignment: { select: { id: true, workout: { select: { id: true, title: true } } } },
      },
    });

    if (activeSession) {
      const activeWorkoutId = activeSession.workoutId || activeSession.assignment?.workout?.id;
      const activeWorkoutTitle = activeSession.workout?.title || activeSession.assignment?.workout?.title || "Workout Session";
      throw new AppError("You already have an active workout session.", 409, {
        activeSessionId: activeSession.id,
        activeWorkoutId,
        activeWorkoutTitle,
      });
    }

    const workout = await prisma.workout.findUnique({
      where: { id: resolvedWorkoutId },
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

    if (!workout || !workout.isActive) {
      throw new AppError("Workout not found.", 404);
    }

    // Authorization check for independent workout start
    if (!assignment && workout.createdBy !== memberId && !workout.isTemplate) {
      // Check if user is a member with an active assignment for this workout
      const memberAssignment = await prisma.assignment.findFirst({
        where: {
          workoutId: workout.id,
          memberId,
          status: ASSIGNMENT_STATUS.ACTIVE,
          isActive: true,
        },
        include: {
          member: { select: { id: true, name: true } },
          trainer: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      });

      if (memberAssignment) {
        assignment = memberAssignment;
      } else {
        // Check if member previously completed this workout and is repeating it
        const previousSession = await prisma.workoutSession.findFirst({
          where: {
            memberId,
            status: WORKOUT_SESSION_STATUS.COMPLETED,
            isActive: true,
            OR: [
              { workoutId: workout.id },
              { assignment: { workoutId: workout.id } },
            ],
          },
        });

        if (!previousSession) {
          throw new AppError("You are not allowed to access this workout.", 403);
        }
      }
    }

    const session = await prisma.$transaction(async (tx) => {
      const createdSession = await tx.workoutSession.create({
        data: {
          memberId,
          assignmentId: assignment?.id || null,
          workoutId: workout.id,
          status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        },
        include: {
          workout: {
            include: {
              exercises: {
                include: { exercise: true },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      for (const item of workout.exercises) {
        const exerciseLog = await tx.workoutExerciseLog.create({
          data: {
            sessionId: createdSession.id,
            exerciseId: item.exerciseId,
            exerciseName: item.exercise.name,
            targetSets: item.sets,
            targetReps: item.reps,
            order: item.order,
          },
        });

        for (let setIndex = 0; setIndex < item.sets; setIndex++) {
          await tx.workoutSetLog.create({
            data: {
              exerciseLogId: exerciseLog.id,
              setNumber: setIndex + 1,
              targetReps: item.reps,
            },
          });
        }
      }

      return createdSession;
    });

    if (assignment) {
      await notificationService.create({
        user: assignment.trainerId,
        title: "Workout Started",
        message: `${assignment.member?.name || "Member"} started "${assignment.workout?.title || "Workout"}".`,
        type: NOTIFICATION_TYPE.WORKOUT_STARTED,
        actionUrl: `/workout-sessions/${session.id}`,
        metadata: {
          sessionId: session.id,
          assignmentId: assignment.id,
        },
      });
    }

    return mapWorkoutSession(session);
  }

  async getCurrent(memberId: string) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        memberId,
        status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        isActive: true,
      },
      include: {
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            workout: {
              include: {
                exercises: {
                  include: { exercise: true },
                  orderBy: { order: "asc" },
                },
              },
            },
            trainer: {
              select: { id: true, name: true, email: true },
            },
            member: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!session) {
      return null;
    }

    const exerciseLogs = await prisma.workoutExerciseLog.findMany({
      where: {
        sessionId: session.id,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return {
      session: mapWorkoutSession(session, exerciseLogs),
      exerciseLogs,
    };
  }

  async finish(
    sessionId: string,
    memberId: string,
    data: FinishWorkoutSessionDto,
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId,
        isActive: true,
      },
      include: {
        workout: true,
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    // Idempotent completion check (handles retries safely)
    if (session.status === WORKOUT_SESSION_STATUS.COMPLETED) {
      return mapWorkoutSession(session);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session is not in progress.", 400);
    }

    const endedAt = new Date();
    const duration = Math.round(
      (endedAt.getTime() - session.startedAt.getTime()) / 60000,
    );
    const activeTrainingTime = Math.max(
      0,
      duration * 60 - session.totalRestTime,
    );

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        duration,
        activeTrainingTime,
        status: WORKOUT_SESSION_STATUS.COMPLETED,
        notes: data.notes ?? session.notes,
      },
      include: {
        workout: true,
      },
    });

    // Mark any linked scheduled workouts as COMPLETED
    await prisma.scheduledWorkout.updateMany({
      where: {
        sessionId: updatedSession.id,
        status: { in: ["SCHEDULED", "RESCHEDULED"] },
      },
      data: {
        status: "COMPLETED",
      },
    });

    const workoutTitle = session.workout?.title || "Workout";

    if (session.assignmentId) {
      const assignment = await prisma.assignment.findUnique({
        where: { id: session.assignmentId },
        include: {
          member: { select: { id: true, name: true } },
          trainer: { select: { id: true, name: true } },
          workout: { select: { id: true, title: true } },
        },
      });

      if (assignment) {
        await notificationService.create({
          user: assignment.trainerId,
          title: "Workout Completed",
          message: `${assignment.member.name} completed "${assignment.workout?.title || workoutTitle}" in ${duration} minutes.`,
          type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
          actionUrl: `/workout-sessions/${updatedSession.id}`,
          metadata: {
            sessionId: updatedSession.id,
            assignmentId: assignment.id,
          },
        });

        await notificationService.create({
          user: assignment.memberId,
          title: "Workout Completed",
          message: `Great job! You completed "${assignment.workout?.title || workoutTitle}".`,
          type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
          actionUrl: `/workout-sessions/${updatedSession.id}`,
          metadata: {
            sessionId: updatedSession.id,
            assignmentId: assignment.id,
          },
        });
      }
    } else {
      // Independent member completion notification
      await notificationService.create({
        user: memberId,
        title: "Workout Completed",
        message: `Great job! You completed "${workoutTitle}" in ${duration} minutes.`,
        type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
        actionUrl: `/workout-sessions/${updatedSession.id}`,
        metadata: {
          sessionId: updatedSession.id,
        },
      });
    }

    // Trigger asynchronous gamification and milestone evaluation
    try {
      gamificationService.evaluateUserAchievements(memberId).catch(() => {});
    } catch {
      // Safe fallback
    }

    return mapWorkoutSession(updatedSession);
  }

  async cancel(sessionId: string, memberId: string, reason?: string) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId,
        isActive: true,
      },
      include: {
        workout: true,
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Only in-progress workout sessions can be cancelled.", 400);
    }

    const endedAt = new Date();
    const duration = Math.round(
      (endedAt.getTime() - session.startedAt.getTime()) / 60000,
    );

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        status: WORKOUT_SESSION_STATUS.CANCELLED,
        endedAt,
        duration,
        notes: reason
          ? `${session.notes ? session.notes + " | " : ""}Abandoned: ${reason}`
          : session.notes || "Abandoned by user",
      },
      include: {
        workout: true,
      },
    });

    return mapWorkoutSession(updatedSession);
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    const filter: any = {
      isActive: true,
    };

    if (role === Roles.MEMBER) {
      filter.memberId = userId;
    }

    if (role === Roles.TRAINER) {
      filter.assignment = {
        trainerId: userId,
        isActive: true,
      };
    }

    const normalizedQuery: Record<string, any> = { ...query };
    if (normalizedQuery.member) {
      normalizedQuery.memberId = normalizedQuery.member;
      delete normalizedQuery.member;
    }
    if (normalizedQuery.assignment) {
      normalizedQuery.assignmentId = normalizedQuery.assignment;
      delete normalizedQuery.assignment;
    }

    const allowedFilters =
      role === Roles.ADMIN ? ["status", "memberId", "assignmentId"] : ["status"];

    const features = new ApiFeatures(filter, normalizedQuery)
      .filter(allowedFilters)
      .sort()
      .paginate();

    const sessions = await prisma.workoutSession.findMany({
      where: features.prismaWhere,
      orderBy: features.prismaOrderBy,
      skip: features.prismaSkip,
      take: features.prismaTake,
      include: {
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            workout: {
              include: {
                exercises: {
                  include: { exercise: true },
                  orderBy: { order: "asc" },
                },
              },
            },
            trainer: {
              select: { id: true, name: true, email: true },
            },
            member: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    return sessions.map((session) => mapWorkoutSession(session));
  }

  async getById(id: string, userId: string, role: Role) {
    const filter: any = {
      id,
      isActive: true,
    };

    if (role === Roles.MEMBER) {
      filter.memberId = userId;
    }

    if (role === Roles.TRAINER) {
      filter.OR = [
        { assignment: { trainerId: userId, isActive: true } },
        { memberId: userId },
      ];
    }

    const session = await prisma.workoutSession.findFirst({
      where: filter,
      include: {
        workout: {
          include: {
            exercises: {
              include: { exercise: true },
              orderBy: { order: "asc" },
            },
          },
        },
        assignment: {
          include: {
            workout: {
              include: {
                exercises: {
                  include: { exercise: true },
                  orderBy: { order: "asc" },
                },
              },
            },
            trainer: {
              select: { id: true, name: true, email: true },
            },
            member: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exerciseLogs = await prisma.workoutExerciseLog.findMany({
      where: {
        sessionId: session.id,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
      orderBy: { order: "asc" },
    });

    return {
      session: mapWorkoutSession(session, exerciseLogs),
      exerciseLogs,
    };
  }

  async getPreviousPerformanceForSession(
    sessionId: string,
    memberId: string,
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId,
        isActive: true,
      },
      include: {
        exerciseLogs: {
          select: {
            exerciseId: true,
          },
        },
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exerciseIds = Array.from(
      new Set(
        session.exerciseLogs.map((log) => log.exerciseId).filter(Boolean),
      ),
    );

    return this.getPreviousPerformanceForExercises(
      exerciseIds,
      memberId,
      sessionId,
    );
  }

  async getPreviousPerformanceForExercises(
    exerciseIds: string[],
    memberId: string,
    excludeSessionId?: string,
  ) {
    if (!exerciseIds || exerciseIds.length === 0) {
      return {};
    }

    const logs = await prisma.workoutExerciseLog.findMany({
      where: {
        exerciseId: { in: exerciseIds },
        session: {
          memberId,
          status: WORKOUT_SESSION_STATUS.COMPLETED,
          isActive: true,
          ...(excludeSessionId ? { id: { not: excludeSessionId } } : {}),
        },
      },
      include: {
        session: {
          select: {
            id: true,
            startedAt: true,
            endedAt: true,
            workout: { select: { title: true } },
            assignment: { select: { workout: { select: { title: true } } } },
          },
        },
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
      orderBy: {
        session: {
          endedAt: "desc",
        },
      },
    });

    const performanceMap: Record<
      string,
      {
        sessionId: string;
        sessionDate: Date | null;
        workoutTitle: string;
        totalVolume: number;
        maxWeight: number;
        totalReps: number;
        sets: Array<{
          setNumber: number;
          actualReps: number;
          weight: number;
          restDuration?: number;
          completed: boolean;
        }>;
      } | null
    > = {};

    for (const id of exerciseIds) {
      performanceMap[id] = null;
    }

    for (const log of logs) {
      if (!log.exerciseId) continue;
      if (!performanceMap[log.exerciseId]) {
        const workoutTitle =
          log.session.workout?.title ||
          log.session.assignment?.workout?.title ||
          "Completed Session";

        const completedSets = log.sets
          .filter((s) => s.completed)
          .map((s) => ({
            setNumber: s.setNumber,
            actualReps: s.actualReps,
            weight: s.weight,
            restDuration: s.restDuration,
            completed: s.completed,
          }));

        const totalVolume = completedSets.reduce(
          (sum, s) => sum + (s.weight || 0) * (s.actualReps || 0),
          0,
        );
        const maxWeight = completedSets.reduce(
          (max, s) => Math.max(max, s.weight || 0),
          0,
        );
        const totalReps = completedSets.reduce(
          (sum, s) => sum + (s.actualReps || 0),
          0,
        );

        performanceMap[log.exerciseId] = {
          sessionId: log.session.id,
          sessionDate: log.session.endedAt || log.session.startedAt,
          workoutTitle,
          totalVolume,
          maxWeight,
          totalReps,
          sets: completedSets,
        };
      }
    }

    return performanceMap;
  }
}

export default new WorkoutSessionService();
