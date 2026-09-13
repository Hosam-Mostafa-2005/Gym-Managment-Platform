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
import WorkoutSetLog from "../models/WorkoutSetLog.model.js";
import { Roles, type Role } from "../constants/roles.js";

import notificationService from "./notification.service.js";
import { NOTIFICATION_TYPE } from "../constants/notification.js";
class WorkoutSessionService {
  async start(memberId: string, assignmentId: string) {
    const assignment = await Assignment.findOne({
      _id: assignmentId,
      isActive: true,
    })
      .populate("member", "name")
      .populate("trainer", "name")
      .populate("workout", "title");

    if (!assignment) {
      throw new AppError("Assignment not found.", 404);
    }
    const member = assignment.member as any;
    const trainer = assignment.trainer as any;
    const workoutData = assignment.workout as any;

    if (member._id.toString() !== memberId) {
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
      workout.exercises.map(async (item) => {
        try {
          const exercise = item.exercise as any;

          const exerciseLog = await WorkoutExerciseLog.create({
            session: session._id,
            exercise: exercise._id,
            exerciseName: exercise.name,
            targetSets: item.sets,
            targetReps: item.reps,
            order: item.order,
          });

          await Promise.all(
            Array.from({ length: item.sets }).map((_, setIndex) =>
              WorkoutSetLog.create({
                exerciseLog: exerciseLog._id,
                setNumber: setIndex + 1,
                targetReps: item.reps,
              }),
            ),
          );

          return exerciseLog;
        } catch (err) {
          throw err;
        }
      }),
    );

    await notificationService.create({
      user: trainer._id,
      title: "Workout Started",
      message: `${member.name} started "${workoutData.title}".`,
      type: NOTIFICATION_TYPE.WORKOUT_STARTED,
      actionUrl: `/workout-sessions/${session.id}`,
      metadata: {
        sessionId: session.id,
        assignmentId: assignment.id,
      },
    });

    return mapWorkoutSession(session);
  }

  async getCurrent(memberId: string) {
    const session = await WorkoutSession.findOne({
      member: memberId,
      status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
      isActive: true,
    }).populate({
      path: "assignment",
      populate: {
        path: "workout",
      },
    });

    if (!session) {
      return null;
    }

    const exerciseLogs = await WorkoutExerciseLog.find({
      session: session._id,
    })
      .populate("exercise")
      .populate("sets")
      .sort("order");

    return {
      session: mapWorkoutSession(session),
      exerciseLogs,
    };
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

    session.activeTrainingTime = Math.max(
      0,
      session.duration * 60 - session.totalRestTime,
    );

    session.status = WORKOUT_SESSION_STATUS.COMPLETED;

    if (data.notes) {
      session.notes = data.notes;
    }

    await session.save();

    const assignment = await Assignment.findById(session.assignment)
      .populate("member", "name")
      .populate("trainer", "name")
      .populate("workout", "title");

    if (!assignment) {
      return mapWorkoutSession(session);
    }

    const member = assignment.member as any;
    const trainer = assignment.trainer as any;
    const workout = assignment.workout as any;

    await notificationService.create({
      user: trainer._id,
      title: "Workout Completed",
      message: `${member.name} completed "${workout.title}" in ${session.duration} minutes.`,
      type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
      actionUrl: `/workout-sessions/${session.id}`,
      metadata: {
        sessionId: session.id,
        assignmentId: assignment.id,
      },
    });

    await notificationService.create({
      user: member._id,
      title: "Workout Completed",
      message: `Great job! You completed "${workout.title}".`,
      type: NOTIFICATION_TYPE.WORKOUT_COMPLETED,
      actionUrl: `/workout-sessions/${session.id}`,
      metadata: {
        sessionId: session.id,
        assignmentId: assignment.id,
      },
    });

    return mapWorkoutSession(session);
  }

  async getAll(query: ParsedQs, userId: string, role: Role) {
    let filter: any = {
      isActive: true,
    };

    if (role === Roles.MEMBER) {
      filter.member = userId;
    }

    if (role === Roles.TRAINER) {
      const assignments = await Assignment.find({
        trainer: userId,
        isActive: true,
      }).select("_id");

      filter.assignment = {
        $in: assignments.map((a) => a._id),
      };
    }
    const features = new ApiFeatures(
      WorkoutSession.find(filter).populate({
        path: "assignment",
        populate: [
          {
            path: "workout",
          },
          {
            path: "trainer",
            select: "name email",
          },
          {
            path: "member",
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

  async getById(id: string, userId: string, role: Role) {
    let filter: any = {
      _id: id,
      isActive: true,
    };

    if (role === Roles.MEMBER) {
      filter.member = userId;
    }

    if (role === Roles.TRAINER) {
      const assignments = await Assignment.find({
        trainer: userId,
        isActive: true,
      }).select("_id");

      filter.assignment = {
        $in: assignments.map((a) => a._id),
      };
    }

    const session = await WorkoutSession.findOne(filter).populate({
      path: "assignment",
      populate: [
        {
          path: "workout",
        },
        {
          path: "trainer",
          select: "name email",
        },
        {
          path: "member",
          select: "name email",
        },
      ],
    });

    if (!session) {
      throw new AppError("Workout session not found.", 404);
    }

    const exerciseLogs = await WorkoutExerciseLog.find({
      session: session._id,
    })
      .populate("exercise")
      .populate("sets")
      .sort("order");

    return {
      session: mapWorkoutSession(session),
      exerciseLogs,
    };
  }
}

export default new WorkoutSessionService();
