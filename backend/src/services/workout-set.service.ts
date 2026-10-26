import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

import type { CreateWorkoutSetDto, UpdateWorkoutSetDto } from "../types/workout-set.types.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

class WorkoutSetService {
  private async updateSessionStats(sessionId: string) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) return;

    const exerciseLogs = await prisma.workoutExerciseLog.findMany({
      where: { sessionId: session.id },
      select: { id: true, completed: true },
    });

    const exerciseLogIds = exerciseLogs.map((e) => e.id);
    const totalExercises = exerciseLogs.length;
    const completedExercises = exerciseLogs.filter((e) => e.completed).length;

    const sets = await prisma.workoutSetLog.findMany({
      where: {
        exerciseLogId: { in: exerciseLogIds },
        completed: true,
      },
      select: {
        weight: true,
        actualReps: true,
        restDuration: true,
      },
    });

    const totalVolume = sets.reduce(
      (sum, s) => sum + s.weight * s.actualReps,
      0,
    );
    const totalRestTime = sets.reduce(
      (sum, s) => sum + s.restDuration,
      0,
    );
    const setsCompleted = sets.length;

    const progress =
      totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    await prisma.workoutSession.update({
      where: { id: sessionId },
      data: {
        totalVolume,
        progress,
        exercisesCompleted: completedExercises,
        setsCompleted,
        totalRestTime,
      },
    });
  }

  async create(data: CreateWorkoutSetDto, memberId: string) {
    const exerciseLog = await prisma.workoutExerciseLog.findUnique({
      where: { id: data.exerciseLog },
      include: {
        session: true,
      },
    });

    if (!exerciseLog) {
      throw new AppError("Exercise log not found.", 404);
    }

    if (!exerciseLog.session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (exerciseLog.session.memberId !== memberId) {
      throw new AppError("Unauthorized.", 403);
    }

    if (exerciseLog.session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    const existingSet = await prisma.workoutSetLog.findFirst({
      where: {
        exerciseLogId: exerciseLog.id,
        setNumber: data.setNumber,
      },
    });

    if (existingSet) {
      throw new AppError("This set already exists.", 409);
    }

    const setLog = await prisma.workoutSetLog.create({
      data: {
        exerciseLogId: data.exerciseLog,
        setNumber: data.setNumber,
        targetReps: String(data.targetReps),
        actualReps: data.actualReps,
        weight: data.weight,
        startedAt: new Date(),
        completedAt: new Date(),
        completed: true,
      },
    });

    const completedSets = await prisma.workoutSetLog.count({
      where: {
        exerciseLogId: data.exerciseLog,
        completed: true,
      },
    });

    if (completedSets >= exerciseLog.targetSets) {
      await prisma.workoutExerciseLog.update({
        where: { id: exerciseLog.id },
        data: { completed: true },
      });
    }

    await this.updateSessionStats(exerciseLog.sessionId);

    return setLog;
  }

  async update(id: string, memberId: string, data: UpdateWorkoutSetDto) {
    const setLog = await prisma.workoutSetLog.findUnique({
      where: { id },
      include: {
        exerciseLog: {
          include: {
            session: true,
          },
        },
      },
    });

    if (!setLog) {
      throw new AppError("Workout set not found.", 404);
    }

    const exerciseLog = setLog.exerciseLog;

    if (!exerciseLog) {
      throw new AppError("Exercise log not found.", 404);
    }

    const session = exerciseLog.session;

    if (!session || session.memberId !== memberId) {
      throw new AppError("Unauthorized.", 403);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    const isCompleted =
      data.completed !== undefined ? data.completed : true;

    const updatedSetLog = await prisma.workoutSetLog.update({
      where: { id },
      data: {
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.actualReps !== undefined && { actualReps: data.actualReps }),
        ...(data.restDuration !== undefined && { restDuration: data.restDuration }),
        completed: isCompleted,
        completedAt: isCompleted ? (setLog.completedAt ?? new Date()) : null,
      },
    });

    const completedSets = await prisma.workoutSetLog.count({
      where: {
        exerciseLogId: exerciseLog.id,
        completed: true,
      },
    });

    const isExerciseCompleted = completedSets >= exerciseLog.targetSets;
    await prisma.workoutExerciseLog.update({
      where: { id: exerciseLog.id },
      data: { completed: isExerciseCompleted },
    });

    await this.updateSessionStats(session.id);

    return updatedSetLog;
  }
}

export default new WorkoutSetService();
