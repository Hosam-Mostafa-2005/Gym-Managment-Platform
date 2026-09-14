// src/services/coach-profile.service.ts
import mongoose from "mongoose";
import User from "../models/User.model.js";
import { Assignment } from "../models/Assignment.model.js";
import WorkoutSession from "../models/WorkoutSession.model.js";
import BodyMeasurement from "../models/BodyMeasurement.model.js";
import Workout from "../models/Workout.model.js";
import { Roles, type Role } from "../constants/roles.js";
import { ASSIGNMENT_STATUS } from "../constants/assignment.js";
import { WORKOUT_SESSION_STATUS } from "../constants/workout-session.js";
import AppError from "../utils/AppError.js";
import { mapCoachProfile } from "../mappers/coach-profile.mapper.js";
import type { UpdateCoachProfileDto } from "../types/coach-profile.types.js";
import type { DashboardActivity } from "../types/coach-dashboard.types.js";

type AssignmentMatch = {
  trainer: mongoose.Types.ObjectId;
  isActive: boolean;
};

const TASK_TYPE = {
  ASSIGNMENT_ENDING: "ASSIGNMENT_ENDING",
} as const;

const CHART_DAYS_LONG = 30;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

const ACTIVITY_TYPE = {
  WORKOUT: "WORKOUT",
  ASSIGNMENT: "ASSIGNMENT",
  BODY_MEASUREMENT: "BODY_MEASUREMENT",
} as const;

const ACTIVITY_ACTION = {
  STARTED: "STARTED",
  COMPLETED: "COMPLETED",
  CREATED: "CREATED",
  RECORDED: "RECORDED",
} as const;

const getPastDates = (now: Date, days: number) => {
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    result.push({
      dateStr: d.toISOString().split("T")[0],
    });
  }
  return result;
};

class CoachProfileService {
  async getProfile(userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    const coach = await User.findOne({ _id: userObjectId, isActive: true });
    if (!coach) {
      throw new AppError("Coach not found.", 404);
    }

    const assignmentMatch = { trainer: userObjectId, isActive: true };

    const [
      overview,
      memberStats,
      workoutStats,
      charts,
      recentActivity,
      upcomingTasks,
    ] = await Promise.all([
      this.getOverview(userObjectId, assignmentMatch, now),
      this.getMemberStats(assignmentMatch, now),
      this.getWorkoutStats(userObjectId, assignmentMatch),
      this.getPerformanceCharts(userObjectId, assignmentMatch, now),
      this.getRecentActivity(userObjectId, assignmentMatch, 10),
      this.getUpcomingTasks(assignmentMatch, now, 5),
    ]);

    const achievements = this.calculateAchievements({
      totalMembers: memberStats.active + memberStats.inactive,
      completedSessions: overview.completedSessions,
      workoutsCreated: workoutStats.totalCreated,
      joinedAt: coach.createdAt,
      now,
    });

    return mapCoachProfile({
      coach,
      overview,
      memberStats,
      workoutStats,
      charts,
      recentActivity,
      achievements,
      upcomingTasks,
    });
  }

  async updateProfile(userId: string, role: Role, data: UpdateCoachProfileDto) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const coach = await User.findOne({ _id: userId, isActive: true });
    if (!coach) {
      throw new AppError("Coach not found.", 404);
    }

    if (data.name !== undefined) {
      coach.name = data.name;
    }

    if (data.phone !== undefined) {
      coach.phone = data.phone;
    }

    if (data.bio !== undefined) {
      coach.bio = data.bio;
    }

    if (data.specialties !== undefined) {
      coach.specialties = data.specialties;
    }

    if (data.certifications !== undefined) {
      coach.certifications = data.certifications;
    }

    if (data.yearsOfExperience !== undefined) {
      coach.yearsOfExperience = data.yearsOfExperience;
    }

    await coach.save();

    return {
      id: coach._id.toString(),
      name: coach.name,
      email: coach.email,
      phone: coach.phone,
      bio: coach.bio,
      specialties: coach.specialties,
      certifications: coach.certifications,
      yearsOfExperience: coach.yearsOfExperience,
      joinedAt: coach.createdAt,
    };
  }

  private async getOverview(
    userObjectId: mongoose.Types.ObjectId,
    assignMatch: AssignmentMatch,
    now: Date,
  ) {
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    weekAgo.setHours(0, 0, 0, 0);

    const [
      assignmentsAssigned,
      workoutsCreated,
      sessionsAgg,
      measurementsReviewed,
    ] = await Promise.all([
      Assignment.countDocuments(assignMatch),
      Workout.countDocuments({ createdBy: userObjectId, isActive: true }),
      WorkoutSession.aggregate([
        {
          $lookup: {
            from: "assignments",
            localField: "assignment",
            foreignField: "_id",
            as: "assignDoc",
          },
        },
        { $unwind: "$assignDoc" },
        {
          $match: {
            "assignDoc.isActive": true,
            "assignDoc.trainer": userObjectId,
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      BodyMeasurement.countDocuments({
        trainer: userObjectId,
        isActive: true,
      }),
    ]);

    const activeAssignments = await Assignment.countDocuments({
      ...assignMatch,
      status: ASSIGNMENT_STATUS.ACTIVE,
    });

    const assignmentsMembers =
      await Assignment.find(assignMatch).select("member");
    const activeMembers = [
      ...new Set(assignmentsMembers.map((a) => a.member.toString())),
    ].length;

    const sessStats = sessionsAgg[0] || { total: 0, completed: 0 };
    const completionRate =
      sessStats.total > 0
        ? Math.round((sessStats.completed / sessStats.total) * 100)
        : 0;

    return {
      activeMembers,
      activeAssignments,
      workoutsCreated,
      completedSessions: sessStats.completed,
      completionRate,
      measurementsReviewed,
    };
  }

  private async getMemberStats(assignMatch: AssignmentMatch, now: Date) {
    const assignments = await Assignment.find(assignMatch).populate("member");
    const memberMap = new Map<string, (typeof assignments)[number]["member"]>();

    assignments.forEach((a: any) => {
      if (a.member) {
        memberMap.set(a.member._id.toString(), a.member);
      }
    });

    const members = Array.from(memberMap.values());
    const memberIds = members.map((m) => m._id);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [activeAssignmentsCount, completedProgramsCount] = await Promise.all([
      Assignment.countDocuments({
        ...assignMatch,
        status: ASSIGNMENT_STATUS.ACTIVE,
      }),
      Assignment.countDocuments({
        ...assignMatch,
        status: ASSIGNMENT_STATUS.COMPLETED,
      }),
    ]);

    const newThisMonth = members.filter(
      (m: any) => new Date(m.createdAt) >= startOfMonth,
    ).length;

    const active = activeAssignmentsCount;
    const inactive = Math.max(0, members.length - active);

    return {
      active,
      inactive,
      newThisMonth,
      completedPrograms: completedProgramsCount,
    };
  }

  private async getWorkoutStats(
    userObjectId: mongoose.Types.ObjectId,
    assignMatch: AssignmentMatch,
  ) {
    const [totalCreated, published, mostAssignedAgg] = await Promise.all([
      Workout.countDocuments({
        createdBy: userObjectId,
        isActive: true,
      }),

      Workout.countDocuments({
        createdBy: userObjectId,
        isActive: true,
        isTemplate: false,
      }),

      Assignment.aggregate([
        { $match: assignMatch },
        { $group: { _id: "$workout", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "workouts",
            localField: "_id",
            foreignField: "_id",
            as: "workoutDoc",
          },
        },
        { $unwind: "$workoutDoc" },
        {
          $project: {
            id: "$workoutDoc._id",
            title: "$workoutDoc.title",
            count: 1,
          },
        },
      ]),
    ]);

    const mostAssignedWorkout = mostAssignedAgg[0]
      ? {
          id: mostAssignedAgg[0].id.toString(),
          title: mostAssignedAgg[0].title,
          count: mostAssignedAgg[0].count,
        }
      : null;

    return {
      totalCreated,
      published,
      mostAssignedWorkout,
    };
  }

  private async getPerformanceCharts(
    userObjectId: mongoose.Types.ObjectId,
    assignMatch: AssignmentMatch,
    now: Date,
  ) {
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - CHART_DAYS_LONG);

    const [sessionsAgg, assignmentsAgg] = await Promise.all([
      WorkoutSession.aggregate([
        {
          $lookup: {
            from: "assignments",
            localField: "assignment",
            foreignField: "_id",
            as: "assignDoc",
          },
        },
        { $unwind: "$assignDoc" },
        {
          $match: {
            "assignDoc.trainer": userObjectId,
            startedAt: { $gte: days30Ago },
            isActive: true,
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$startedAt" } },
            count: { $sum: 1 },
            completed: {
              $sum: {
                $cond: [
                  { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      Assignment.aggregate([
        { $match: { ...assignMatch, createdAt: { $gte: days30Ago } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const labels30 = getPastDates(now, CHART_DAYS_LONG);

    const fillData = (
      dates: { dateStr: string }[],
      aggData: Array<{ _id: string } & Record<string, number>>,
      valueMapper: (item: Record<string, any>) => number,
    ) => {
      const lookup = new Map(aggData.map((item) => [item._id, item]));
      return dates.map((d) => {
        const found = lookup.get(d.dateStr);
        return {
          date: d.dateStr,
          value: found ? valueMapper(found) : 0,
        };
      });
    };

    const sessionsLast30Days = fillData(labels30, sessionsAgg, (i) => i.count);
    const membersGrowth = fillData(labels30, assignmentsAgg, (i) => i.count);
    const completionRateTrend = fillData(labels30, sessionsAgg, (i) =>
      i.count > 0 ? Math.round((i.completed / i.count) * 100) : 0,
    );

    return {
      sessionsLast30Days,
      membersGrowth,
      completionRateTrend,
    };
  }

  private async getRecentActivity(
    userObjectId: mongoose.Types.ObjectId,
    assignMatch: AssignmentMatch,
    limit: number,
  ) {
    const [sessions, assignments, measurements] = await Promise.all([
      WorkoutSession.aggregate([
        {
          $lookup: {
            from: "assignments",
            localField: "assignment",
            foreignField: "_id",
            as: "assignDoc",
          },
        },
        { $unwind: "$assignDoc" },
        { $match: { "assignDoc.trainer": userObjectId, isActive: true } },
        { $sort: { startedAt: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: "users",
            localField: "member",
            foreignField: "_id",
            as: "memberDoc",
          },
        },
        { $unwind: "$memberDoc" },
        {
          $lookup: {
            from: "workouts",
            localField: "assignDoc.workout",
            foreignField: "_id",
            as: "workoutDoc",
          },
        },
        { $unwind: "$workoutDoc" },
      ]),
      Assignment.find(assignMatch)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("member", "name")
        .populate("workout", "title"),
      BodyMeasurement.find({ trainer: userObjectId, isActive: true })
        .sort({ measuredAt: -1 })
        .limit(limit)
        .populate("member", "name"),
    ]);

    const events: DashboardActivity[] = [];

    sessions.forEach((s: any) => {
      const title = s.workoutDoc?.title || "Workout";
      if (s.startedAt) {
        events.push({
          type: ACTIVITY_TYPE.WORKOUT,
          member: s.memberDoc,
          date: s.startedAt,
          action: ACTIVITY_ACTION.STARTED,
          metadata: { workoutTitle: title },
        });
      }
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        events.push({
          type: ACTIVITY_TYPE.WORKOUT,
          member: s.memberDoc,
          date: s.endedAt,
          action: ACTIVITY_ACTION.COMPLETED,
          metadata: {
            workoutTitle: title,
            duration: s.duration,
            volume: s.totalVolume,
          },
        });
      }
    });

    assignments.forEach((a: any) => {
      events.push({
        type: ACTIVITY_TYPE.ASSIGNMENT,
        member: a.member,
        date: a.createdAt,
        action: ACTIVITY_ACTION.CREATED,
        metadata: { workoutTitle: a.workout?.title || "Workout" },
      });
    });

    measurements.forEach((m: any) => {
      events.push({
        type: ACTIVITY_TYPE.BODY_MEASUREMENT,
        member: m.member,
        date: m.measuredAt,
        action: ACTIVITY_ACTION.RECORDED,
        metadata: { weight: m.weight, bodyFat: m.bodyFat },
      });
    });

    return events
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit);
  }

  private async getUpcomingTasks(
    assignMatch: AssignmentMatch,
    now: Date,
    limit: number,
  ) {
    const assignments = await Assignment.find({
      ...assignMatch,
      status: ASSIGNMENT_STATUS.ACTIVE,
      endDate: { $gte: now },
    })
      .sort({ endDate: 1 })
      .limit(limit)
      .populate("member", "name")
      .populate("workout", "title");

    return assignments.map((a: any) => {
      const daysRemaining = Math.ceil(
        (new Date(a.endDate).getTime() - now.getTime()) / MS_PER_DAY,
      );

      return {
        type: "ASSIGNMENT_ENDING",
        title: "Assignment Ending Soon",
        description: `"${a.workout?.title}" ends in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`,
        priority:
          daysRemaining <= 2 ? "HIGH" : daysRemaining <= 5 ? "MEDIUM" : "LOW",
        member: a.member,
        dueDate: a.endDate,
      };
    });
  }

  private calculateAchievements(metrics: {
    totalMembers: number;
    completedSessions: number;
    workoutsCreated: number;
    joinedAt: Date;
    now: Date;
  }) {
    const firstYearEarned =
      metrics.now.getTime() - new Date(metrics.joinedAt).getTime() >=
      MS_PER_DAY * 365;

    return [
      {
        title: "First Member",
        description: "Assigned your very first member",
        earned: metrics.totalMembers >= 1,
      },
      {
        title: "10 Members",
        description: "Coached 10 or more members",
        earned: metrics.totalMembers >= 10,
      },
      {
        title: "50 Members",
        description: "Coached 50 or more members",
        earned: metrics.totalMembers >= 50,
      },
      {
        title: "100 Completed Sessions",
        description: "Successfully recorded 100 completed workout sessions",
        earned: metrics.completedSessions >= 100,
      },
      {
        title: "10 Workouts Created",
        description: "Created 10 distinct workout templates",
        earned: metrics.workoutsCreated >= 10,
      },
      {
        title: "First Year Coaching",
        description: "Completed one full year on the platform",
        earned: firstYearEarned,
      },
    ];
  }
}

export default new CoachProfileService();
