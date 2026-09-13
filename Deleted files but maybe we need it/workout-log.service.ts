import WorkoutLog from "../models/WorkoutLog.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import Exercise from "../models/Exercise.model.js";
import { Assignment } from "../models/Assignment.model.js";
import Workout from "../models/Workout.model.js";

import AppError from "../utils/AppError.js";

import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

import type {
  CreateWorkoutLogDto,
  UpdateWorkoutLogDto,
} from "../types/workout-log.types.js";

class WorkoutLogService {
  async create(data: CreateWorkoutLogDto, memberId: string) {
    const session = await WorkoutSession.findOne({
      _id: data.session,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }
    if (session.member.toString() !== memberId) {
      throw new AppError("You are not allowed to log this workout.", 403);
    }
    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session is already completed.", 400);
    }
    const exercise = await Exercise.findOne({
      _id: data.exercise,
      isActive: true,
    });

    if (!exercise) {
      throw new AppError("Exercise not found.", 404);
    }
    const assignment = await Assignment.findById(session.assignment);

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }
    const workout = await Workout.findById(assignment.workout);

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }
    const exists = workout.exercises.some(
      (item) => item.exercise.toString() === data.exercise,
    );

    if (!exists) {
      throw new AppError("Exercise does not belong to this workout.", 400);
    }
    const existingLog = await WorkoutLog.findOne({
      session: data.session,
      exercise: data.exercise,
      isActive: true,
    });

    if (existingLog) {
      throw new AppError("Exercise already logged.", 409);
    }
    const log = await WorkoutLog.create(data);

    return log;
  }
  async getSessionLogs(sessionId: string, memberId: string) {
    const session = await WorkoutSession.findOne({
      _id: sessionId,
      member: memberId,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const logs = await WorkoutLog.find({
      session: sessionId,
      isActive: true,
    }).populate("exercise");

    return logs;
  }
  async update(id: string, data: UpdateWorkoutLogDto, memberId: string) {
    const log = await WorkoutLog.findOne({
      _id: id,
      isActive: true,
    });

    if (!log) {
      throw new AppError("Workout log not found.", 404);
    }

    const session = await WorkoutSession.findOne({
      _id: log.session,
      member: memberId,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session is already completed.", 400);
    }

    if (data.exercise) {
      const exercise = await Exercise.findOne({
        _id: data.exercise,
        isActive: true,
      });

      if (!exercise) {
        throw new AppError("Exercise not found.", 404);
      }

      const assignment = await Assignment.findById(session.assignment);

      if (!assignment) {
        throw new AppError("Assignment not found.", 404);
      }

      const workout = await Workout.findById(assignment.workout);

      if (!workout) {
        throw new AppError("Workout not found.", 404);
      }

      const exists = workout.exercises.some(
        (item) => item.exercise.toString() === data.exercise,
      );

      if (!exists) {
        throw new AppError("Exercise does not belong to this workout.", 400);
      }

      const duplicate = await WorkoutLog.findOne({
        session: log.session,
        exercise: data.exercise,
        isActive: true,
        _id: { $ne: id },
      });

      if (duplicate) {
        throw new AppError("Exercise already logged.", 409);
      }
    }

    Object.assign(log, data);

    await log.save();

    return log;
  }
  async delete(id: string, memberId: string) {
    const log = await WorkoutLog.findOne({
      _id: id,
      isActive: true,
    });

    if (!log) {
      throw new AppError("Workout log not found.", 404);
    }

    const session = await WorkoutSession.findOne({
      _id: log.session,
      member: memberId,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session is already completed.", 400);
    }

    log.isActive = false;

    await log.save();
  }
}

export default new WorkoutLogService();
