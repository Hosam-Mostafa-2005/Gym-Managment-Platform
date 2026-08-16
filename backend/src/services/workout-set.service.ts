import WorkoutSetLog from "../models/WorkoutSetLog.model.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";

import AppError from "../utils/AppError.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import type { CreateWorkoutSetDto } from "../types/workout-set.types.js";
import type { UpdateWorkoutSetDto } from "../types/workout-set.types.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

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

    // Update set
    setLog.weight = data.weight;
    setLog.actualReps = data.actualReps;
    setLog.completed = true;
    setLog.completedAt = new Date();

    await setLog.save();

    // -----------------------------
    // Update Exercise Progress
    // -----------------------------

    const completedSets = await WorkoutSetLog.countDocuments({
      exerciseLog: exerciseLog._id,
      completed: true,
    });

    if (completedSets >= exerciseLog.targetSets) {
      exerciseLog.completed = true;
      await exerciseLog.save();
    }

    // -----------------------------
    // Update Session Progress
    // -----------------------------

    const totalExercises = await WorkoutExerciseLog.countDocuments({
      session: session._id,
    });

    const completedExercises = await WorkoutExerciseLog.countDocuments({
      session: session._id,
      completed: true,
    });

    const exerciseLogIds = await WorkoutExerciseLog.find({
      session: session._id,
    }).distinct("_id");

    const completedWorkoutSets = await WorkoutSetLog.countDocuments({
      exerciseLog: {
        $in: exerciseLogIds,
      },
      completed: true,
    });

    session.progress = Math.round((completedExercises / totalExercises) * 100);

    session.exercisesCompleted = completedExercises;
    session.setsCompleted = completedWorkoutSets;

    await session.save();

    return setLog;
  }
}

export default new WorkoutSetService();
