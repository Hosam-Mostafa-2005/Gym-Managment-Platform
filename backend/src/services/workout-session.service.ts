import type { ParsedQs } from "qs";

import WorkoutSession from "../models/WorkoutSession.model.js";
import { Assignment } from "../models/Assignment.model.js";

import ApiFeatures from "../utils/ApiFeatures.js";
import AppError from "../utils/AppError.js";

import { ASSIGNMENT_STATUS } from "../constants/assignment.js";

import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

import type { FinishWorkoutSessionDto } from "../types/workout-session.types.js";
import mapWorkoutSession from "../utils/workout-session.mapper.js";

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

    const session = await WorkoutSession.create({
      member: memberId,
      assignment: assignmentId,
    });

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
      }).populate("assignment"),
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

    return mapWorkoutSession(session);
  }
}

export default new WorkoutSessionService();
