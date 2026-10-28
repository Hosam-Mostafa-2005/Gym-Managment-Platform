import type { ParsedQs } from "qs";

import prisma from "../config/prisma.js";
import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";

import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

import type {
  FinishWorkoutSessionDto,
  ReviewWorkoutSessionDto,
  SwapExerciseDto,
  AddExerciseToSessionDto,
} from "../types/workout-session.types.js";
import mapWorkoutSession from "../mappers/workout-session.mapper.js";
import { Roles, type Role } from "../constants/roles.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
import gamificationService from "./gamification.service.js";
import coachAccessService from "./coach-access.service.js";

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
            targetWeight: item.targetWeight,
            targetRpe: item.targetRpe,
            restSeconds: item.restSeconds ?? 60,
            order: item.order,
            setsDetail: (item as any).setsDetail ?? null,
          },
        });

        const setsDetail = (item as any).setsDetail;
        const hasSetsDetail = Array.isArray(setsDetail) && setsDetail.length > 0;

        if (hasSetsDetail) {
          for (let setIdx = 0; setIdx < setsDetail.length; setIdx++) {
            const setCfg = setsDetail[setIdx];
            const setNumber = setCfg.setNumber ?? (setIdx + 1);
            const setType = setCfg.setType ?? "NORMAL";
            const stages = setCfg.stages;

            if (Array.isArray(stages) && stages.length > 0) {
              for (let sIdx = 0; sIdx < stages.length; sIdx++) {
                const stage = stages[sIdx];
                const isIntermediate = sIdx < stages.length - 1;
                const isFinal = sIdx === stages.length - 1;
                const targetReps =
                  stage.targetReps !== undefined && stage.targetReps !== null
                    ? String(stage.targetReps)
                    : (setCfg.targetReps !== undefined && setCfg.targetReps !== null
                        ? String(setCfg.targetReps)
                        : item.reps);
                const weight =
                  stage.targetWeight !== undefined && stage.targetWeight !== null
                    ? Number(stage.targetWeight)
                    : (setCfg.targetWeight !== undefined && setCfg.targetWeight !== null
                        ? Number(setCfg.targetWeight)
                        : (item.targetWeight ?? 0));

                await tx.workoutSetLog.create({
                  data: {
                    exerciseLogId: exerciseLog.id,
                    setNumber,
                    segmentIndex: stage.segmentIndex ?? sIdx,
                    setType,
                    isIntermediateSegment: isIntermediate,
                    isFinalSegment: isFinal,
                    targetReps,
                    weight,
                  },
                });
              }
            } else {
              const targetReps =
                setCfg.targetReps !== undefined && setCfg.targetReps !== null
                  ? String(setCfg.targetReps)
                  : item.reps;
              const weight =
                setCfg.targetWeight !== undefined && setCfg.targetWeight !== null
                  ? Number(setCfg.targetWeight)
                  : (item.targetWeight ?? 0);

              await tx.workoutSetLog.create({
                data: {
                  exerciseLogId: exerciseLog.id,
                  setNumber,
                  segmentIndex: 0,
                  setType,
                  isIntermediateSegment: false,
                  isFinalSegment: true,
                  targetReps,
                  weight,
                },
              });
            }
          }
        } else {
          for (let setIndex = 0; setIndex < item.sets; setIndex++) {
            await tx.workoutSetLog.create({
              data: {
                exerciseLogId: exerciseLog.id,
                setNumber: setIndex + 1,
                segmentIndex: 0,
                setType: "NORMAL",
                isIntermediateSegment: false,
                isFinalSegment: true,
                targetReps: item.reps,
                weight: item.targetWeight ?? 0,
              },
            });
          }
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
          orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
        },
      },
      orderBy: { order: "asc" },
    });

    const enrichedLogs = await this.attachPreviousBestSets(
      memberId,
      session.id,
      exerciseLogs,
    );

    return {
      session: mapWorkoutSession(session, enrichedLogs),
      exerciseLogs: enrichedLogs,
    };
  }

  private async attachPreviousBestSets(
    memberId: string,
    currentSessionId: string,
    exerciseLogs: any[],
  ) {
    const exerciseIds = exerciseLogs
      .map((l) => l.exerciseId || l.exercise?.id)
      .filter(Boolean);

    if (exerciseIds.length === 0) return exerciseLogs;

    const priorCompletedSets = await prisma.workoutSetLog.findMany({
      where: {
        completed: true,
        weight: { gt: 0 },
        exerciseLog: {
          exerciseId: { in: exerciseIds },
          session: {
            memberId,
            status: WORKOUT_SESSION_STATUS.COMPLETED,
            id: { not: currentSessionId },
            isActive: true,
          },
        },
      },
      select: {
        weight: true,
        actualReps: true,
        completedAt: true,
        exerciseLog: {
          select: {
            exerciseId: true,
          },
        },
      },
      orderBy: [{ weight: "desc" }, { actualReps: "desc" }],
    });

    const bestSetsByExerciseId: Record<
      string,
      { weight: number; actualReps: number; completedAt: Date | null }
    > = {};

    for (const s of priorCompletedSets) {
      const exId = s.exerciseLog.exerciseId;
      if (!bestSetsByExerciseId[exId]) {
        bestSetsByExerciseId[exId] = {
          weight: s.weight,
          actualReps: s.actualReps,
          completedAt: s.completedAt,
        };
      }
    }

    const originalIds = exerciseLogs
      .map((l) => l.originalExerciseId)
      .filter(Boolean) as string[];

    const originalMap: Record<
      string,
      { id: string; name: string; imageUrl?: string | null }
    > = {};
    if (originalIds.length > 0) {
      const originals = await prisma.exercise.findMany({
        where: { id: { in: originalIds } },
        select: { id: true, name: true, imageUrl: true },
      });
      for (const orig of originals) {
        originalMap[orig.id] = orig;
      }
    }

    return exerciseLogs.map((log) => ({
      ...log,
      originalExercise: log.originalExerciseId
        ? originalMap[log.originalExerciseId] || null
        : null,
      previousBestSet:
        bestSetsByExerciseId[log.exerciseId || log.exercise?.id] || null,
    }));
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

    const sessionRpe =
      typeof data.sessionRpe === "number" &&
      data.sessionRpe >= 1 &&
      data.sessionRpe <= 10
        ? Math.round(data.sessionRpe)
        : null;

    const updatedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        endedAt,
        duration,
        activeTrainingTime,
        status: WORKOUT_SESSION_STATUS.COMPLETED,
        notes: data.notes ?? session.notes,
        ...(sessionRpe !== null && { sessionRpe }),
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

    const normalizedQuery: Record<string, any> = { ...query };
    if (normalizedQuery.member) {
      normalizedQuery.memberId = normalizedQuery.member;
      delete normalizedQuery.member;
    }
    if (normalizedQuery.assignment) {
      normalizedQuery.assignmentId = normalizedQuery.assignment;
      delete normalizedQuery.assignment;
    }

    if (role === Roles.TRAINER) {
      if (normalizedQuery.memberId) {
        const access = await coachAccessService.verifyAccess(
          userId,
          normalizedQuery.memberId,
          role,
          { throwError: false },
        );
        if (!access.isAuthorized) {
          filter.id = "unauthorized_scope";
        } else if (access.canAccessHistory) {
          filter.memberId = normalizedQuery.memberId;
        } else if (access.relationshipStartDate) {
          filter.memberId = normalizedQuery.memberId;
          filter.startedAt = { gte: access.relationshipStartDate };
        } else {
          filter.memberId = normalizedQuery.memberId;
          filter.assignment = { trainerId: userId, isActive: true };
        }
      } else {
        filter.assignment = { trainerId: userId, isActive: true };
      }
    }

    const allowedFilters =
      role === Roles.ADMIN ? ["status", "memberId", "assignmentId"] : ["status", "memberId"];

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
        member: {
          select: { id: true, name: true, email: true },
        },
        coachReviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return sessions.map((session) => mapWorkoutSession(session));
  }

  async getById(id: string, userId: string, role: Role) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id,
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
        member: {
          select: { id: true, name: true, email: true },
        },
        coachReviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (role === Roles.MEMBER && session.memberId !== userId) {
      throw new AppError("Workout session not found.", 404);
    }

    if (role === Roles.TRAINER) {
      const isAllowed = await coachAccessService.canCoachAccessSession(
        userId,
        session,
        role,
      );
      if (!isAllowed) {
        throw new AppError("Workout session not found.", 404);
      }
    }

    const exerciseLogs = await prisma.workoutExerciseLog.findMany({
      where: {
        sessionId: session.id,
      },
      include: {
        exercise: true,
        sets: {
          orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
        },
      },
      orderBy: { order: "asc" },
    });

    const enrichedLogs = await this.attachPreviousBestSets(
      session.memberId,
      session.id,
      exerciseLogs,
    );

    return {
      session: mapWorkoutSession(session, enrichedLogs),
      exerciseLogs: enrichedLogs,
    };
  }

  async review(
    sessionId: string,
    coachId: string,
    role: Role,
    data: ReviewWorkoutSessionDto,
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        isActive: true,
      },
      include: {
        assignment: true,
        member: { select: { id: true, name: true, email: true } },
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.COMPLETED) {
      throw new AppError(
        "Only completed workout sessions can be reviewed.",
        400,
      );
    }

    const isAuthorized = await coachAccessService.canCoachAccessSession(
      coachId,
      session,
      role,
    );

    if (!isAuthorized) {
      throw new AppError(
        "You are not authorized to review this workout session.",
        403,
      );
    }

    const coach = await prisma.user.findUnique({
      where: { id: coachId },
      select: { name: true },
    });

    const reviewedSession = await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        coachFeedback: data.feedback.trim(),
        coachReviewedAt: new Date(),
        coachReviewedById: coachId,
      },
      include: {
        workout: true,
        assignment: true,
        member: { select: { id: true, name: true, email: true } },
        coachReviewedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    try {
      await notificationService.create({
        user: session.memberId,
        title: "Coach Feedback on Your Workout",
        message: `${coach?.name || "Your Coach"} reviewed your workout session and left feedback.`,
        type: NOTIFICATION_TYPE.COACH_ENCOURAGEMENT,
        category: "COACHING" as any,
        priority: "HIGH",
        actionUrl: `/sessions/${sessionId}`,
        metadata: {
          sessionId,
          coachId,
        },
      });
    } catch {
      // Do not block review if notification delivery fails
    }

    return mapWorkoutSession(reviewedSession);
  }

  async swapExercise(
    sessionId: string,
    exerciseLogId: string,
    userId: string,
    data: SwapExerciseDto,
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId: userId,
        status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        isActive: true,
      },
    });

    if (!session) {
      throw new AppError(
        "Active workout session not found or you are not authorized to modify it.",
        404,
      );
    }

    const exerciseLog = await prisma.workoutExerciseLog.findFirst({
      where: {
        id: exerciseLogId,
        sessionId: session.id,
      },
      include: {
        sets: {
          orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
        },
      },
    });

    if (!exerciseLog) {
      throw new AppError("Exercise log not found in this session.", 404);
    }

    if (exerciseLog.exerciseId === data.newExerciseId) {
      throw new AppError(
        "Replacement exercise must be different from current exercise.",
        400,
      );
    }

    const newExercise = await prisma.exercise.findFirst({
      where: {
        id: data.newExerciseId,
        isActive: true,
      },
      include: {
        memberAccess: {
          where: {
            memberId: userId,
            isActive: true,
          },
        },
      },
    });

    if (!newExercise) {
      throw new AppError("Replacement exercise not found.", 404);
    }

    if (
      newExercise.isCustom &&
      newExercise.createdById !== userId &&
      newExercise.memberAccess.length === 0
    ) {
      throw new AppError("You do not have access to this custom exercise.", 403);
    }

    const originalExerciseId =
      exerciseLog.originalExerciseId || exerciseLog.exerciseId;
    const reasonText = data.notes?.trim()
      ? `${data.reason}: ${data.notes.trim()}`
      : data.reason;

    await prisma.$transaction(async (tx) => {
      // 1. Reset pre-filled weights on uncompleted sets to 0 (since load was for previous movement)
      await tx.workoutSetLog.updateMany({
        where: {
          exerciseLogId: exerciseLog.id,
          completed: false,
        },
        data: {
          weight: 0,
        },
      });

      // 2. Update exerciseLog with new exercise and swap tracking
      await tx.workoutExerciseLog.update({
        where: { id: exerciseLog.id },
        data: {
          exerciseId: newExercise.id,
          exerciseName: newExercise.name,
          originalExerciseId,
          swapReason: reasonText,
          targetWeight: null,
          targetRpe: null,
        },
      });
    });

    return this.getCurrent(userId);
  }

    async addExercise(
    sessionId: string,
    userId: string,
    data: AddExerciseToSessionDto,
  ) {
    const session = await prisma.workoutSession.findFirst({
      where: {
        id: sessionId,
        memberId: userId,
        status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
        isActive: true,
      },
    });

    if (!session) {
      throw new AppError(
        "Active workout session not found or you are not authorized to modify it.",
        404,
      );
    }

    const exercise = await prisma.exercise.findFirst({
      where: {
        id: data.exerciseId,
        isActive: true,
      },
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }

    const existingLogsCount = await prisma.workoutExerciseLog.count({
      where: { sessionId: session.id },
    });
    const nextOrder = existingLogsCount + 1;

    const targetSets = data.targetSets ?? 3;
    const targetRepsNum = typeof data.targetReps === "number" ? data.targetReps : 10;
    const targetRepsStr = String(data.targetReps ?? 10);
    const targetWeight = data.targetWeight ?? 0;
    const restTimeSeconds = data.restTimeSeconds ?? 60;

    await prisma.$transaction(async (tx) => {
      const createdLog = await tx.workoutExerciseLog.create({
        data: {
          sessionId: session.id,
          exerciseId: exercise.id,
          exerciseName: exercise.name,
          order: nextOrder,
          targetSets,
          targetReps: targetRepsStr,
          targetWeight,
          restTimeSeconds,
          restSeconds: restTimeSeconds,
          notes: data.notes ?? null,
          completed: false,
          isActive: true,
        },
      });

      const setLogs = Array.from({ length: targetSets }).map((_, idx) => ({
        exerciseLogId: createdLog.id,
        setNumber: idx + 1,
        segmentIndex: 0,
        setType: "NORMAL",
        isIntermediateSegment: false,
        isFinalSegment: true,
        targetReps: targetRepsStr,
        actualReps: targetRepsNum,
        weight: targetWeight,
        completed: false,
        isActive: true,
      }));

      await tx.workoutSetLog.createMany({
        data: setLogs,
      });
    });

    return this.getCurrent(userId);
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
          orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
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
        bestSet?: { weight: number; actualReps: number } | null;
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

        let bestSet: { weight: number; actualReps: number } | null = null;
        if (completedSets.length > 0) {
          const sorted = [...completedSets].sort((a, b) => {
            if (b.weight !== a.weight) return b.weight - a.weight;
            return b.actualReps - a.actualReps;
          });
          if (sorted[0].weight > 0) {
            bestSet = { weight: sorted[0].weight, actualReps: sorted[0].actualReps };
          }
        }

        performanceMap[log.exerciseId] = {
          sessionId: log.session.id,
          sessionDate: log.session.endedAt || log.session.startedAt,
          workoutTitle,
          totalVolume,
          maxWeight,
          totalReps,
          bestSet,
          sets: completedSets,
        };
      }
    }

    return performanceMap;
  }
}

export default new WorkoutSessionService();
