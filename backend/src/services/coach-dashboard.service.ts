// src/services/coach-dashboard.service.ts
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
import { mapCoachDashboard } from "../mappers/coach-dashboard.mapper.js";
import { PRIORITY, type Priority } from "../constants/dashboard.js";
import type {
  DashboardActivity,
  MemberAttention,
  UpcomingAssignment,
  DashboardPriority,
  QuickActions,
} from "../types/coach-dashboard.types.js";

// ============================================================================
// CONSTANTS
// ============================================================================
const COMPLETION_WEIGHT = 0.6;
const COVERAGE_WEIGHT = 0.4;

const DAYS_INACTIVE = 7;
const DAYS_CRITICAL_INACTIVITY = 14;
const DAYS_MEASUREMENT_OVERDUE = 30;

const DAYS_UPCOMING_ASSIGNMENT = 2;
const DAYS_UPCOMING_ACTION = 3;

const CHART_DAYS_LONG = 30;
const CHART_DAYS_SHORT = 7;

const MAX_RECENT_ACTIVITY = 10;
const MAX_ATTENTION_MEMBERS = 5;
const MAX_UPCOMING_ASSIGNMENTS = 5;
const MAX_RECENT_MEASUREMENTS = 5;

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

// ============================================================================
// HELPERS
// ============================================================================
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

// ============================================================================
// SERVICE
// ============================================================================
class CoachDashboardService {
  async getDashboard(userId: string, role: Role) {
    if (role === Roles.MEMBER) {
      throw new AppError("Forbidden.", 403);
    }

    const isAdmin = role === Roles.ADMIN;
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    let memberIds: mongoose.Types.ObjectId[] | null = null;
    if (!isAdmin) {
      memberIds = await this.getTrainerMemberIds(userObjectId);
    }

    // Explicitly scope matches for different collection shapes
    const memberModelMatch = isAdmin
      ? { role: Roles.MEMBER, isActive: true }
      : { _id: { $in: memberIds }, role: Roles.MEMBER, isActive: true };

    const relatedModelMatch = isAdmin
      ? { isActive: true }
      : { member: { $in: memberIds }, isActive: true };

    const assignmentMatch = isAdmin
      ? { isActive: true }
      : { trainer: userObjectId, isActive: true };

    const [
      overview,
      charts,
      recentActivity,
      membersNeedingAttention,
      upcomingAssignments,
      recentMeasurements,
    ] = await Promise.all([
      this.getOverview(
        memberModelMatch,
        assignmentMatch,
        userObjectId,
        isAdmin,
        now,
      ),
      this.getCharts(relatedModelMatch, assignmentMatch, now),
      this.getRecentActivity(
        relatedModelMatch,
        assignmentMatch,
        MAX_RECENT_ACTIVITY,
      ),
      this.getMembersNeedingAttention(
        memberModelMatch,
        now,
        MAX_ATTENTION_MEMBERS,
      ),
      this.getUpcomingAssignments(
        assignmentMatch,
        now,
        MAX_UPCOMING_ASSIGNMENTS,
      ),
      this.getRecentMeasurements(relatedModelMatch, MAX_RECENT_MEASUREMENTS),
    ]);

    const todaysPriorities = this.buildTodaysPriorities(
      membersNeedingAttention,
      upcomingAssignments,
    );

    const quickActions = this.buildQuickActions(
      membersNeedingAttention,
      upcomingAssignments,
    );

    return mapCoachDashboard({
      overview,
      todaysPriorities,
      charts,
      recentActivity,
      membersNeedingAttention,
      upcomingAssignments,
      recentMeasurements,
      quickActions,
    });
  }

  // ==========================================================================
  // PRIVATE DATA FETCHERS
  // ==========================================================================

  private async getTrainerMemberIds(trainerId: mongoose.Types.ObjectId) {
    const assignments = await Assignment.find({
      trainer: trainerId,
      isActive: true,
      status: ASSIGNMENT_STATUS.ACTIVE,
    }).select("member");

    return [...new Set(assignments.map((a) => a.member.toString()))].map(
      (id) => new mongoose.Types.ObjectId(id),
    );
  }

  private async getOverview(
    memberModelMatch: any,
    assignMatch: any,
    userId: mongoose.Types.ObjectId,
    isAdmin: boolean,
    now: Date,
  ) {
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - CHART_DAYS_SHORT);
    weekAgo.setHours(0, 0, 0, 0);

    const workoutMatch = isAdmin
      ? { isActive: true }
      : { createdBy: userId, isActive: true };

    const [
      totalMembers,
      totalAssignments,
      activeAssignments,
      workoutsCreated,
      sessionsAgg,
      measurementsThisWeek,
    ] = await Promise.all([
      User.countDocuments(memberModelMatch),
      Assignment.countDocuments(assignMatch),
      Assignment.countDocuments({
        ...assignMatch,
        status: ASSIGNMENT_STATUS.ACTIVE,
      }),
      Workout.countDocuments(workoutMatch),

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
            ...(isAdmin ? {} : { "assignDoc.trainer": userId }),
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            completedTotal: {
              $sum: {
                $cond: [
                  { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                  1,
                  0,
                ],
              },
            },
            completedToday: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                      { $gte: ["$startedAt", today] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
            completedWeek: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$status", WORKOUT_SESSION_STATUS.COMPLETED] },
                      { $gte: ["$startedAt", weekAgo] },
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),

      BodyMeasurement.countDocuments({
        ...(isAdmin ? {} : { trainer: userId }),
        measuredAt: { $gte: weekAgo },
        isActive: true,
      }),
    ]);

    const sessStats = sessionsAgg[0] || {
      total: 0,
      completedTotal: 0,
      completedToday: 0,
      completedWeek: 0,
    };

    const completionRate =
      sessStats.total > 0
        ? Math.round((sessStats.completedTotal / sessStats.total) * 100)
        : 0;

    const coverageRatio =
      totalMembers > 0 ? activeAssignments / totalMembers : 0;

    const healthScore = Math.min(
      100,
      Math.round(
        completionRate * COMPLETION_WEIGHT +
          coverageRatio * 100 * COVERAGE_WEIGHT,
      ),
    );

    return {
      totalMembers,
      // Every returned member is active by the applied match.
      activeMembers: totalMembers, // Safely reused instead of duplicate query
      totalAssignments,
      activeAssignments,
      workoutsCreated,
      completedSessionsToday: sessStats.completedToday,
      completedSessionsThisWeek: sessStats.completedWeek,
      completionRate,
      measurementsThisWeek,
      healthScore,
    };
  }

  private async getMembersNeedingAttention(
    memberModelMatch: any,
    now: Date,
    limit: number,
  ) {
    const pipeline: any[] = [
      { $match: memberModelMatch },
      {
        $lookup: {
          from: "workoutsessions",
          let: { mId: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$member", "$$mId"] }, isActive: true },
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
                lastWorkout: { $max: "$startedAt" },
              },
            },
          ],
          as: "sessions",
        },
      },
      {
        $lookup: {
          from: "bodymeasurements",
          let: { mId: "$_id" },
          pipeline: [
            {
              $match: { $expr: { $eq: ["$member", "$$mId"] }, isActive: true },
            },
            {
              $group: { _id: null, latestMeasurement: { $max: "$measuredAt" } },
            },
          ],
          as: "measurements",
        },
      },
      {
        $addFields: {
          sessionData: { $arrayElemAt: ["$sessions", 0] },
          measurementData: { $arrayElemAt: ["$measurements", 0] },
        },
      },
      {
        $addFields: {
          completionRate: {
            $cond: [
              { $gt: ["$sessionData.total", 0] },
              {
                $multiply: [
                  { $divide: ["$sessionData.completed", "$sessionData.total"] },
                  100,
                ],
              },
              0,
            ],
          },
          daysSinceWorkout: {
            $divide: [
              {
                $subtract: [
                  now,
                  { $ifNull: ["$sessionData.lastWorkout", new Date(0)] },
                ],
              },
              MS_PER_DAY,
            ],
          },
          daysSinceMeasurement: {
            $divide: [
              {
                $subtract: [
                  now,
                  {
                    $ifNull: [
                      "$measurementData.latestMeasurement",
                      new Date(0),
                    ],
                  },
                ],
              },
              MS_PER_DAY,
            ],
          },
        },
      },
      {
        $addFields: {
          reasons: {
            $concatArrays: [
              {
                $cond: [
                  { $gt: ["$daysSinceWorkout", DAYS_INACTIVE] },
                  [`No workout in over ${DAYS_INACTIVE} days`],
                  [],
                ],
              },
              {
                $cond: [
                  { $gt: ["$daysSinceMeasurement", DAYS_MEASUREMENT_OVERDUE] },
                  [`No body measurement in ${DAYS_MEASUREMENT_OVERDUE}+ days`],
                  [],
                ],
              },
              {
                $cond: [
                  {
                    $and: [
                      { $lt: ["$completionRate", 40] },
                      { $gt: ["$sessionData.total", 0] },
                    ],
                  },
                  ["Completion rate below 40%"],
                  [],
                ],
              },
            ],
          },
        },
      },
      { $match: { $expr: { $gt: [{ $size: "$reasons" }, 0] } } },
      { $sort: { daysSinceWorkout: -1, daysSinceMeasurement: -1 } },
      { $limit: limit },
    ];

    const results = await User.aggregate(pipeline);

    return results.map(
      (r: any): MemberAttention => ({
        member: { _id: r._id, name: r.name, email: r.email },
        reasons: r.reasons,
        lastWorkout: r.sessionData?.lastWorkout || null,
        completionRate: Math.round(r.completionRate),
        latestMeasurement: r.measurementData?.latestMeasurement || null,
        daysSinceWorkout: r.daysSinceWorkout,
        daysSinceMeasurement: r.daysSinceMeasurement,
      }),
    );
  }

  private async getUpcomingAssignments(
    assignMatch: any,
    now: Date,
    limit: number,
  ): Promise<UpcomingAssignment[]> {
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
      const daysRemaining = Math.max(
        0,
        Math.ceil((a.endDate.getTime() - now.getTime()) / MS_PER_DAY),
      );
      return {
        member: a.member,
        workout: a.workout,
        endDate: a.endDate,
        daysRemaining,
      };
    });
  }

  private async getRecentMeasurements(relatedModelMatch: any, limit: number) {
    return await BodyMeasurement.find(relatedModelMatch)
      .sort({ measuredAt: -1 })
      .limit(limit)
      .populate("member", "name email")
      .populate("trainer", "name");
  }

  private async getRecentActivity(
    relatedModelMatch: any,
    assignMatch: any,
    limit: number,
  ): Promise<DashboardActivity[]> {
    const [sessions, assignments, measurements] = await Promise.all([
      WorkoutSession.find(relatedModelMatch)
        .sort({ startedAt: -1 })
        .limit(limit)
        .populate("member", "name")
        .populate({
          path: "assignment",
          populate: { path: "workout", select: "title" },
        }),
      Assignment.find(assignMatch)
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("member", "name")
        .populate("workout", "title"),
      BodyMeasurement.find(relatedModelMatch)
        .sort({ measuredAt: -1 })
        .limit(limit)
        .populate("member", "name"),
    ]);

    const events: DashboardActivity[] = [];

    sessions.forEach((s: any) => {
      const title = s.assignment?.workout?.title || "Workout";
      if (s.startedAt) {
        events.push({
          type: ACTIVITY_TYPE.WORKOUT,
          member: s.member,
          date: s.startedAt,
          action: ACTIVITY_ACTION.STARTED,
          metadata: { workoutTitle: title },
        });
      }
      if (s.status === WORKOUT_SESSION_STATUS.COMPLETED && s.endedAt) {
        events.push({
          type: ACTIVITY_TYPE.WORKOUT,
          member: s.member,
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
      if (a.status === ASSIGNMENT_STATUS.COMPLETED && a.completedAt) {
        events.push({
          type: ACTIVITY_TYPE.ASSIGNMENT,
          member: a.member,
          date: a.completedAt,
          action: ACTIVITY_ACTION.COMPLETED,
          metadata: { workoutTitle: a.workout?.title || "Workout" },
        });
      }
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

  private async getCharts(relatedModelMatch: any, assignMatch: any, now: Date) {
    const days30Ago = new Date(now);
    days30Ago.setDate(days30Ago.getDate() - CHART_DAYS_LONG);

    const days7Ago = new Date(now);
    days7Ago.setDate(days7Ago.getDate() - CHART_DAYS_SHORT);

    const [sessionsAgg, measurementsAgg, assignmentsAgg] = await Promise.all([
      WorkoutSession.aggregate([
        {
          $match: {
            ...relatedModelMatch,
            startedAt: { $gte: days30Ago },
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
      BodyMeasurement.aggregate([
        {
          $match: {
            ...relatedModelMatch,
            measuredAt: { $gte: days30Ago },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$measuredAt" } },
            count: { $sum: 1 },
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
    const labels7 = getPastDates(now, CHART_DAYS_SHORT);

    const sessions30 = this.fillChartData(
      labels30,
      sessionsAgg,
      (i) => i.count,
    );
    const sessions7 = this.fillChartData(labels7, sessionsAgg, (i) => i.count);
    const measurements30 = this.fillChartData(
      labels30,
      measurementsAgg,
      (i) => i.count,
    );
    const assignments30 = this.fillChartData(
      labels30,
      assignmentsAgg,
      (i) => i.count,
    );

    const completionRate30 = this.fillChartData(labels30, sessionsAgg, (i) =>
      i.count > 0 ? Math.round((i.completed / i.count) * 100) : 0,
    );

    return {
      sessions: { last7Days: sessions7, last30Days: sessions30 },
      measurements: { last30Days: measurements30 },
      assignments: { last30Days: assignments30 },
      completionRateTrend: { last30Days: completionRate30 },
    };
  }

  // ==========================================================================
  // DATA SYNTHESIZERS
  // ==========================================================================

  private fillChartData(
    dates: any[],
    aggData: any[],
    valueMapper: (item: any) => number,
  ) {
    const lookup = new Map(aggData.map((item) => [item._id, item]));

    return dates.map((d) => {
      const found = lookup.get(d.dateStr);
      return {
        date: d.dateStr,
        value: found ? valueMapper(found) : 0,
      };
    });
  }

  private buildTodaysPriorities(
    membersNeedingAttention: MemberAttention[],
    upcomingAssignments: UpcomingAssignment[],
  ): DashboardPriority[] {
    const prioritiesMap = new Map<string, any>();

    // Process Members Needing Attention
    membersNeedingAttention.forEach((m) => {
      const id = m.member._id.toString();
      let priority: Priority = PRIORITY.LOW;

      const hasLongInactivity = m.daysSinceWorkout > DAYS_INACTIVE;
      const hasExtremeInactivity =
        m.daysSinceWorkout > DAYS_CRITICAL_INACTIVITY;

      if (hasExtremeInactivity) priority = PRIORITY.CRITICAL;
      else if (hasLongInactivity) priority = PRIORITY.HIGH;
      else priority = PRIORITY.MEDIUM;

      prioritiesMap.set(id, {
        member: m.member,
        priority,
        reasons: [...m.reasons],
      });
    });

    // Process Upcoming Assignments
    upcomingAssignments.forEach((a) => {
      if (a.daysRemaining <= DAYS_UPCOMING_ASSIGNMENT) {
        const id = a.member._id.toString();
        const reason = `Assignment "${a.workout?.title}" ends in ${a.daysRemaining} days`;

        if (prioritiesMap.has(id)) {
          const current = prioritiesMap.get(id);
          current.reasons.push(reason);
          // Escalate priority if it was LOW
          if (current.priority === PRIORITY.LOW) {
            current.priority = PRIORITY.MEDIUM;
          }
        } else {
          prioritiesMap.set(id, {
            member: a.member,
            priority: PRIORITY.MEDIUM,
            reasons: [reason],
          });
        }
      }
    });

    // Format map back to array and ensure structure
    return Array.from(prioritiesMap.values()).map((p) => {
      let title = "Member Needs Attention";
      let description = p.reasons[0];

      if (p.reasons.some((r: string) => r.includes("workout"))) {
        title = "Workout Follow-up";
        description =
          "This member has been inactive and should be followed up.";
      } else if (p.reasons.some((r: string) => r.includes("Completion"))) {
        title = "Low Workout Completion";
        description = "This member has a low workout completion rate.";
      } else if (p.reasons.some((r: string) => r.includes("measurement"))) {
        title = "Measurement Review";
        description = "This member needs a new body measurement.";
      } else if (p.reasons.some((r: string) => r.includes("Assignment"))) {
        title = "Assignment Ending Soon";
        description = "A workout assignment is about to expire.";
      }

      return {
        type: "MEMBER_ACTION",
        priority: p.priority,
        title,
        description,
        member: p.member,
        reasons: p.reasons,
        count: p.reasons.length,
      };
    });
  }

  private buildQuickActions(
    membersNeedingAttention: MemberAttention[],
    upcomingAssignments: UpcomingAssignment[],
  ): QuickActions {
    const inactiveMembers = membersNeedingAttention.filter((m) =>
      m.reasons.some((r: string) => r.includes("workout")),
    ).length;

    const overdueMeasurements = membersNeedingAttention.filter((m) =>
      m.reasons.some((r: string) => r.includes("measurement")),
    ).length;

    const assignmentsEndingSoon = upcomingAssignments.filter(
      (a) => a.daysRemaining <= DAYS_UPCOMING_ACTION,
    ).length;

    return {
      inactiveMembers,
      overdueMeasurements,
      assignmentsEndingSoon,
    };
  }
}

export default new CoachDashboardService();
