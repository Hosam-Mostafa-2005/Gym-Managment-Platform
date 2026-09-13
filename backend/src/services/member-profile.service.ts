// src/services/member-profile.service.ts
import mongoose from "mongoose";
import User from "../models/User.model.js";
import { Assignment } from "../models/Assignment.model.js";
import BodyMeasurement from "../models/BodyMeasurement.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import AppError from "../utils/AppError.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import { mapMemberProfile } from "../utils/member-profile.mapper.js";

class MemberProfileService {
  private async checkTrainerAccess(trainerId: string, memberId: string) {
    const isAssigned = await Assignment.exists({
      trainer: trainerId,
      member: memberId,
      isActive: true,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });
    if (!isAssigned) {
      throw new AppError("Member is not assigned to you.", 403);
    }
  }

  private async getWorkoutStats(memberObjectId: mongoose.Types.ObjectId) {
    const statsAgg = await WorkoutSession.aggregate([
      {
        $match: {
          member: memberObjectId,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalSessions: { $sum: 1 },
          completedSessions: {
            $sum: {
              $cond: [
                { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                1,
                0,
              ],
            },
          },
          totalDuration: { $sum: "$duration" },
          totalVolume: { $sum: "$totalVolume" },
        },
      },
    ]);

    return statsAgg[0] || null;
  }

  private buildTimeline(
    currentAssignment: any,
    assignmentHistory: any[],
    measurements: any[],
    sessions: any[],
  ) {
    const timeline: any[] = [];

    const allAssignments = currentAssignment
      ? [currentAssignment, ...assignmentHistory]
      : assignmentHistory;

    allAssignments.forEach((a: any) => {
      const workoutTitle = (a.workout as any)?.title || "Unknown Workout";

      timeline.push({
        type: "WORKOUT_ASSIGNED",
        title: "Workout Assigned",
        description: `Assigned "${workoutTitle}"`,
        date: a.createdAt,
      });

      if (a.completedAt) {
        timeline.push({
          type: "ASSIGNMENT_COMPLETED",
          title: "Assignment Completed",
          description: `Completed "${workoutTitle}"`,
          date: a.completedAt,
        });
      }

      if (a.cancelledAt) {
        timeline.push({
          type: "ASSIGNMENT_CANCELLED",
          title: "Assignment Cancelled",
          description: a.cancelReason || "Assignment cancelled.",
          date: a.cancelledAt,
        });
      }
    });

    sessions.forEach((s: any) => {
      const workoutTitle =
        (s.assignment as any)?.workout?.title || "Unknown Workout";

      timeline.push({
        type: "WORKOUT_STARTED",
        title: "Workout Started",
        description: `Started "${workoutTitle}"`,
        date: s.startedAt,
      });

      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        timeline.push({
          type: "WORKOUT_COMPLETED",
          title: "Workout Completed",
          description: `Completed "${workoutTitle}"`,
          date: s.endedAt,
        });
      }
    });

    measurements.forEach((m: any) => {
      timeline.push({
        type: "BODY_MEASUREMENT_RECORDED",
        title: "Body Measurement Recorded",
        description: "A new body measurement was recorded.",
        date: m.measuredAt || m.createdAt,
      });
    });

    timeline.sort((a, b) => {
      if (!a.date || !b.date) return 0;

      return b.date.getTime() - a.date.getTime();
    });

    return timeline.slice(0, 20);
  }

  async getProfile(memberId: string, userId: string, role: Role) {
    // 1. Authorization checks
    if (role === Roles.MEMBER && userId !== memberId) {
      throw new AppError("You can only view your own profile.", 403);
    }
    if (role === Roles.TRAINER) {
      await this.checkTrainerAccess(userId, memberId);
    }

    const memberObjectId = new mongoose.Types.ObjectId(memberId);

    // 2. Fetch the Member to ensure existence and correct role
    const member = await User.findById(memberObjectId);

    if (!member || !member.isActive) {
      throw new AppError("Member not found.", 404);
    }
    if (member.role !== Roles.MEMBER) {
      throw new AppError("Selected user is not a member.", 400);
    }

    // 3. Parallel Queries for Profile Data
    const [
      currentAssignment,
      assignmentHistory,
      measurements,
      recentSessions,
      workoutStats,
    ] = await Promise.all([
      // Current Active Assignment
      Assignment.findOne({
        member: memberObjectId,
        status: ASSIGNMENT_STATUS.ACTIVE,
        isActive: true,
      })
        .populate("workout", "title")
        .populate("trainer", "name"),

      // Assignment History (Excluding ACTIVE)
      Assignment.find({
        member: memberObjectId,
        status: { $ne: ASSIGNMENT_STATUS.ACTIVE },
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .populate("workout", "title")
        .populate("trainer", "name"),

      // Body Measurement History (Fetching up to 20 for timeline purposes)
      BodyMeasurement.find({
        member: memberObjectId,
        isActive: true,
      })
        .sort({ measuredAt: -1 })
        .limit(20),

      // Recent Workout Sessions (Fetching up to 20 for timeline purposes)
      WorkoutSession.find({
        member: memberObjectId,
        isActive: true,
      })
        .sort({ startedAt: -1 })
        .limit(20)
        .populate({
          path: "assignment",
          select: "workout",
          populate: { path: "workout", select: "title" },
        }),

      // Workout Statistics Aggregation
      this.getWorkoutStats(memberObjectId),
    ]);
    const timeline = this.buildTimeline(
      currentAssignment,
      assignmentHistory,
      measurements,
      recentSessions,
    ); // 5. Map and Return Profile using the single object parameter
    return mapMemberProfile({
      member,
      currentAssignment,
      assignmentHistory,
      measurements,
      workoutStats,
      recentSessions,
      timeline,
    });
  }
}

export default new MemberProfileService();
