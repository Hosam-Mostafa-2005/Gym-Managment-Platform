import type { ParsedQs } from "qs";

import WorkoutSession from "../models/WorkoutSession.model.js";
import { Assignment } from "../models/Assignment.model.js";

import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";

import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

import type { FinishWorkoutSessionDto } from "../types/workout-session.types.js";
import mapWorkoutSession from "../utils/workout-session.mapper.js";
import WorkoutExerciseLog from "../models/WorkoutExerciseLog.model.js";
import Workout from "../models/Workout.model.js";

class WorkoutSessionService {
  async start(memberId: string, assignmentId: string) {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    });

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }

    if (assignment.member.toString() !== memberId) {
      throw new AppError("You are not allowed to start this assignment.", 403);
    }

    if (assignment.status !== ASSIGNMENT_STATUS.ACTIVE) {
      throw new AppError("Assignment is not active.", 400);
    }

    const activeSession = await WorkoutSession.findOne({
      member: memberId,
      status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
      isActive: true,
    });

    if (activeSession) {
      throw new AppError("You already have an active workout session.", 409);
    }

    // Get workout with exercises
    const workout = await Workout.findById(assignment.workout).populate(
      "exercises.exercise",
    );

    if (!workout) {
      throw new AppError("Workout not found.", 404);
    }

    // Create workout session
    const session = await WorkoutSession.create({
      member: memberId,
      assignment: assignmentId,
    });

    // Create Exercise Logs
    await Promise.all(
      workout.exercises.map(async (item, index) => {
        const exercise = item.exercise as any;

        return WorkoutExerciseLog.create({
          session: session._id,

          exercise: exercise._id,

          exerciseName: exercise.name,

          targetSets: item.sets,

          targetReps: item.reps,

          order: index + 1,
        });
      }),
    );

    return mapWorkoutSession(session);
  }

  async finish(
    sessionId: string,
    memberId: string,
    data: FinishWorkoutSessionDto,
  ) {
    const session = await WorkoutSession.findOne({
      _id: sessionId,
      member: memberId,
      isActive: true,
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    if (session.status !== WORKOUT_SESSION_STATUS.IN_PROGRESS) {
      throw new AppError("Workout session already finished.", 400);
    }

    session.endedAt = new Date();

    session.duration = Math.round(
      (session.endedAt.getTime() - session.startedAt.getTime()) / 60000,
    );

    session.status = WORKOUT_SESSION_STATUS.COMPLETED;

    const assignment = await Assignment.findById(session.assignment);

    if (assignment) {
      assignment.status = ASSIGNMENT_STATUS.COMPLETED;
      await assignment.save();
    }

    if (data.notes) {
      session.notes = data.notes;
    }

    await session.save();

    return mapWorkoutSession(session);
  }

  async getMySessions(memberId: string, query: ParsedQs) {
    const features = new ApiFeatures(
      WorkoutSession.find({
        member: memberId,
        isActive: true,
      }).populate({
        path: "assignment",
        populate: [
          {
            path: "workout",
          },
          {
            path: "trainer",
            select: "name email",
          },
        ],
      }),

      query,
    )
      .filter()
      .sort()
      .paginate();

    return await features.query;
  }

  async getById(id: string, memberId: string) {
    const session = await WorkoutSession.findOne({
      _id: id,
      member: memberId,
      isActive: true,
    }).populate({
      path: "assignment",
      populate: {
        path: "workout",
      },
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exerciseLogs = await WorkoutExerciseLog.find({
      session: session._id,
    })
      .populate("exercise")
      .sort("order");

    return {
      session: mapWorkoutSession(session),
      exerciseLogs,
    };
  }
}

export default new WorkoutSessionService();
