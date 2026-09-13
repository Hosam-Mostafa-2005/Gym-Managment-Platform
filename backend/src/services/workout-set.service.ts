import WorkoutSetLog from "../models/WorkoutSetLog.model.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import AppError from "../utils/AppError.js";

import type { CreateWorkoutSetDto } from "../types/workout-set.types.js";
import type { UpdateWorkoutSetDto } from "../types/workout-set.types.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

class WorkoutSetService {
  private async updateSessionStats(sessionId: string) {
    const session = await WorkoutSession.findById(sessionId);

    if (!session) return;

    const exerciseLogIds = await WorkoutExerciseLog.find({
      session: session._id,
    }).distinct("_id");

    const totalVolumeResult = await WorkoutSetLog.aggregate([
      {
        $match: {
          exerciseLog: {
            $in: exerciseLogIds,
          },
          completed: true,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: {
              $multiply: ["$weight", "$actualReps"],
            },
          },
        },
      },
    ]);

    const restResult = await WorkoutSetLog.aggregate([
      {
        $match: {
          exerciseLog: { $in: exerciseLogIds },
          completed: true,
        },
      },
      {
        $group: {
          _id: null,
          total: {
            $sum: "$restDuration",
          },
        },
      },
    ]);

    const totalExercises = await WorkoutExerciseLog.countDocuments({
      session: session._id,
    });

    const completedExercises = await WorkoutExerciseLog.countDocuments({
      session: session._id,
      completed: true,
    });

    const completedWorkoutSets = await WorkoutSetLog.countDocuments({
      exerciseLog: {
        $in: exerciseLogIds,
      },
      completed: true,
    });

    session.totalVolume = totalVolumeResult[0]?.total || 0;

    session.progress =
      totalExercises > 0
        ? Math.round((completedExercises / totalExercises) * 100)
        : 0;

    session.exercisesCompleted = completedExercises;
    session.setsCompleted = completedWorkoutSets;
    session.totalRestTime = restResult[0]?.total || 0;

    await session.save();
  }

  async create(data: CreateWorkoutSetDto, memberId: string) {
    const exerciseLog = await WorkoutExerciseLog.findById(data.exerciseLog);

    if (!exerciseLog) {
      throw new AppError("Exercise log not found.", 404);
    }

    const session = await WorkoutSession.findById(exerciseLog.session);

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }
    if (session.member.toString() !== memberId) {
      throw new AppError("Unauthorized.", 403);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    const existingSet = await WorkoutSetLog.findOne({
      exerciseLog: exerciseLog._id,
      setNumber: data.setNumber,
    });

    if (existingSet) {
      throw new AppError("This set already exists.", 409);
    }

    const setLog = await WorkoutSetLog.create({
      exerciseLog: data.exerciseLog,
      setNumber: data.setNumber,
      targetReps: data.targetReps,
      actualReps: data.actualReps,
      weight: data.weight,
      startedAt: new Date(),
      completedAt: new Date(),
      completed: true,
    });

    // Count completed sets
    const completedSets = await WorkoutSetLog.countDocuments({
      exerciseLog: data.exerciseLog,
      completed: true,
    });

    // If all target sets are completed
    if (completedSets >= exerciseLog.targetSets) {
      exerciseLog.completed = true;
      await exerciseLog.save();
    }

    await this.updateSessionStats(exerciseLog.session.toString());

    return setLog;
  }

  async update(id: string, memberId: string, data: UpdateWorkoutSetDto) {
    const setLog = await WorkoutSetLog.findById(id);

    if (!setLog) {
      throw new AppError("Workout set not found.", 404);
    }

    const exerciseLog = await WorkoutExerciseLog.findById(setLog.exerciseLog);

    if (!exerciseLog) {
      throw new AppError("Exercise log not found.", 404);
    }

    const session = await WorkoutSession.findById(exerciseLog.session);

    if (!session || session.member.toString() !== memberId) {
      throw new AppError("Unauthorized.", 403);
    }

    // Session must still be active
    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    // 1. Update set
    if (data.weight !== undefined) setLog.weight = data.weight;

    if (data.actualReps !== undefined) setLog.actualReps = data.actualReps;

    setLog.completed = true;
    if (!setLog.completedAt) {
      setLog.completedAt = new Date();
    }
    await setLog.save();

    // 2. Update Exercise Progress
    const completedSets = await WorkoutSetLog.countDocuments({
      exerciseLog: exerciseLog._id,
      completed: true,
    });

    if (completedSets >= exerciseLog.targetSets) {
      exerciseLog.completed = true;
      await exerciseLog.save();
    }

    // 3. Get Session Exercise Logs
    await this.updateSessionStats(session._id.toString());

    return setLog;
  }
}

export default new WorkoutSetService();
