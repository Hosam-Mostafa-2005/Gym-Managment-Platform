import WorkoutSetLog from "../models/WorkoutSetLog.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";

import AppError from "../utils/AppError.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import type { CreateWorkoutSetDto } from "../types/workout-set.types.js";

class WorkoutSetService {
  async create(data: CreateWorkoutSetDto) {
    const exerciseLog = await WorkoutExerciseLog.findById(data.exerciseLog);

    if (!exerciseLog) {
      throw new AppError("Exercise log not found.", 404);
    }

    const existingSet = await WorkoutSetLog.findOne({
      exerciseLog: data.exerciseLog,
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

    const session = await WorkoutSession.findById(exerciseLog.session);

    if (session) {
      const totalExercises = await WorkoutExerciseLog.countDocuments({
        session: session._id,
      });

      const completedExercises = await WorkoutExerciseLog.countDocuments({
        session: session._id,
        completed: true,
      });

      session.progress = Math.round(
        (completedExercises / totalExercises) * 100,
      );

      await session.save();
    }

    return setLog;
  }
}

export default new WorkoutSetService();
