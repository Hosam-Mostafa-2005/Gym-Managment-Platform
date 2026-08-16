import User from "../models/User.model.js";
import Exercise from "../models/Exercise.model.js";
import Workout from "../models/Workout.model.js";
import { Assignment } from "../models/Assignment.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import WorkoutLog from "../models/WorkoutLog.model.js";

import { Roles } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";

class DashboardService {
  async getTrainerDashboard() {
    const totalMembers = await User.countDocuments({
      role: Roles.MEMBER,
      isActive: true,
    });
    const totalExercises = await Exercise.countDocuments({
      isActive: true,
    });
    const totalWorkouts = await Workout.countDocuments({
      isActive: true,
    });
    const activeAssignments = await Assignment.countDocuments({
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
    });
    const activeSessions = await WorkoutSession.countDocuments({
      status: WORKOUT_SESSION_STATUS.IN_PROGRESS,
      isActive: true,
    });
    const completedSessions = await WorkoutSession.countDocuments({
      status: WORKOUT_SESSION_STATUS.COMPLETED,
      isActive: true,
    });
    return {
      totalMembers,
      totalExercises,
      totalWorkouts,
      activeAssignments,
      activeSessions,
      completedSessions,
    };
  }

  async getMemberDashboard(memberId: string) {
    const activeAssignment = await Assignment.findOne({
      member: memberId,
      status: ASSIGNMENT_STATUS.ACTIVE,
      isActive: true,
    }).populate("workout");

    const totalSessions = await WorkoutSession.countDocuments({
      member: memberId,
      isActive: true,
    });

    const completedSessions = await WorkoutSession.countDocuments({
      member: memberId,
      status: WORKOUT_SESSION_STATUS.COMPLETED,
      isActive: true,
    });
    const lastWorkout = await WorkoutSession.findOne({
      member: memberId,
    })
      .sort({ startedAt: -1 })
      .populate({
        path: "assignment",
        populate: {
          path: "workout",
        },
      });
    const recentLogs = await WorkoutLog.find()
      .populate({
        path: "session",
        match: {
          member: memberId,
        },
      })
      .populate("exercise")
      .sort({
        performedAt: -1,
      })
      .limit(5);
    return {
      activeAssignment,
      totalSessions,
      completedSessions,
      lastWorkout,
      recentLogs,
    };
  }
}

export default new DashboardService();
