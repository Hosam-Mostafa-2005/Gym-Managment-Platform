import prisma from "../config/prisma.js";
import AppError from "../utils/AppError.js";

import type { CreateWorkoutSetDto, UpdateWorkoutSetDto } from "../types/workout-set.types.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

class WorkoutSetService {
  private async evaluateExerciseCompletion(
    exerciseLogId: string,
    targetSets: number,
  ): Promise<boolean> {
    const allSets = await prisma.workoutSetLog.findMany({
      where: { exerciseLogId },
      select: { setNumber: true, completed: true },
    });

    if (allSets.length === 0) return false;

    // Group by parent setNumber
    const setsByNumber = new Map<number, boolean[]>();
    for (const s of allSets) {
      if (!setsByNumber.has(s.setNumber)) {
        setsByNumber.set(s.setNumber, []);
      }
      setsByNumber.get(s.setNumber)!.push(s.completed);
    }

    // A parent set is complete ONLY when ALL its segments/stages are completed
    let completedParentSets = 0;
    for (const stages of setsByNumber.values()) {
      if (stages.length > 0 && stages.every((c) => c === true)) {
        completedParentSets++;
      }
    }

    const totalParentSetsCount = setsByNumber.size;

    // Exercise is completed ONLY when:
    // 1. All existing sets currently in the exercise are completed (no uncompleted sets remain)
    // 2. AND total completed sets satisfies the prescribed targetSets requirement.
    // Deleting incomplete sets will NEVER cause an incomplete exercise to be falsely marked completed!
    return (
      totalParentSetsCount >= targetSets &&
      completedParentSets === totalParentSetsCount
    );
  }

  private async updateSessionStats(sessionId: string) {
    const session = await prisma.workoutSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) return;

    const exerciseLogs = await prisma.workoutExerciseLog.findMany({
      where: { sessionId: session.id },
      select: { id: true, completed: true, targetSets: true },
    });

    const exerciseLogIds = exerciseLogs.map((e) => e.id);
    const totalExercises = exerciseLogs.length;
    const completedExercises = exerciseLogs.filter((e) => e.completed).length;

    const allSets = await prisma.workoutSetLog.findMany({
      where: {
        exerciseLogId: { in: exerciseLogIds },
      },
      select: {
        exerciseLogId: true,
        setNumber: true,
        completed: true,
        weight: true,
        actualReps: true,
        restDuration: true,
      },
    });

    const completedSetLogs = allSets.filter((s) => s.completed);

    // Sum total volume across all completed stages
    const totalVolume = completedSetLogs.reduce(
      (sum, s) => sum + (s.weight ?? 0) * (s.actualReps ?? 0),
      0,
    );

    const totalRestTime = completedSetLogs.reduce(
      (sum, s) => sum + (s.restDuration ?? 0),
      0,
    );

    // Count completed parent sets without double-counting stages
    const parentSets = new Map<string, boolean[]>();
    for (const s of allSets) {
      const key = `${s.exerciseLogId}_${s.setNumber}`;
      if (!parentSets.has(key)) {
        parentSets.set(key, []);
      }
      parentSets.get(key)!.push(s.completed);
    }

    let setsCompleted = 0;
    for (const stages of parentSets.values()) {
      if (stages.length > 0 && stages.every((c) => c === true)) {
        setsCompleted++;
      }
    }

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

    const segmentIndex = data.segmentIndex ?? 0;

    const existingSet = await prisma.workoutSetLog.findFirst({
      where: {
        exerciseLogId: exerciseLog.id,
        setNumber: data.setNumber,
        segmentIndex,
      },
    });

    if (existingSet) {
      throw new AppError("This set segment already exists.", 409);
    }

    // If adding a subsequent stage to an existing set (e.g. segmentIndex > 0),
    // ensure previous stages of this set are marked intermediate and inherit advanced setType
    if (segmentIndex > 0) {
      await prisma.workoutSetLog.updateMany({
        where: {
          exerciseLogId: exerciseLog.id,
          setNumber: data.setNumber,
          segmentIndex: { lt: segmentIndex },
        },
        data: {
          isIntermediateSegment: true,
          isFinalSegment: false,
          setType: (data.setType as any) ?? "DROP_SET",
        },
      });
    }

    const isCompleted = data.completed ?? false;

    const setLog = await prisma.workoutSetLog.create({
      data: {
        exerciseLogId: data.exerciseLog,
        setNumber: data.setNumber,
        targetReps: data.targetReps !== undefined ? String(data.targetReps) : "0",
        actualReps: data.actualReps ?? 0,
        weight: data.weight ?? 0,
        setType: data.setType ?? "NORMAL",
        segmentIndex,
        isIntermediateSegment: data.isIntermediateSegment ?? false,
        isFinalSegment: data.isFinalSegment ?? true,
        startedAt: new Date(),
        completedAt: isCompleted ? new Date() : null,
        completed: isCompleted,
      },
    });

    const isExerciseCompleted = await this.evaluateExerciseCompletion(
      exerciseLog.id,
      exerciseLog.targetSets,
    );

    await prisma.workoutExerciseLog.update({
      where: { id: exerciseLog.id },
      data: { completed: isExerciseCompleted },
    });

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
      data.completed !== undefined ? data.completed : setLog.completed;

    const updatedSetLog = await prisma.workoutSetLog.update({
      where: { id },
      data: {
        ...(data.weight !== undefined && { weight: data.weight }),
        ...(data.actualReps !== undefined && { actualReps: data.actualReps }),
        ...(data.restDuration !== undefined && { restDuration: data.restDuration }),
        ...(data.setType !== undefined && { setType: data.setType }),
        ...(data.segmentIndex !== undefined && { segmentIndex: data.segmentIndex }),
        ...(data.isIntermediateSegment !== undefined && {
          isIntermediateSegment: data.isIntermediateSegment,
        }),
        ...(data.isFinalSegment !== undefined && {
          isFinalSegment: data.isFinalSegment,
        }),
        completed: isCompleted,
        completedAt: isCompleted ? (setLog.completedAt ?? new Date()) : null,
      },
    });

    const isExerciseCompleted = await this.evaluateExerciseCompletion(
      exerciseLog.id,
      exerciseLog.targetSets,
    );

    await prisma.workoutExerciseLog.update({
      where: { id: exerciseLog.id },
      data: { completed: isExerciseCompleted },
    });

    await this.updateSessionStats(session.id);

    return updatedSetLog;
  }

  async delete(id: string, memberId: string) {
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
    if (!exerciseLog || !exerciseLog.session) {
      throw new AppError("Exercise log or session not found.", 404);
    }

    if (exerciseLog.session.memberId !== memberId) {
      throw new AppError("Unauthorized.", 403);
    }

    if (exerciseLog.session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    const isParentSet = (setLog.segmentIndex ?? 0) === 0;

    if (isParentSet) {
      // Cascading removal: delete the parent set and all child break sets belonging to this setNumber
      await prisma.workoutSetLog.deleteMany({
        where: {
          exerciseLogId: exerciseLog.id,
          setNumber: setLog.setNumber,
        },
      });

      // Renumber subsequent sets in the exercise to keep continuous sequence (1, 2, 3...)
      const allRemainingSets = await prisma.workoutSetLog.findMany({
        where: { exerciseLogId: exerciseLog.id },
        orderBy: [{ setNumber: "asc" }, { segmentIndex: "asc" }],
      });

      const uniqueSetNumbers = Array.from(
        new Set(allRemainingSets.map((s) => s.setNumber)),
      ).sort((a, b) => a - b);

      for (let i = 0; i < uniqueSetNumbers.length; i++) {
        const currentSetNum = uniqueSetNumbers[i];
        const targetSetNum = i + 1;
        if (currentSetNum !== targetSetNum) {
          await prisma.workoutSetLog.updateMany({
            where: {
              exerciseLogId: exerciseLog.id,
              setNumber: currentSetNum,
            },
            data: {
              setNumber: targetSetNum,
            },
          });
        }
      }
    } else {
      // Child Break Set removal: delete only this child stage
      await prisma.workoutSetLog.delete({
        where: { id },
      });

      // Renumber remaining stages under this parent setNumber to keep segmentIndex contiguous (0, 1, 2...)
      const remainingStages = await prisma.workoutSetLog.findMany({
        where: {
          exerciseLogId: exerciseLog.id,
          setNumber: setLog.setNumber,
        },
        orderBy: { segmentIndex: "asc" },
      });

      for (let i = 0; i < remainingStages.length; i++) {
        const stage = remainingStages[i];
        const isLast = i === remainingStages.length - 1;
        const isIntermediate = !isLast;
        const isFinal = isLast;
        const newSetType = remainingStages.length === 1 ? "NORMAL" : stage.setType;

        if (
          stage.segmentIndex !== i ||
          stage.isIntermediateSegment !== isIntermediate ||
          stage.isFinalSegment !== isFinal ||
          (remainingStages.length === 1 && stage.setType === "DROP_SET")
        ) {
          await prisma.workoutSetLog.update({
            where: { id: stage.id },
            data: {
              segmentIndex: i,
              isIntermediateSegment: isIntermediate,
              isFinalSegment: isFinal,
              setType: newSetType,
            },
          });
        }
      }
    }

    const isExerciseCompleted = await this.evaluateExerciseCompletion(
      exerciseLog.id,
      exerciseLog.targetSets,
    );

    await prisma.workoutExerciseLog.update({
      where: { id: exerciseLog.id },
      data: { completed: isExerciseCompleted },
    });

    await this.updateSessionStats(exerciseLog.sessionId);

    return { message: "Set deleted successfully" };
  }
}

export default new WorkoutSetService();
